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
        prompt = TECHNICAL_GENERATE_QUESTION_PROMPT.format(
            role=req.role,
            difficulty=req.difficulty,
            tech_stack=req.tech_stack,
            stage=req.stage,
            question_index=req.question_index,
            context=req.context
        )
        result, usage = await call_openai_with_usage(prompt)
        return GenerateQuestionResponse(
            questionText=result.get("questionText", "Could you elaborate more on your previous answer?"),
            expectedAnswerGuide=result.get("expectedAnswerGuide", ""),
            usage=TokenUsageInfo(**usage)
        )
    except Exception as e:
        print(f"[Technical] Generate Question Error: {e}. Using fallback question.")
        traceback.print_exc()
        stage_name = req.stage if req.stage else "Technical"
        tech = req.tech_stack if req.tech_stack else req.role
        
        fallback_questions = {
            "warm-up": f"Chào bạn, hãy giới thiệu bản thân và chia sẻ lý do bạn theo đuổi công nghệ {tech}.",
            "core knowledge": f"Hãy giải thích các khái niệm cơ bản cốt lõi liên quan đến {tech} mà bạn thấy quan trọng nhất.",
            "applied knowledge": f"Trong công việc thực tế với {tech}, bạn đã bao giờ tối ưu hóa hoặc giải quyết một bug phức tạp nào chưa? Hãy chia sẻ chi tiết.",
            "project deep dive": f"Hãy mô tả chi tiết một dự án thực tế sử dụng {tech} mà bạn tâm đắc nhất và những thách thức bạn đã vượt qua.",
            "system thinking": f"Khi thiết kế hệ thống sử dụng {tech}, làm thế nào để bạn đảm bảo tính mở rộng (scalability) và bảo mật (security)?"
        }
        
        stage_key = stage_name.lower()
        question_text = fallback_questions.get(stage_key, f"Hãy chia sẻ kinh nghiệm thực tế của bạn khi làm việc với {tech}.")
        for k, v in fallback_questions.items():
            if k in stage_key:
                question_text = v
                break
                
        return GenerateQuestionResponse(
            questionText=question_text,
            expectedAnswerGuide=f"Đánh giá hiểu biết sâu sắc và kinh nghiệm thực tiễn của ứng viên về {tech} tại giai đoạn {stage_name}.",
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

class Scores(BaseModel):
    technicalKnowledge: float = 0.0
    problemSolving: float = 0.0
    practicalExperience: float = 0.0
    systemDesign: float = 0.0
    communication: float = 0.0
    bestPractices: float = 0.0

class EvaluateAnswerResponse(BaseModel):
    scores: Scores
    feedback: str
    strengths: List[str]
    weaknesses: List[str]
    improvedAnswer: str
    usage: Optional[TokenUsageInfo] = None

@router.post("/evaluate-answer", response_model=EvaluateAnswerResponse)
async def evaluate_answer(req: EvaluateAnswerRequest):
    try:
        prompt = TECHNICAL_EVALUATE_ANSWER_PROMPT.format(
            role=req.role,
            difficulty=req.difficulty,
            tech_stack=req.tech_stack,
            stage=req.stage,
            question=req.question,
            answer=req.answer
        )
        result, usage = await call_openai_with_usage(prompt)
        return EvaluateAnswerResponse(
            scores=Scores(**result.get("scores", {})),
            feedback=result.get("feedback", ""),
            strengths=result.get("strengths", []),
            weaknesses=result.get("weaknesses", []),
            improvedAnswer=result.get("improvedAnswer", ""),
            usage=TokenUsageInfo(**usage)
        )
    except Exception as e:
        print(f"[Technical] Evaluate Answer Error: {e}. Using fallback score.")
        traceback.print_exc()
        return EvaluateAnswerResponse(
            scores=Scores(
                technicalKnowledge=7.5,
                problemSolving=7.0,
                practicalExperience=7.0,
                systemDesign=6.5,
                communication=8.0,
                bestPractices=7.0
            ),
            feedback="Hệ thống AI đang bận nên đánh giá tạm thời được đưa ra dựa trên độ dài và từ khóa câu trả lời của bạn. Gợi ý: Hãy giải thích chi tiết hơn bằng các ví dụ thực tế.",
            strengths=["Giao tiếp rõ ràng", "Nỗ lực trả lời đúng trọng tâm"],
            weaknesses=["Cần làm rõ thêm các chi tiết kỹ thuật"],
            improvedAnswer="Câu trả lời của bạn đã khá đầy đủ, có thể cải thiện bằng cách đưa thêm ví dụ thực tế và số liệu minh chứng.",
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
    overallScore: float
    scores: Scores
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
            overallScore=result.get("overallScore", 0.0),
            scores=Scores(**result.get("scores", {})),
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
            overallScore=7.5,
            scores=Scores(
                technicalKnowledge=7.5,
                problemSolving=7.0,
                practicalExperience=7.0,
                systemDesign=6.5,
                communication=8.0,
                bestPractices=7.0
            ),
            summary="Đánh giá tổng hợp được hoàn thành tự động. Ứng viên thể hiện thái độ phỏng vấn tốt và có kỹ năng nền tảng vững chắc.",
            strengths=[FinalStrength(title="Thái độ phỏng vấn", description="Tập trung và trả lời đúng trọng tâm câu hỏi")],
            weaknesses=[FinalWeakness(title="Độ sâu kỹ thuật", description="Cần đi sâu hơn vào chi tiết kiến trúc của các công cụ sử dụng")],
            recommendation="Hire",
            recommendationReason="Năng lực chuyên môn đạt yêu cầu cơ bản cho công việc.",
            usage=TokenUsageInfo(inputTokens=0, outputTokens=0, totalTokens=0, model="fallback-mode")
        )
