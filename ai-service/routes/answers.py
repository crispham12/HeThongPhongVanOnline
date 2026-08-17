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
            feedback=data.get("feedback", "Câu trả lời tốt. Hãy tiếp tục luyện tập nhé."),
            score=int(data.get("score", 70)),
            next_question=data.get("next_question"),
            tags=data.get("tags"),
        )
    except Exception:
        return EvaluateAnswerResponse(
            feedback="Cảm ơn câu trả lời của bạn. Hãy cân nhắc thêm các ví dụ cụ thể và định lượng kết quả các hành động của bạn nhé.",
            score=72,
        )
