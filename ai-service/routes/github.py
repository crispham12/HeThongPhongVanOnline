from fastapi import APIRouter
from models.schemas import AnalyzeGithubRequest, AnalyzeGithubResponse
from prompts.prompts import GITHUB_ANALYSIS_PROMPT
from services.openai_service import call_openai

router = APIRouter()

@router.post("/analyze-github", response_model=AnalyzeGithubResponse)
async def analyze_github(req: AnalyzeGithubRequest):
    prompt = GITHUB_ANALYSIS_PROMPT.format(repo_url=req.repo_url)
    try:
        data = await call_openai(prompt)
        return AnalyzeGithubResponse(
            repo=req.repo_url,
            summary=data.get("summary", ""),
            architecture=data.get("architecture", 0),
            clean_code=data.get("clean_code", 0),
            security=data.get("security", 0),
            performance=data.get("performance", 0),
            strengths=data.get("strengths", []),
            improvements=data.get("improvements", []),
        )
    except Exception:
        return AnalyzeGithubResponse(
            repo=req.repo_url,
            summary="Analysis service is temporarily unavailable. Please try again later.",
            architecture=0, clean_code=0, security=0, performance=0,
            strengths=[], improvements=[],
        )
