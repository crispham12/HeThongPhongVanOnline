from fastapi import APIRouter
from models.schemas import GenerateRoadmapRequest, GenerateRoadmapResponse
from prompts.prompts import ROADMAP_PROMPT
from services.openai_service import call_openai

router = APIRouter()

@router.post("/generate-roadmap", response_model=GenerateRoadmapResponse)
async def generate_roadmap(req: GenerateRoadmapRequest):
    prompt = ROADMAP_PROMPT.format(
        role=req.role, level=req.level, scores=str(req.scores)
    )
    try:
        data = await call_openai(prompt)
        return GenerateRoadmapResponse(
            roadmap=data.get("roadmap", []),
            overall_advice=data.get("overall_advice", "Keep practicing consistently."),
        )
    except Exception:
        return GenerateRoadmapResponse(
            roadmap=[],
            overall_advice="Focus on strengthening your weak areas and practice consistently.",
        )
