from pydantic import BaseModel
from typing import Optional, List

class GenerateQuestionRequest(BaseModel):
    role: str        # backend, frontend, fullstack, ai-engineer
    level: str       # intern, fresher, junior
    type: str        # hr, technical, coding

class GenerateQuestionResponse(BaseModel):
    question: str
    tags: List[str]
    difficulty: str

class EvaluateAnswerRequest(BaseModel):
    question: str
    answer: str
    type: str        # hr, technical, coding
    config: Optional[dict] = None

class EvaluateAnswerResponse(BaseModel):
    feedback: str
    score: int       # 0-100
    next_question: Optional[str] = None
    tags: Optional[List[str]] = None

class AnalyzeGithubRequest(BaseModel):
    repo_url: str

class AnalyzeGithubResponse(BaseModel):
    repo: str
    summary: str
    architecture: int
    clean_code: int
    security: int
    performance: int
    strengths: List[str]
    improvements: List[str]

class GenerateRoadmapRequest(BaseModel):
    scores: dict
    role: str
    level: str

class RoadmapItem(BaseModel):
    week: str
    title: str
    description: str
    resources: List[str]

class GenerateRoadmapResponse(BaseModel):
    roadmap: List[RoadmapItem]
    overall_advice: str
