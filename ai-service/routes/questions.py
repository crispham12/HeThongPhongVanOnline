from fastapi import APIRouter
from models.schemas import GenerateQuestionRequest, GenerateQuestionResponse
from prompts.prompts import QUESTION_PROMPTS
from services.openai_service import call_openai

router = APIRouter()

@router.post("/generate-question", response_model=GenerateQuestionResponse)
async def generate_question(req: GenerateQuestionRequest):
    prompt_tmpl = QUESTION_PROMPTS.get(req.type, QUESTION_PROMPTS["technical"])
    tech_str = ", ".join(req.tech_stack) if req.tech_stack else "General IT"
    prompt = prompt_tmpl.format(role=req.role, level=req.level, tech_stack=tech_str)
    try:
        data = await call_openai(prompt)
        return GenerateQuestionResponse(
            question=data.get("question", "Describe your experience with REST APIs."),
            tags=data.get("tags", []),
            difficulty=data.get("difficulty", req.level),
        )
    except Exception:
        return GenerateQuestionResponse(
            question=f"Tell me about your experience as a {req.level} {req.role}.",
            tags=[req.role, req.level],
            difficulty=req.level,
        )
