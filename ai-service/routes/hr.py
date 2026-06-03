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

class EvaluateHrAnswerResponse(BaseModel):
    communicationScore: float
    clarityScore: float
    starScore: float
    professionalMindsetScore: float
    relevanceScore: float
    questionScore: float
    level: str
    feedback: str
    strengths: List[str]
    weaknesses: List[str]
    improvementSuggestions: List[str]

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


# ═══════════════════════════════════════════════
# Endpoint 2: Đánh giá câu trả lời theo rubric
# ═══════════════════════════════════════════════

@router.post("/evaluate-answer", response_model=EvaluateHrAnswerResponse)
async def evaluate_hr_answer(req: EvaluateHrAnswerRequest):
    """
    Đánh giá câu trả lời HR theo 5 tiêu chí với trọng số.
    
    Logic:
    1. Inject câu hỏi + câu trả lời + ngữ cảnh vào rubric prompt
    2. AI suy nghĩ theo 10 steps (chain-of-thought nhúng trong prompt)
    3. AI tự tính questionScore theo công thức trọng số
    4. Trả feedback cụ thể + strengths + weaknesses + suggestions
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
        
        # Tự tính lại questionScore để đảm bảo chính xác (không tin hoàn toàn AI)
        comm = float(result.get("communicationScore", 5))
        clarity = float(result.get("clarityScore", 5))
        star = float(result.get("starScore", 5))
        prof = float(result.get("professionalMindsetScore", 5))
        rel = float(result.get("relevanceScore", 5))
        
        calculated_score = round(
            comm * 0.20 + clarity * 0.20 + star * 0.25 + prof * 0.20 + rel * 0.15,
            1
        )
        
        # Xác định level dựa trên điểm tính lại
        level = _get_level(calculated_score)
        
        return EvaluateHrAnswerResponse(
            communicationScore=comm,
            clarityScore=clarity,
            starScore=star,
            professionalMindsetScore=prof,
            relevanceScore=rel,
            questionScore=calculated_score,
            level=level,
            feedback=result.get("feedback", "Đánh giá tự động."),
            strengths=result.get("strengths", ["Có cố gắng trả lời"]),
            weaknesses=result.get("weaknesses", ["Cần bổ sung chi tiết"]),
            improvementSuggestions=result.get("improvementSuggestions", ["Luyện tập thêm cấu trúc STAR"])
        )
    except Exception as e:
        print(f"[HR] Error evaluating answer: {e}")
        traceback.print_exc()
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


def _build_fallback_evaluation() -> EvaluateHrAnswerResponse:
    """Trả kết quả đánh giá mặc định khi AI không khả dụng."""
    return EvaluateHrAnswerResponse(
        communicationScore=7, clarityScore=7, starScore=6,
        professionalMindsetScore=7, relevanceScore=7,
        questionScore=6.9, level="Khá",
        feedback="AI Service tạm thời không khả dụng. Điểm số này là ước tính tự động.",
        strengths=["Có cố gắng trả lời câu hỏi"],
        weaknesses=["Không thể đánh giá chi tiết do lỗi hệ thống"],
        improvementSuggestions=["Hãy thử lại sau khi hệ thống ổn định"]
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
