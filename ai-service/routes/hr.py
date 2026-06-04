"""
HR Interview Routes — Python FastAPI

Mô-đun này xử lý 3 endpoint chính cho chức năng Phỏng vấn HR:
1. POST /ai/hr/generate-questions   — Sinh 10 câu hỏi HR
2. POST /ai/hr/evaluate-answer      — Đánh giá 1 câu trả lời (5 tiêu chí)
3. POST /ai/hr/final-evaluation     — Tổng kết cuối bài sau 10 câu

Kiến trúc:
- Pydantic schemas validate input/output
- Prompt templates inject ngữ cảnh vào rubric
- call_openai() gọi OpenAI API với response_format=json
- Fallback logic khi API key thiếu hoặc lỗi
"""

import json
import os
import traceback
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

from services.openai_service import call_openai
from prompts.hr_prompts import (
    HR_GENERATE_QUESTIONS_PROMPT,
    HR_EVALUATE_ANSWER_PROMPT,
    HR_FINAL_EVALUATION_PROMPT
)

router = APIRouter(prefix="/ai/hr", tags=["HR Interview"])


# ═══════════════════════════════════════════════
# Pydantic Schemas (Request / Response)
# ═══════════════════════════════════════════════

class GenerateHrQuestionsRequest(BaseModel):
    role: str = Field(..., description="Vai trò ứng tuyển, ví dụ: Lập trình viên Backend")
    difficulty: str = Field(..., description="Mức độ: Intern | Fresher | Junior")
    tech_stack: List[str] = Field(default=[], description="Danh sách công nghệ")
    total_questions: int = Field(default=10, ge=1, le=20)

class GeneratedQuestion(BaseModel):
    questionIndex: int
    category: str
    questionText: str
    expectedAnswerGuide: str

class GenerateHrQuestionsResponse(BaseModel):
    questions: List[GeneratedQuestion]

class EvaluateHrAnswerRequest(BaseModel):
    role: str
    difficulty: str
    tech_stack: List[str] = []
    question: str
    answer: str

class StarScoreItem(BaseModel):
    score: float
    feedback: str

class StarAnalysis(BaseModel):
    situation: StarScoreItem
    task: StarScoreItem
    action: StarScoreItem
    result: StarScoreItem

class StarChecklist(BaseModel):
    situation: bool
    task: bool
    action: bool
    result: bool

class ImprovedAnswer(BaseModel):
    situation: str
    task: str
    action: str
    result: str

class EvaluateHrAnswerResponse(BaseModel):
    overallScore: float
    level: str
    summary: str
    starCompletion: int
    starChecklist: StarChecklist
    starAnalysis: StarAnalysis
    strengths: List[str]
    weaknesses: List[str]
    improvementSuggestions: List[str]
    improvedAnswer: ImprovedAnswer
    nextRecommendation: str
    # Legacy fields (kept for backward compatibility with C# parsing)
    questionScore: float = 0
    feedback: str = ""

class AnswerSummaryItem(BaseModel):
    question: str
    answer: str
    score: float
    feedback: str

class FinalEvaluationRequest(BaseModel):
    session_id: str
    role: str
    difficulty: str
    answers: List[AnswerSummaryItem]

class RoadmapItem(BaseModel):
    title: str
    description: str

class FinalEvaluationResponse(BaseModel):
    hrFinalScore: float
    level: str
    summary: str
    overallStrengths: List[str]
    overallWeaknesses: List[str]
    improvementRoadmap: List[RoadmapItem]
    readinessLevel: str
    status: str = "completed"


# ═══════════════════════════════════════════════
# Endpoint 1: Sinh 10 câu hỏi HR
# ═══════════════════════════════════════════════

