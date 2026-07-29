import os
import traceback
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

from services.openai_service import call_openai_with_usage
from utils.static_analyzer import analyze_code_metrics
from prompts.evaluation.coding.coding_prompts import (
    CODING_STAGE_GUIDE_PROMPT,
    CODING_STAGE_EVALUATION_PROMPT,
    CODING_FINAL_EVALUATION_PROMPT
)

router = APIRouter(prefix="/ai/coding-interview", tags=["Coding Interview Engine"])

class TokenUsageInfo(BaseModel):
    inputTokens: int = 0
    outputTokens: int = 0
    totalTokens: int = 0
    model: str = "gpt-4o-mini"

# -- API: Prompt Next Stage --
class NextStagePromptRequest(BaseModel):
    role: str
    difficulty: str
    tech_stack: str
    problem_title: str
    problem_description: str
    language: str
    stage: str
    context: str
    candidate_input: str
    current_code: Optional[str] = ""

class NextStagePromptResponse(BaseModel):
    aiResponse: str
    nextStage: str
    usage: Optional[TokenUsageInfo] = None

@router.post("/next-stage-prompt", response_model=NextStagePromptResponse)
async def next_stage_prompt(req: NextStagePromptRequest):
    try:
        # Run Static Analysis if there is candidate code
        static_metrics_str = "None"
        if req.current_code:
            metrics = analyze_code_metrics(req.language, req.current_code)
            static_metrics_str = str(metrics)

        prompt = CODING_STAGE_GUIDE_PROMPT.format(
            role=req.role,
            difficulty=req.difficulty,
            tech_stack=req.tech_stack,
            problem_title=req.problem_title,
            problem_description=req.problem_description,
            language=req.language,
            stage=req.stage,
            context=req.context,
            candidate_input=req.candidate_input,
            static_metrics=static_metrics_str
        )
        
        result, usage = await call_openai_with_usage(prompt)
        return NextStagePromptResponse(
            aiResponse=result.get("aiResponse", "Hãy tiếp tục chia sẻ giải pháp của bạn."),
            nextStage=result.get("nextStage", req.stage),
            usage=TokenUsageInfo(**usage)
        )
    except Exception as e:
        print(f"[Coding] Next Stage Prompt Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to get next stage prompt.")

# -- API: Evaluate Stage --
class EvaluateStageRequest(BaseModel):
    role: str
    difficulty: str
    problem_title: str
    problem_description: str
    stage: str
    stage_history: str

class EvaluateStageResponse(BaseModel):
    score: float
    feedback: str
    usage: Optional[TokenUsageInfo] = None

@router.post("/evaluate-stage", response_model=EvaluateStageResponse)
async def evaluate_stage(req: EvaluateStageRequest):
    try:
        prompt = CODING_STAGE_EVALUATION_PROMPT.format(
            role=req.role,
            difficulty=req.difficulty,
            problem_title=req.problem_title,
            problem_description=req.problem_description,
            stage=req.stage,
            stage_history=req.stage_history
        )
        result, usage = await call_openai_with_usage(prompt)
        return EvaluateStageResponse(
            score=float(result.get("score", 0.0)),
            feedback=result.get("feedback", ""),
            usage=TokenUsageInfo(**usage)
        )
    except Exception as e:
        print(f"[Coding] Evaluate Stage Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to evaluate stage.")

# -- API: Final Evaluation --
class FinalEvaluationRequest(BaseModel):
    role: str
    difficulty: str
    language: str
    problems_summary: str
    interview_memory: str

class Scores(BaseModel):
    problemUnderstanding: float = 0.0
    algorithmDesign: float = 0.0
    codeCorrectness: float = 0.0
    codeQuality: float = 0.0
    complexityAnalysis: float = 0.0
    testingValidation: float = 0.0
    communication: float = 0.0

class FinalStrength(BaseModel):
    title: str
    description: str

class FinalWeakness(BaseModel):
    title: str
    description: str

class LearningRoadmapItem(BaseModel):
    topic: str
    resource: str

class FinalEvaluationResponse(BaseModel):
    overallScore: float
    scores: Scores
    summary: str
    strengths: List[FinalStrength]
    weaknesses: List[FinalWeakness]
    recommendation: str
    recommendationReason: str
    learningRoadmap: List[LearningRoadmapItem]
    usage: Optional[TokenUsageInfo] = None

@router.post("/final-evaluation", response_model=FinalEvaluationResponse)
async def final_evaluation(req: FinalEvaluationRequest):
    try:
        prompt = CODING_FINAL_EVALUATION_PROMPT.format(
            role=req.role,
            difficulty=req.difficulty,
            language=req.language,
            problems_summary=req.problems_summary,
            interview_memory=req.interview_memory
        )
        result, usage = await call_openai_with_usage(prompt)
        return FinalEvaluationResponse(
            overallScore=float(result.get("overallScore", 0.0)),
            scores=Scores(**result.get("scores", {})),
            summary=result.get("summary", ""),
            strengths=[FinalStrength(**s) for s in result.get("strengths", [])],
            weaknesses=[FinalWeakness(**w) for w in result.get("weaknesses", [])],
            recommendation=result.get("recommendation", "Borderline"),
            recommendationReason=result.get("recommendationReason", ""),
            learningRoadmap=[LearningRoadmapItem(**l) for l in result.get("learningRoadmap", [])],
            usage=TokenUsageInfo(**usage)
        )
    except Exception as e:
        print(f"[Coding] Final Evaluation Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to run final coding evaluation.")
