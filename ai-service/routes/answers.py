from fastapi import APIRouter
from models.schemas import EvaluateAnswerRequest, EvaluateAnswerResponse
from prompts.prompts import EVALUATION_PROMPTS
from services.openai_service import call_openai

router = APIRouter()

@router.post("/evaluate-answer", response_model=EvaluateAnswerResponse)
async def evaluate_answer(req: EvaluateAnswerRequest):
    prompt_tmpl = EVALUATION_PROMPTS.get(req.type, EVALUATION_PROMPTS["technical"])
    prompt = prompt_tmpl.format(question=req.question, answer=req.answer)
    try:
        data = await call_openai(prompt)
        return EvaluateAnswerResponse(
            feedback=data.get("feedback", "Good attempt. Keep practicing."),
            score=int(data.get("score", 70)),
            next_question=data.get("next_question"),
            tags=data.get("tags"),
        )
    except Exception:
        return EvaluateAnswerResponse(
            feedback="Thank you for your answer. Consider adding more specific examples and quantifying the impact of your actions.",
            score=72,
        )