@router.post("/generate-questions", response_model=GenerateHrQuestionsResponse)
async def generate_hr_questions(req: GenerateHrQuestionsRequest):
    """
    Sinh câu hỏi HR phù hợp với role, difficulty và tech stack.
    
    Logic:
    1. Inject thông tin ứng viên vào prompt template
    2. Gọi OpenAI → bắt trả JSON
    3. Parse và validate qua Pydantic schema
    4. Nếu API key lỗi → trả fallback 10 câu hỏi mẫu
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("AIza"):
        return GenerateHrQuestionsResponse(questions=_build_fallback_questions(req.role, req.difficulty))

    try:
        tech_str = ", ".join(req.tech_stack) if req.tech_stack else "General IT"
        prompt = HR_GENERATE_QUESTIONS_PROMPT.format(
            role=req.role,
            difficulty=req.difficulty,
            tech_stack=tech_str,
            total_questions=req.total_questions
        )
        
        result = await call_openai(prompt)
        questions = result.get("questions", [])
        
        # Validate minimum count
        if len(questions) < req.total_questions:
            # Bổ sung câu hỏi fallback nếu AI trả thiếu
            fallback = _build_fallback_questions(req.role, req.difficulty)
            for i in range(len(questions), req.total_questions):
                questions.append(fallback[i].__dict__ if hasattr(fallback[i], '__dict__') else fallback[i])
        
        return GenerateHrQuestionsResponse(
            questions=[GeneratedQuestion(**q) for q in questions[:req.total_questions]]
        )
    except Exception as e:
        print(f"[HR] Error generating questions: {e}")
        traceback.print_exc()
        return GenerateHrQuestionsResponse(questions=_build_fallback_questions(req.role, req.difficulty))


# ═════════════════════════════════════════════
# Endpoint 2: Đánh giá câu trả lời theo rubric STAR
# ═════════════════════════════════════════════

@router.post("/evaluate-answer", response_model=EvaluateHrAnswerResponse)
async def evaluate_hr_answer(req: EvaluateHrAnswerRequest):
    """
    Đánh giá câu trả lời HR theo framework STAR với rubric đầy đủ.
    Output gồm: starAnalysis, starChecklist, improvedAnswer, nextRecommendation.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("AIza"):
        return _build_fallback_evaluation()

    try:
        tech_str = ", ".join(req.tech_stack) if req.tech_stack else "General IT"
        prompt = HR_EVALUATE_ANSWER_PROMPT.format(
            role=req.role,
            difficulty=req.difficulty,
            tech_stack=tech_str,
            question=req.question,
            answer=req.answer
        )
        
        result = await call_openai(prompt)

        # Parse starAnalysis
        star_raw = result.get("starAnalysis", {})
        def _parse_star_item(data, key):
            item = data.get(key, {})
            return StarScoreItem(
                score=float(item.get("score", 0)),
                feedback=item.get("feedback", "")
            )

        star_analysis = StarAnalysis(
            situation=_parse_star_item(star_raw, "situation"),
            task=_parse_star_item(star_raw, "task"),
            action=_parse_star_item(star_raw, "action"),
            result=_parse_star_item(star_raw, "result")
        )

        # Tính lại overallScore theo trọng số STAR để đảm bảo chính xác
        s_score = star_analysis.situation.score
        t_score = star_analysis.task.score
        a_score = star_analysis.action.score
        r_score = star_analysis.result.score
        recalculated_score = round(s_score * 0.20 + t_score * 0.20 + a_score * 0.30 + r_score * 0.30, 1)

        # Ưưu tiên dùng overallScore từ AI, nhưng fallback về giá trị tính lại
        overall = float(result.get("overallScore", recalculated_score))
        level = _get_level(overall)

        # Parse starChecklist
        checklist_raw = result.get("starChecklist", {})
        checklist = StarChecklist(
            situation=bool(checklist_raw.get("situation", False)),
            task=bool(checklist_raw.get("task", False)),
            action=bool(checklist_raw.get("action", False)),
            result=bool(checklist_raw.get("result", False))
        )

        # starCompletion
        completion_count = sum([
            checklist.situation, checklist.task, checklist.action, checklist.result
        ])
        star_completion = int(result.get("starCompletion", completion_count * 25))

        # Parse improvedAnswer
        improved_raw = result.get("improvedAnswer", {})
        improved = ImprovedAnswer(
            situation=improved_raw.get("situation", ""),
            task=improved_raw.get("task", ""),
            action=improved_raw.get("action", ""),
            result=improved_raw.get("result", "")
        )

        return EvaluateHrAnswerResponse(
            overallScore=overall,
            level=level,
            summary=result.get("summary", ""),
            starCompletion=star_completion,
            starChecklist=checklist,
            starAnalysis=star_analysis,
            strengths=result.get("strengths", []),
            weaknesses=result.get("weaknesses", []),
            improvementSuggestions=result.get("improvementSuggestions", []),
            improvedAnswer=improved,
            nextRecommendation=result.get("nextRecommendation", ""),
            questionScore=overall,
            feedback=result.get("summary", "")
        )
    except Exception as e:
        print(f"[HR] Error evaluating answer: {e}")
        return _build_fallback_evaluation()


