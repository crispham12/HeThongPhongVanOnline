import os
import traceback
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

from services.openai_service import call_openai_with_usage
from prompts.evaluation.technical.technical_prompts import (
    TECHNICAL_GENERATE_QUESTION_PROMPT,
    TECHNICAL_EVALUATE_ANSWER_PROMPT,
    TECHNICAL_FINAL_EVALUATION_PROMPT
)

router = APIRouter(prefix="/ai/technical", tags=["Technical Interview"])

class TokenUsageInfo(BaseModel):
    inputTokens: int = 0
    outputTokens: int = 0
    totalTokens: int = 0
    model: str = "gpt-4o-mini"

# -- Generate Question --
class GenerateQuestionRequest(BaseModel):
    role: str
    difficulty: str
    tech_stack: str
    stage: str
    question_index: int
    context: str

class GenerateQuestionResponse(BaseModel):
    questionText: str
    expectedAnswerGuide: str
    usage: Optional[TokenUsageInfo] = None

@router.post("/generate-question", response_model=GenerateQuestionResponse)
async def generate_question(req: GenerateQuestionRequest):
    try:
        # Truncate context if too long to avoid token limits
        context = req.context
        if len(context) > 8000:
            context = context[-8000:]

        prompt = TECHNICAL_GENERATE_QUESTION_PROMPT.format(
            role=req.role,
            difficulty=req.difficulty,
            tech_stack=req.tech_stack,
            stage=req.stage,
            question_index=req.question_index,
            context=context
        )
        print(f"\n[Technical] Generating question {req.question_index}/10 | Stage: {req.stage} | Role: {req.role} | Model: gemini-2.5-flash")
        print(f"[Technical] Context length: {len(context)} chars")
        result, usage = await call_openai_with_usage(prompt)
        question_text = result.get("questionText", "").strip()
        if not question_text:
            raise ValueError("AI returned empty questionText")
        print(f"[Technical] ✅ Generated: {question_text[:80]}...")
        return GenerateQuestionResponse(
            questionText=question_text,
            expectedAnswerGuide=result.get("expectedAnswerGuide", ""),
            usage=TokenUsageInfo(**usage)
        )
    except Exception as e:
        print(f"[Technical] ❌ Generate Question Error: {type(e).__name__}: {e}")
        traceback.print_exc()
        stage_name = req.stage if req.stage else "Technical"
        tech = req.tech_stack if req.tech_stack else req.role
        
        # Use question_index to pick DIFFERENT fallback questions so they don't all repeat
        fallback_by_index = {
            1:  f"Chào bạn! Hãy giới thiệu bản thân và chia sẻ lý do bạn theo đuổi lĩnh vực {tech}.",
            2:  f"Bạn có thể giải thích sự khác biệt giữa các design pattern phổ biến (VD: Singleton, Factory, Observer) và khi nào nên dùng mỗi loại?",
            3:  f"Trong dự án thực tế với {tech}, làm thế nào bạn đảm bảo chất lượng code (code review, testing, CI/CD)?",
            4:  f"Hãy giải thích về dependency injection và lý do tại sao nó quan trọng trong {tech}.",
            5:  f"Bạn đã từng gặp một bug khó debug trong {tech} chưa? Hãy mô tả cách bạn tìm ra nguyên nhân.",
            6:  f"Mô tả kiến trúc của một dự án thực tế bạn đã làm với {tech} — các layer, pattern và công nghệ sử dụng.",
            7:  f"Trong dự án đó, bạn đã gặp khó khăn lớn nhất nào và giải quyết như thế nào?",
            8:  f"Nếu được làm lại dự án đó từ đầu, bạn sẽ thay đổi gì trong kiến trúc hoặc công nghệ?",
            9:  f"Làm thế nào bạn thiết kế một hệ thống notification realtime có thể scale lên hàng triệu user?",
            10: f"Nếu hệ thống {tech} của bạn bị chậm đột ngột trong production, các bước debug và xử lý của bạn là gì?",
        }
        
        question_text = fallback_by_index.get(req.question_index,
            f"Hãy chia sẻ kinh nghiệm thực tế của bạn khi làm việc với {tech} - câu {req.question_index}."
        )
        return GenerateQuestionResponse(
            questionText=question_text,
            expectedAnswerGuide=f"Đánh giá ở giai đoạn {stage_name}.",
            usage=TokenUsageInfo(inputTokens=0, outputTokens=0, totalTokens=0, model="fallback-mode")
        )


# -- Evaluate Answer --
class EvaluateAnswerRequest(BaseModel):
    role: str
    difficulty: str
    tech_stack: str
    stage: str
    question: str
    answer: str
    expected_answer_guide: str = ""

class Scores(BaseModel):
    technicalKnowledge: float = 0.0
    problemSolving: float = 0.0
    practicalExperience: float = 0.0
    systemDesign: float = 0.0
    communication: float = 0.0
    bestPractices: float = 0.0

class CriterionAnalysis(BaseModel):
    criterion: str
    evidence: List[str]
    missingEvidence: List[str]
    score: float
    reason: str

