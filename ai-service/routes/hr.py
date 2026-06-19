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

from services.openai_service import call_openai, call_openai_with_usage
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

class TokenUsageInfo(BaseModel):
    inputTokens: int = 0
    outputTokens: int = 0
    totalTokens: int = 0
    model: str = "gpt-4o-mini"

class GenerateHrQuestionsResponse(BaseModel):
    questions: List[GeneratedQuestion]
    usage: Optional[TokenUsageInfo] = None

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
    usage: Optional[TokenUsageInfo] = None

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
    usage: Optional[TokenUsageInfo] = None


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

        result, usage_data = await call_openai_with_usage(prompt)
        questions = result.get("questions", [])

        # Validate minimum count
        if len(questions) < req.total_questions:
            # Bổ sung câu hỏi fallback nếu AI trả thiếu
            fallback = _build_fallback_questions(req.role, req.difficulty)
            for i in range(len(questions), req.total_questions):
                questions.append(fallback[i].__dict__ if hasattr(fallback[i], '__dict__') else fallback[i])

        return GenerateHrQuestionsResponse(
            questions=[GeneratedQuestion(**q) for q in questions[:req.total_questions]],
            usage=TokenUsageInfo(**usage_data)
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
    # 2. CHẶN CÂU TRẢ LỜI QUÁ NGẮN TRƯỚC KHI GỌI AI
    if not req.answer or len(req.answer.strip()) < 30:
        return _build_short_answer_evaluation(req.question, req.role, req.difficulty)

    # 4. THÊM HELPER PHÁT HIỆN CÂU TRẢ LỜI VÔ NGHĨA / QUA LOA
    if _is_low_quality_answer(req.answer):
        return _build_low_quality_answer_evaluation(req.question, req.answer)

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("AIza"):
        return _build_fallback_evaluation(question=req.question, answer=req.answer, role=req.role, difficulty=req.difficulty)

    try:
        tech_str = ", ".join(req.tech_stack) if req.tech_stack else "General IT"
        prompt = HR_EVALUATE_ANSWER_PROMPT.format(
            role=req.role,
            difficulty=req.difficulty,
            tech_stack=tech_str,
            question=req.question,
            answer=req.answer
        )

        result, usage_data = await call_openai_with_usage(prompt)

        # Parse starAnalysis
        star_raw = result.get("starAnalysis", {})
        def _parse_star_item(data, key):
            item = data.get(key, {})
            return StarScoreItem(
                score=_clamp_score(item.get("score", 0)),
                feedback=item.get("feedback") or "Chưa có nhận xét chi tiết."
            )

        star_analysis = StarAnalysis(
            situation=_parse_star_item(star_raw, "situation"),
            task=_parse_star_item(star_raw, "task"),
            action=_parse_star_item(star_raw, "action"),
            result=_parse_star_item(star_raw, "result")
        )

        # Parse starChecklist
        checklist_raw = result.get("starChecklist", {})
        checklist = StarChecklist(
            situation=bool(checklist_raw.get("situation", False)),
            task=bool(checklist_raw.get("task", False)),
            action=bool(checklist_raw.get("action", False)),
            result=bool(checklist_raw.get("result", False))
        )

        # 7. STAR COMPLETION PHẢI TÍNH THEO CHECKLIST
        completion_count = sum([
            checklist.situation, checklist.task, checklist.action, checklist.result
        ])
        star_completion = completion_count * 25

        # 5. BACKEND PHẢI TỰ TÍNH LẠI OVERALL SCORE
        s_score = star_analysis.situation.score
        t_score = star_analysis.task.score
        a_score = star_analysis.action.score
        r_score = star_analysis.result.score
        overall = s_score * 0.20 + t_score * 0.20 + a_score * 0.30 + r_score * 0.30

        # 6. THÊM LUẬT GIỚI HẠN ĐIỂM THEO STAR CHECKLIST
        if not checklist.result:
            overall = min(overall, 7.0)
        if not checklist.action:
            overall = min(overall, 6.5)
        if not checklist.task:
            overall = min(overall, 7.0)
        if not checklist.situation:
            overall = min(overall, 7.0)

        # Nếu thiếu cả Action và Result:
        if not checklist.action and not checklist.result:
            overall = min(overall, 6.0)

        # Nếu starCompletion <= 25:
        if star_completion <= 25:
            overall = min(overall, 4.0)

        overall = round(_clamp_score(overall), 1)
        level = _get_level(overall)

        # 10. SUMMARY PHẢI PHẢN ÁNH ĐÚNG STAR
        if star_completion == 100:
            summary = "Câu trả lời có đủ 4 phần STAR. Bạn đã trình bày khá rõ bối cảnh, nhiệm vụ, hành động và kết quả."
        elif not checklist.action:
            summary = "Câu trả lời chưa làm rõ hành động cá nhân, vì vậy AI chưa thể đánh giá tốt năng lực xử lý tình huống."
        elif not checklist.result:
            summary = "Câu trả lời có một số ý tốt nhưng phần Result chưa rõ, nên mức độ thuyết phục chưa cao."
        else:
            summary = result.get("summary") or "Đánh giá hoàn thành một phần cấu trúc STAR."

        # 3. THÊM BACKEND POST-PROCESSING ĐỂ CHẶN STRENGTH GIẢ
        word_count = len(req.answer.strip().split())
        strengths = _sanitize_strengths(
            result.get("strengths", []),
            overall,
            star_completion,
            word_count,
            checklist
        )

        # Parse improvedAnswer
        improved_raw = result.get("improvedAnswer", {})
        # If AI didn't return, fallback to generic
        improved = ImprovedAnswer(
            situation=improved_raw.get("situation") or "Trong một dự án hoặc tình huống học tập, tôi từng gặp một vấn đề cần xử lý liên quan đến câu hỏi này.",
            task=improved_raw.get("task") or "Nhiệm vụ của tôi là xác định vấn đề, chịu trách nhiệm phần việc được giao và đóng góp giải pháp phù hợp.",
            action=improved_raw.get("action") or "Tôi chủ động trao đổi với các thành viên, phân tích nguyên nhân, ưu tiên việc quan trọng và thực hiện các bước cần thiết để cải thiện tình huống.",
            result=improved_raw.get("result") or "Kết quả là vấn đề được xử lý tốt hơn, nhóm phối hợp hiệu quả hơn và tôi rút ra bài học về cách làm việc chuyên nghiệp."
        )

        return EvaluateHrAnswerResponse(
            overallScore=overall,
            level=level,
            summary=summary,
            starCompletion=star_completion,
            starChecklist=checklist,
            starAnalysis=star_analysis,
            strengths=strengths,
            weaknesses=result.get("weaknesses", []),
            improvementSuggestions=result.get("improvementSuggestions", []),
            improvedAnswer=improved,
            nextRecommendation=result.get("nextRecommendation", ""),
            questionScore=overall,
            feedback=summary,
            usage=TokenUsageInfo(**usage_data)
        )
    except Exception as e:
        print(f"[HR] Error evaluating answer: {e}")
        return _build_fallback_evaluation(question=req.question, answer=req.answer, role=req.role, difficulty=req.difficulty)


# ═══════════════════════════════════════════════
# Endpoint 3: Tổng kết cuối bài
# ═══════════════════════════════════════════════

@router.post("/final-evaluation", response_model=FinalEvaluationResponse)
async def final_evaluation(req: FinalEvaluationRequest):
    """
    Tổng kết toàn bộ phiên phỏng vấn HR sau 10 câu.
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

        result, usage_data = await call_openai_with_usage(prompt)

        # 12. FINAL EVALUATION: Ưu tiên actual_avg
        actual_avg = round(sum(a.score for a in req.answers) / max(len(req.answers), 1), 1)
        final_score = actual_avg

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
            level=_get_level(final_score),
            summary=result.get("summary", "Ứng viên đã hoàn thành phỏng vấn HR."),
            overallStrengths=result.get("overallStrengths", ["Hoàn thành đủ 10 câu"]),
            overallWeaknesses=result.get("overallWeaknesses", ["Cần luyện thêm"]),
            improvementRoadmap=roadmap,
            readinessLevel=_get_readiness(final_score, req.difficulty),
            status="completed",
            usage=TokenUsageInfo(**usage_data)
        )
    except Exception as e:
        print(f"[HR] Error in final evaluation: {e}")
        traceback.print_exc()
        avg = round(sum(a.score for a in req.answers) / max(len(req.answers), 1), 1)
        return _build_fallback_final(avg, req.difficulty)


# ═══════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════

def _clamp_score(score) -> float:
    """1. THÊM HELPER CLAMP SCORE"""
    try:
        value = float(score)
        return max(0.0, min(10.0, value))
    except:
        return 0.0


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


def _build_short_answer_evaluation(question: str = "", role: str = "Developer", difficulty: str = "Fresher") -> EvaluateHrAnswerResponse:
    """3. TẠO HÀM _build_short_answer_evaluation"""
    fallback_star = StarScoreItem(score=0.0, feedback="Câu trả lời quá ngắn để đánh giá.")
    summary = "Câu trả lời quá ngắn và chưa đủ thông tin để đánh giá theo STAR."
    
    # 8. FALLBACK IMPROVED ANSWER KHÔNG ĐƯỢC BỊA LỆCH CHỦ ĐỀ
    improved = ImprovedAnswer(
        situation="Trong một dự án hoặc tình huống học tập, tôi từng gặp một vấn đề cần xử lý liên quan đến câu hỏi này.",
        task="Nhiệm vụ của tôi là xác định vấn đề, chịu trách nhiệm phần việc được giao và đóng góp giải pháp phù hợp.",
        action="Tôi chủ động trao đổi với các thành viên, phân tích nguyên nhân, ưu tiên việc quan trọng và thực hiện các bước cần thiết để cải thiện tình huống.",
        result="Kết quả là vấn đề được xử lý tốt hơn, nhóm phối hợp hiệu quả hơn và tôi rút ra bài học về cách làm việc chuyên nghiệp."
    )
    
    return EvaluateHrAnswerResponse(
        overallScore=2.0,
        level="Cần cải thiện nhiều",
        summary=summary,
        starCompletion=0,
        starChecklist=StarChecklist(situation=False, task=False, action=False, result=False),
        starAnalysis=StarAnalysis(
            situation=fallback_star,
            task=fallback_star,
            action=fallback_star,
            result=fallback_star
        ),
        strengths=[],
        weaknesses=[
            "Câu trả lời quá ngắn.",
            "Không có cấu trúc STAR.",
            "Không có ví dụ thực tế."
        ],
        improvementSuggestions=[
            "Hãy viết ít nhất 4–6 câu theo cấu trúc Situation, Task, Action, Result.",
            "Bổ sung một tình huống cụ thể từ dự án, học tập hoặc công việc.",
            "Nêu rõ bạn đã làm gì và kết quả đạt được."
        ],
        improvedAnswer=improved,
        nextRecommendation="Bạn nên luyện lại câu hỏi này với một ví dụ thực tế và đầy đủ 4 phần STAR.",
        questionScore=2.0,
        feedback=summary
    )


def _is_low_quality_answer(answer: str) -> bool:
    """4. THÊM HELPER PHÁT HIỆN CÂU TRẢ LỜI VÔ NGHĨA / QUA LOA"""
    text = (answer or "").strip().lower()
    words = text.split()

    low_quality_phrases = [
        "không biết",
        "em không biết",
        "chắc là",
        "làm được",
        "cứ yên tâm",
        "không rõ",
        "khó nói",
        "em sẽ cố gắng",
        "tùy tình huống",
        "bình thường",
        "ổn thôi",
        "ok",
        "dạ",
        "ừm"
    ]

    if len(text) < 30:
        return True

    if len(words) < 20:
        return True

    if any(p in text for p in low_quality_phrases) and len(words) < 40:
        return True

    return False


def _build_low_quality_answer_evaluation(question: str, answer: str) -> EvaluateHrAnswerResponse:
    """5. TẠO HÀM _build_low_quality_answer_evaluation"""
    word_count = len((answer or "").strip().split())
    overall = 3.0 if word_count < 10 else 4.0
    fallback_star = StarScoreItem(score=0.0, feedback="Câu trả lời chưa đủ thông tin hoặc đi lệch trọng tâm.")
    summary = "Câu trả lời chưa trả lời trực tiếp câu hỏi và chưa có đủ cấu trúc STAR để đánh giá tốt."
    
    improved = ImprovedAnswer(
        situation="Trong một dự án hoặc tình huống học tập, tôi từng gặp một vấn đề cần xử lý liên quan đến câu hỏi này.",
        task="Nhiệm vụ của tôi là xác định vấn đề, chịu trách nhiệm phần việc được giao và đóng góp giải pháp phù hợp.",
        action="Tôi chủ động trao đổi với các thành viên, phân tích nguyên nhân, ưu tiên việc quan trọng và thực hiện các bước cần thiết để cải thiện tình huống.",
        result="Kết quả là vấn đề được xử lý tốt hơn, nhóm phối hợp hiệu quả hơn và tôi rút ra bài học về cách làm việc chuyên nghiệp."
    )
    
    return EvaluateHrAnswerResponse(
        overallScore=overall,
        level="Cần cải thiện nhiều",
        summary=summary,
        starCompletion=0,
        starChecklist=StarChecklist(situation=False, task=False, action=False, result=False),
        starAnalysis=StarAnalysis(
            situation=fallback_star,
            task=fallback_star,
            action=fallback_star,
            result=fallback_star
        ),
        strengths=[],
        weaknesses=[
            "Câu trả lời chưa đi vào trọng tâm câu hỏi.",
            "Không có ví dụ thực tế.",
            "Không có cấu trúc STAR.",
            "Câu trả lời mang tính cảm tính, chưa chứng minh năng lực xử lý tình huống."
        ],
        improvementSuggestions=[
            "Hãy chọn một tình huống thực tế từ học tập, dự án hoặc công việc.",
            "Trả lời theo thứ tự Situation → Task → Action → Result.",
            "Nói rõ bạn đã làm gì thay vì chỉ nói chung chung.",
            "Kết thúc bằng kết quả cụ thể hoặc bài học rút ra."
        ],
        improvedAnswer=improved,
        nextRecommendation="Bạn nên luyện lại câu hỏi này bằng một ví dụ thực tế và viết đủ 4 phần STAR.",
        questionScore=overall,
        feedback=summary
    )


def _sanitize_strengths(strengths: list, overall: float, star_completion: int, word_count: int, checklist: StarChecklist) -> list:
    """3. THÊM BACKEND POST-PROCESSING ĐỂ CHẶN STRENGTH GIẢ"""
    banned_generic_strengths = [
        "trình bày mạch lạc",
        "dễ hiểu",
        "ngắn gọn",
        "có cố gắng",
        "thái độ tích cực",
        "tự tin",
        "khá tốt",
        "ổn"
    ]

    if overall < 4.0:
        return []

    if star_completion < 50:
        return []

    if word_count < 20:
        return []

    if not any([checklist.situation, checklist.task, checklist.action, checklist.result]):
        return []

    clean = []
    for s in strengths or []:
        text = s.strip()
        lower = text.lower()

        if not text:
            continue

        if any(banned in lower for banned in banned_generic_strengths):
            continue

        clean.append(text)

    return clean[:5]


def _build_fallback_evaluation(question: str = "", answer: str = "", role: str = "Developer", difficulty: str = "Fresher") -> EvaluateHrAnswerResponse:
    """9. CẢI THIỆN FALLBACK EVALUATION"""
    if not answer or len(answer.strip()) < 30:
        return _build_short_answer_evaluation(question, role, difficulty)

    if _is_low_quality_answer(answer):
        return _build_low_quality_answer_evaluation(question, answer)

    ans_lower = answer.lower()
    
    # Phân tích sơ bộ từ khóa để chấm điểm giả lập
    sit_keywords = ["dự án", "bối cảnh", "khi", "lúc", "gặp", "khó khăn", "tình huống", "ở trường", "công ty", "khách hàng"]
    has_sit = any(kw in ans_lower for kw in sit_keywords)
    sit_score = 7.5 if has_sit else 4.0
    if len(answer) > 200: sit_score += 1.0
    sit_score = min(9.5, sit_score)
    # Giới hạn điểm nếu thiếu phần STAR
    if not has_sit:
        sit_score = min(5.0, sit_score)
    sit_feedback = "Mô tả bối cảnh rõ ràng về dự án hoặc vấn đề phát sinh." if has_sit else "Bối cảnh tình huống chưa rõ ràng. Bạn nên nêu rõ dự án nào, xảy ra khi nào."

    task_keywords = ["nhiệm vụ", "trách nhiệm", "vai trò", "cần phải", "yêu cầu", "phần việc", "mục tiêu", "task", "backend", "frontend"]
    has_task = any(kw in ans_lower for kw in task_keywords)
    task_score = 7.0 if has_task else 4.5
    if len(answer) > 250: task_score += 1.0
    task_score = min(9.0, task_score)
    if not has_task:
        task_score = min(5.0, task_score)
    task_feedback = "Nêu được vai trò cá nhân hoặc mục tiêu cần đạt được." if has_task else "Chưa làm nổi bật nhiệm vụ cụ thể của bản thân trong tình huống này."

    action_keywords = ["tìm kiếm", "xem lại", "trao đổi", "thảo luận", "sửa", "viết", "lập trình", "code", "khắc phục", "giải quyết", "phân tích", "làm việc", "thực hiện"]
    has_action = any(kw in ans_lower for kw in action_keywords)
    action_score = 7.5 if has_action else 4.0
    if len(answer) > 300: action_score += 1.0
    action_score = min(9.5, action_score)
    if not has_action:
        action_score = min(4.0, action_score)
    action_feedback = "Có liệt kê các hành động cụ thể để giải quyết vấn đề." if has_action else "Cần bổ sung các hành động cụ thể của cá nhân bạn để giải quyết vấn đề."

    result_keywords = ["cuối cùng", "kết quả", "đúng hạn", "hoàn thành", "bài học", "rút ra", "học được", "thành công", "đạt được"]
    has_result = any(kw in ans_lower for kw in result_keywords)
    result_score = 7.0 if has_result else 4.0
    if len(answer) > 200: result_score += 1.0
    result_score = min(9.0, result_score)
    if not has_result:
        result_score = min(5.0, result_score)
    result_feedback = "Nêu được kết quả đạt được và bài học kinh nghiệm rút ra." if has_result else "Kết quả chưa rõ ràng hoặc thiếu bài học rút ra sau trải nghiệm."

    # Clamp scores
    sit_score = _clamp_score(sit_score)
    task_score = _clamp_score(task_score)
    action_score = _clamp_score(action_score)
    result_score = _clamp_score(result_score)

    # Tính điểm tổng
    overall = sit_score * 0.20 + task_score * 0.20 + action_score * 0.30 + result_score * 0.30
    
    # Checklist
    checklist = StarChecklist(
        situation=has_sit,
        task=has_task,
        action=has_action,
        result=has_result
    )
    
    completion_count = sum([has_sit, has_task, has_action, has_result])
    star_completion = completion_count * 25

    # Áp dụng cap giống mục 6
    if not checklist.result:
        overall = min(overall, 7.0)
    if not checklist.action:
        overall = min(overall, 6.5)
    if not checklist.task:
        overall = min(overall, 7.0)
    if not checklist.situation:
        overall = min(overall, 7.0)

    # Nếu thiếu cả Action và Result:
    if not checklist.action and not checklist.result:
        overall = min(overall, 6.0)

    # Nếu starCompletion <= 25:
    if star_completion <= 25:
        overall = min(overall, 4.0)

    # Nếu câu trả lời dưới 150 ký tự thì overall tối đa 6.5
    if len(answer.strip()) < 150:
        overall = min(overall, 6.5)

    overall = round(_clamp_score(overall), 1)
    level = _get_level(overall)

    # 10. SUMMARY PHẢI PHẢN ÁNH ĐÚNG STAR
    if star_completion == 100:
        summary = "Câu trả lời có đủ 4 phần STAR. Bạn đã trình bày khá rõ bối cảnh, nhiệm vụ, hành động và kết quả."
    elif not checklist.action:
        summary = "Câu trả lời chưa làm rõ hành động cá nhân, vì vậy AI chưa thể đánh giá tốt năng lực xử lý tình huống."
    elif not checklist.result:
        summary = "Câu trả lời có một số ý tốt nhưng phần Result chưa rõ, nên mức độ thuyết phục chưa cao."
    else:
        summary = f"Ứng viên trả lời khá tốt câu hỏi. Cấu trúc đạt {star_completion}% chuẩn STAR."

    # 6. SỬA FALLBACK EVALUATION KHÔNG ĐƯỢC THÊM STRENGTH GIẢ
    strengths = []
    if has_sit:
        strengths.append("Có đề cập đến bối cảnh tình huống (Situation).")
    if has_action:
        strengths.append("Có nêu một số hành động xử lý vấn đề (Action).")
        
    word_count = len(answer.strip().split())
    strengths = _sanitize_strengths(strengths, overall, star_completion, word_count, checklist)

    # Weaknesses matching the quality
    weaknesses = []
    if not has_sit: weaknesses.append("Chưa làm rõ bối cảnh tình huống (Situation).")
    if not has_task: weaknesses.append("Chưa làm rõ trách nhiệm cụ thể của bản thân trong nhiệm vụ đó (Task).")
    if not has_action: weaknesses.append("Chưa làm rõ các hành động cụ thể bạn đã làm (Action).")
    if not has_result: weaknesses.append("Thiếu số liệu minh họa kết quả cụ thể hoặc bài học đúc kết (Result).")
    if len(answer) < 150: weaknesses.append("Câu trả lời hơi ngắn, có thể bổ sung chi tiết để thuyết phục hơn.")
    if not weaknesses: weaknesses.append("Có thể tối ưu thêm bằng cách đưa vào các số liệu đo lường cụ thể.")

    suggestions = [
        "Sử dụng thêm các số liệu định lượng (ví dụ: tối ưu bao nhiêu % time, sửa trong bao lâu).",
        "Làm rõ hơn vai trò cá nhân của bạn thay vì nói chung chung về team.",
        "Nhấn mạnh bài học kinh nghiệm hoặc kỹ năng đã cải thiện được sau sự cố."
    ]

    # Gợi ý bài làm cải thiện (STAR) generic
    improved = ImprovedAnswer(
        situation="Trong một dự án hoặc tình huống học tập, tôi từng gặp một vấn đề cần xử lý liên quan đến câu hỏi này.",
        task="Nhiệm vụ của tôi là xác định vấn đề, chịu trách nhiệm phần việc được giao và đóng góp giải pháp phù hợp.",
        action="Tôi chủ động trao đổi với các thành viên, phân tích nguyên nhân, ưu tiên việc quan trọng và thực hiện các bước cần thiết để cải thiện tình huống.",
        result="Kết quả là vấn đề được xử lý tốt hơn, nhóm phối hợp hiệu quả hơn và tôi rút ra bài học về cách làm việc chuyên nghiệp."
    )

    return EvaluateHrAnswerResponse(
        overallScore=overall,
        level=level,
        summary=summary,
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
        nextRecommendation="Hãy tiếp tục luyện tập thêm các câu hỏi sử dụng cấu trúc STAR.",
        questionScore=overall,
        feedback=summary
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