# ═══════════════════════════════════════════════
# Endpoint 3: Tổng kết cuối bài
# ═══════════════════════════════════════════════

@router.post("/final-evaluation", response_model=FinalEvaluationResponse)
async def final_evaluation(req: FinalEvaluationRequest):
    """
    Tổng kết toàn bộ phiên phỏng vấn HR sau 10 câu.
    
    Logic:
    1. Tổng hợp 10 cặp câu hỏi-trả lời thành summary text
    2. Gọi AI tạo đánh giá tổng quan + roadmap cải thiện
    3. Tính hrFinalScore = trung bình 10 questionScore
    4. Xác định readinessLevel dựa trên điểm
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("AIza"):
        avg = round(sum(a.score for a in req.answers) / max(len(req.answers), 1), 1)
        return _build_fallback_final(avg, req.difficulty)

    try:
        # Tạo bản tóm tắt 10 câu cho AI
        answers_text = ""
        for i, ans in enumerate(req.answers, 1):
            answers_text += f"\nCâu {i}:\n"
            answers_text += f"  Hỏi: {ans.question}\n"
            answers_text += f"  Trả lời: {ans.answer[:300]}{'...' if len(ans.answer) > 300 else ''}\n"
            answers_text += f"  Điểm: {ans.score}/10\n"
            answers_text += f"  Nhận xét: {ans.feedback}\n"
        
        prompt = HR_FINAL_EVALUATION_PROMPT.format(
            role=req.role,
            difficulty=req.difficulty,
            session_id=req.session_id,
            answers_summary=answers_text
        )
        
        result = await call_openai(prompt)
        
        # Tính điểm trung bình thực tế từ dữ liệu (không tin hoàn toàn AI)
        actual_avg = round(sum(a.score for a in req.answers) / max(len(req.answers), 1), 1)
        final_score = result.get("hrFinalScore", actual_avg)
        
        # Xử lý improvementRoadmap
        roadmap_raw = result.get("improvementRoadmap", [])
        roadmap = []
        for item in roadmap_raw:
            if isinstance(item, dict):
                roadmap.append(RoadmapItem(
                    title=item.get("title", "Luyện tập"),
                    description=item.get("description", "Tiếp tục cải thiện kỹ năng phỏng vấn.")
                ))
        
        if not roadmap:
            roadmap = [
                RoadmapItem(title="Luyện STAR method", description="Chuẩn bị mỗi câu trả lời theo 4 phần."),
                RoadmapItem(title="Bổ sung ví dụ thực tế", description="Dùng dự án cá nhân hoặc nhóm để minh họa."),
                RoadmapItem(title="Mock interview", description="Luyện phỏng vấn giả định để tăng phản xạ.")
            ]
        
        return FinalEvaluationResponse(
            hrFinalScore=final_score,
            level=result.get("level", _get_level(final_score)),
            summary=result.get("summary", "Ứng viên đã hoàn thành phỏng vấn HR."),
            overallStrengths=result.get("overallStrengths", ["Hoàn thành đủ 10 câu"]),
            overallWeaknesses=result.get("overallWeaknesses", ["Cần luyện thêm"]),
            improvementRoadmap=roadmap,
            readinessLevel=result.get("readinessLevel", _get_readiness(final_score, req.difficulty)),
            status="completed"
        )
    except Exception as e:
        print(f"[HR] Error in final evaluation: {e}")
        traceback.print_exc()
        avg = round(sum(a.score for a in req.answers) / max(len(req.answers), 1), 1)
        return _build_fallback_final(avg, req.difficulty)


# ═══════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════

def _get_level(score: float) -> str:
    """Quy đổi điểm số → mức đánh giá bằng tiếng Việt."""
    if score >= 9.0: return "Xuất sắc"
    if score >= 8.0: return "Tốt"
    if score >= 7.0: return "Khá"
    if score >= 5.0: return "Trung bình"
    return "Cần cải thiện nhiều"


def _get_readiness(score: float, difficulty: str) -> str:
    """Xác định mức độ sẵn sàng phỏng vấn."""
    if score >= 8.0:
        return f"Sẵn sàng phỏng vấn {difficulty}"
    if score >= 6.0:
        return f"Cần luyện thêm trước khi phỏng vấn {difficulty}"
    return "Cần chuẩn bị kỹ hơn"


def _build_fallback_questions(role: str, difficulty: str) -> list:
    """Trả 10 câu hỏi mẫu khi AI Service lỗi."""
    categories = [
        "Giới thiệu bản thân", "Mục tiêu nghề nghiệp", "Điểm mạnh / điểm yếu",
        "Làm việc nhóm", "Xử lý mâu thuẫn", "Áp lực deadline",
        "Học công nghệ mới", "Tư duy giải quyết vấn đề",
        "Trách nhiệm trong dự án", "Lý do phù hợp vị trí"
    ]
    questions = [
        "Hãy giới thiệu ngắn gọn về bản thân bạn.",
        f"Mục tiêu nghề nghiệp 3 năm tới của bạn trong ngành IT là gì?",
        "Điểm mạnh lớn nhất của bạn là gì? Hãy kể ví dụ cụ thể.",
        "Hãy kể về một lần bạn làm việc nhóm trong dự án lập trình.",
        "Bạn xử lý thế nào khi không đồng ý với ý kiến của thành viên khác trong team?",
        "Bạn làm gì khi gặp deadline gấp mà còn nhiều task chưa hoàn thành?",
        "Kể về một công nghệ mới bạn đã tự học gần đây và cách bạn tiếp cận.",
        "Khi gặp một bug khó, quy trình debug của bạn như thế nào?",
        "Hãy mô tả một dự án bạn chịu trách nhiệm chính và vai trò của bạn.",
        f"Vì sao bạn nghĩ mình phù hợp với vị trí {role} ở cấp độ {difficulty}?"
    ]
    
    return [
        GeneratedQuestion(
            questionIndex=i + 1,
            category=categories[i],
            questionText=questions[i],
            expectedAnswerGuide="Ứng viên nên trả lời có cấu trúc STAR với ví dụ cụ thể."
        )
        for i in range(10)
    ]


def _build_fallback_evaluation(question: str = "", answer: str = "", role: str = "Developer", difficulty: str = "Fresher") -> EvaluateHrAnswerResponse:
    """Tạo kết quả đánh giá thông minh giả lập (smart fallback) khi không có API key hoặc lỗi quota."""
    if not answer or len(answer.strip()) < 10:
        fallback_star = StarScoreItem(score=2.0, feedback="Câu trả lời quá ngắn để đánh giá.")
        return EvaluateHrAnswerResponse(
            overallScore=2.0,
            level="Cần cải thiện",
            summary="Câu trả lời quá ngắn. Vui lòng cung cấp chi tiết hơn.",
            starCompletion=0,
            starChecklist=StarChecklist(situation=False, task=False, action=False, result=False),
            starAnalysis=StarAnalysis(situation=fallback_star, task=fallback_star, action=fallback_star, result=fallback_star),
            strengths=["Đã phản hồi câu hỏi"],
            weaknesses=["Nội dung quá ngắn, thiếu tất cả các phần của STAR"],
            improvementSuggestions=["Hãy kể chi tiết một tình huống thực tế theo cấu trúc STAR"],
            improvedAnswer=ImprovedAnswer(
                situation="Trong dự án X khi tôi làm...",
                task="Nhiệm vụ của tôi là...",
                action="Tôi đã thực hiện các bước...",
                result="Kết quả là dự án hoàn thành..."
            ),
            nextRecommendation="Hãy viết câu trả lời dài hơn (từ 150 từ).",
            questionScore=2.0,
            feedback="Câu trả lời quá ngắn."
        )

    # Phân tích sơ bộ từ khóa để chấm điểm giả lập
    ans_lower = answer.lower()
    
    # 1. Situation check
    sit_keywords = ["dự án", "bối cảnh", "khi", "lúc", "gặp", "khó khăn", "tình huống", "ở trường", "công ty", "khách hàng"]
    has_sit = any(kw in ans_lower for kw in sit_keywords)
    sit_score = 7.5 if has_sit else 4.0
    if len(answer) > 200: sit_score += 1.0
    sit_score = min(9.5, sit_score)
    sit_feedback = "Mô tả bối cảnh rõ ràng về dự án hoặc vấn đề phát sinh." if has_sit else "Bối cảnh tình huống chưa rõ ràng. Bạn nên nêu rõ dự án nào, xảy ra khi nào."

    # 2. Task check
    task_keywords = ["nhiệm vụ", "trách nhiệm", "vai trò", "cần phải", "yêu cầu", "phần việc", "mục tiêu", "task", "backend", "frontend"]
    has_task = any(kw in ans_lower for kw in task_keywords)
    task_score = 7.0 if has_task else 4.5
    if len(answer) > 250: task_score += 1.0
    task_score = min(9.0, task_score)
    task_feedback = "Nêu được vai trò cá nhân hoặc mục tiêu cần đạt được." if has_task else "Chưa làm nổi bật nhiệm vụ cụ thể của bản thân trong tình huống này."

    # 3. Action check
    action_keywords = ["tìm kiếm", "xem lại", "trao đổi", "thảo luận", "sửa", "viết", "lập trình", "code", "khắc phục", "giải quyết", "phân tích", "làm việc", "thực hiện"]
    has_action = any(kw in ans_lower for kw in action_keywords)
    action_score = 7.5 if has_action else 4.0
    if len(answer) > 300: action_score += 1.0
    action_score = min(9.5, action_score)
    action_feedback = "Có liệt kê các hành động cụ thể để giải quyết vấn đề." if has_action else "Cần bổ sung các hành động cụ thể của cá nhân bạn để giải quyết vấn đề."

    # 4. Result check
    result_keywords = ["cuối cùng", "kết quả", "đúng hạn", "hoàn thành", "bài học", "rút ra", "học được", "thành công", "đạt được"]
    has_result = any(kw in ans_lower for kw in result_keywords)
    result_score = 7.0 if has_result else 4.0
    if len(answer) > 200: result_score += 1.0
    result_score = min(9.0, result_score)
    result_feedback = "Nêu được kết quả đạt được và bài học kinh nghiệm rút ra." if has_result else "Kết quả chưa rõ ràng hoặc thiếu bài học rút ra sau trải nghiệm."

    # Tính điểm tổng
    overall = round(sit_score * 0.20 + task_score * 0.20 + action_score * 0.30 + result_score * 0.30, 1)
    
    # Checklist
    checklist = StarChecklist(
        situation=has_sit,
        task=has_task,
        action=has_action,
        result=has_result
    )
    
    completion_count = sum([has_sit, has_task, has_action, has_result])
    star_completion = completion_count * 25

    level = _get_level(overall)

    # Tạo feedback động
    strengths = []
    if has_sit: strengths.append("Bối cảnh tình huống được đặt ra cụ thể, giúp người nghe dễ hình dung.")
    if has_action: strengths.append("Liệt kê các bước hành động thực tế để giải quyết vấn đề.")
    if len(strengths) < 2: strengths.append("Trình bày mạch lạc, dễ hiểu.")

    weaknesses = []
    if not has_task: weaknesses.append("Chưa làm rõ trách nhiệm cụ thể của bản thân trong nhiệm vụ đó.")
    if not has_result: weaknesses.append("Thiếu số liệu minh họa kết quả cụ thể hoặc bài học đúc kết.")
    if len(answer) < 150: weaknesses.append("Câu trả lời hơi ngắn, có thể bổ sung chi tiết để thuyết phục hơn.")
    if not weaknesses: weaknesses.append("Có thể tối ưu thêm bằng cách đưa vào các số liệu đo lường cụ thể.")

    suggestions = [
        "Sử dụng thêm các số liệu định lượng (ví dụ: tối ưu bao nhiêu % time, sửa trong bao lâu).",
        "Làm rõ hơn vai trò cá nhân của bạn thay vì nói chung chung về team.",
        "Nhấn mạnh bài học kinh nghiệm hoặc kỹ năng đã cải thiện được sau sự cố."
    ]

    # Gợi ý bài làm cải thiện (STAR)
    improved = ImprovedAnswer(
        situation=f"Trong một dự án {role} gần đây, hệ thống gặp sự cố kết nối database nghiêm trọng ngay trước ngày demo.",
        task="Nhiệm vụ của tôi là định vị nguyên nhân và khắc phục sự cố trong vòng 2 tiếng để kịp bàn giao.",
        action="Tôi đã kiểm tra connection pool, phát hiện rò rỉ kết nối, tối ưu lại câu lệnh config và trao đổi với team để phân chia công việc kiểm thử.",
        result="Kết quả là lỗi được xử lý sau 1.5 giờ, hệ thống hoạt động ổn định và buổi demo thành công tốt đẹp."
    )

    return EvaluateHrAnswerResponse(
        overallScore=overall,
        level=level,
        summary=f"Ứng viên trả lời khá tốt câu hỏi về khó khăn. Cấu trúc đạt {star_completion}% chuẩn STAR.",
        starCompletion=star_completion,
        starChecklist=checklist,
        starAnalysis=StarAnalysis(
            situation=StarScoreItem(score=sit_score, feedback=sit_feedback),
            task=StarScoreItem(score=task_score, feedback=task_feedback),
            action=StarScoreItem(score=action_score, feedback=action_feedback),
            result=StarScoreItem(score=result_score, feedback=result_feedback)
        ),
        strengths=strengths,
        weaknesses=weaknesses,
        improvementSuggestions=suggestions,
        improvedAnswer=improved,
        nextRecommendation="Hãy tiếp tục luyện tập thêm các câu hỏi xử lý mâu thuẫn sử dụng cấu trúc STAR.",
        questionScore=overall,
        feedback=f"Ứng viên có kỹ năng tốt, đạt điểm tổng quan {overall}/10."
    )


def _build_fallback_final(avg_score: float, difficulty: str) -> FinalEvaluationResponse:
    """Trả kết quả tổng kết mặc định khi AI không khả dụng."""
    return FinalEvaluationResponse(
        hrFinalScore=avg_score,
        level=_get_level(avg_score),
        summary="Tổng kết tự động do AI Service tạm thời không khả dụng.",
        overallStrengths=["Hoàn thành đủ 10 câu hỏi phỏng vấn"],
        overallWeaknesses=["Không thể phân tích chi tiết lúc này"],
        improvementRoadmap=[
            RoadmapItem(title="Luyện STAR method", description="Chuẩn bị theo 4 bước: Situation, Task, Action, Result."),
            RoadmapItem(title="Bổ sung ví dụ thực tế", description="Dùng dự án cá nhân hoặc nhóm để minh họa."),
            RoadmapItem(title="Mock interview", description="Luyện phỏng vấn giả định để tăng phản xạ.")
        ],
        readinessLevel=_get_readiness(avg_score, difficulty),
        status="completed"
    )