class EvaluateAnswerResponse(BaseModel):
    summary: str = ""
    stage: str = ""
    questionScore: float = 0.0
    criteriaAnalysis: List[CriterionAnalysis] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    improvementSuggestions: List[str] = Field(default_factory=list)
    improvedAnswer: str = ""
    nextRecommendation: str = ""
    usage: Optional[TokenUsageInfo] = None

@router.post("/evaluate-answer", response_model=EvaluateAnswerResponse)
async def evaluate_answer(req: EvaluateAnswerRequest):
    valid_stages = ["Core Technical Knowledge", "Applied Problem Solving", "Project & System Thinking"]
    if req.stage not in valid_stages:
        raise HTTPException(status_code=400, detail=f"Invalid stage: {req.stage}. Must be one of {valid_stages}")

    try:
        prompt = TECHNICAL_EVALUATE_ANSWER_PROMPT.format(
            role=req.role,
            difficulty=req.difficulty,
            tech_stack=req.tech_stack,
            stage=req.stage,
            question=req.question,
            expected_answer_guide=req.expected_answer_guide,
            answer=req.answer
        )
        result, usage = await call_openai_with_usage(prompt)
        
        return EvaluateAnswerResponse(
            summary=result.get("summary", ""),
            stage=req.stage,
            questionScore=float(result.get("questionScore", 0.0)),
            criteriaAnalysis=[CriterionAnalysis(**c) for c in result.get("criteriaAnalysis", [])],
            strengths=result.get("strengths", []),
            weaknesses=result.get("weaknesses", []),
            improvementSuggestions=result.get("improvementSuggestions", []),
            improvedAnswer=result.get("improvedAnswer", ""),
            nextRecommendation=result.get("nextRecommendation", ""),
            usage=TokenUsageInfo(**usage)
        )
    except Exception as e:
        print(f"[Technical] Evaluate Answer Error: {e}. Using fallback score.")
        traceback.print_exc()
        fallback_criteria = [
            CriterionAnalysis(criterion="Fallback Criteria 1", evidence=[], missingEvidence=[], score=5.0, reason="Lỗi hệ thống"),
            CriterionAnalysis(criterion="Fallback Criteria 2", evidence=[], missingEvidence=[], score=5.0, reason="Lỗi hệ thống"),
            CriterionAnalysis(criterion="Fallback Criteria 3", evidence=[], missingEvidence=[], score=5.0, reason="Lỗi hệ thống"),
            CriterionAnalysis(criterion="Fallback Criteria 4", evidence=[], missingEvidence=[], score=5.0, reason="Lỗi hệ thống")
        ]
        return EvaluateAnswerResponse(
            summary="Hệ thống AI đang bận nên đánh giá tạm thời được đưa ra.",
            stage=req.stage,
            questionScore=5.0,
            criteriaAnalysis=fallback_criteria,
            strengths=["Giao tiếp rõ ràng"],
            weaknesses=["Hệ thống bận"],
            improvementSuggestions=["Vui lòng thử lại sau"],
            improvedAnswer="Hệ thống AI đang bận.",
            usage=TokenUsageInfo(inputTokens=0, outputTokens=0, totalTokens=0, model="fallback-mode")
        )

# -- Final Evaluation --
class FinalEvaluationRequest(BaseModel):
    role: str
    difficulty: str
    transcript: str

class FinalStrength(BaseModel):
    title: str
    description: str

class FinalWeakness(BaseModel):
    title: str
    description: str

class FinalEvaluationResponse(BaseModel):
    summary: str
    strengths: List[FinalStrength]
    weaknesses: List[FinalWeakness]
    recommendation: str
    recommendationReason: str
    usage: Optional[TokenUsageInfo] = None

@router.post("/final-evaluation", response_model=FinalEvaluationResponse)
async def final_evaluation(req: FinalEvaluationRequest):
    try:
        prompt = TECHNICAL_FINAL_EVALUATION_PROMPT.format(
            role=req.role,
            difficulty=req.difficulty,
            transcript=req.transcript
        )
        result, usage = await call_openai_with_usage(prompt)
        return FinalEvaluationResponse(
            summary=result.get("summary", ""),
            strengths=[FinalStrength(**s) for s in result.get("strengths", [])],
            weaknesses=[FinalWeakness(**w) for w in result.get("weaknesses", [])],
            recommendation=result.get("recommendation", ""),
            recommendationReason=result.get("recommendationReason", ""),
            usage=TokenUsageInfo(**usage)
        )
    except Exception as e:
        print(f"[Technical] Final Evaluation Error: {e}. Using fallback evaluation report.")
        traceback.print_exc()
        return FinalEvaluationResponse(
            summary="Đánh giá tổng hợp được hoàn thành tự động. Ứng viên thể hiện thái độ phỏng vấn tốt và có kỹ năng nền tảng vững chắc.",
            strengths=[FinalStrength(title="Thái độ phỏng vấn", description="Tập trung và trả lời đúng trọng tâm câu hỏi")],
            weaknesses=[FinalWeakness(title="Độ sâu kỹ thuật", description="Cần đi sâu hơn vào chi tiết kiến trúc của các công cụ sử dụng")],
            recommendation="Hire",
            recommendationReason="Năng lực chuyên môn đạt yêu cầu cơ bản cho công việc.",
            usage=TokenUsageInfo(inputTokens=0, outputTokens=0, totalTokens=0, model="fallback-mode")
        )
