from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import uvicorn
import json
import os

from services.openai_service import call_openai
from prompts.prompts import QUESTION_PROMPTS, EVALUATION_PROMPTS, ROADMAP_PROMPT

app = FastAPI(title="InterviewPro AI Service")

# Thêm CORS để cho phép các domain khác gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InterviewSetup(BaseModel):
    role: str
    stack: List[str]
    difficulty: str
    interview_type: Optional[str] = "Technical"

class AnswerSubmission(BaseModel):
    question: Optional[str] = "General technical question"
    answer: str
    interview_type: Optional[str] = "Technical"

class InterviewReportRequest(BaseModel):
    role: str
    difficulty: str
    scores: Dict[str, int]
    feedback_summary: List[str]

@app.get("/")
async def root():
    return {"message": "AI Service is running", "openai_key_status": "Set" if os.getenv("OPENAI_API_KEY") else "Not Set"}

@app.post("/ai/generate-question")
async def generate_question(setup: InterviewSetup):
    """
    Logic: Phân tích 'stack' và 'difficulty' để sinh câu hỏi bằng OpenAI.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("AIza"):
        # Fallback nếu chưa có key hoặc dùng nhầm key Google (AIza...)
        return {
            "question": f"Please explain your experience with {', '.join(setup.stack)} as a {setup.role}.",
            "context": {"status": "mock_mode_invalid_key"},
            "phase": setup.interview_type,
            "tags": ["General"]
        }

    try:
        type_key = setup.interview_type.lower() if setup.interview_type else "technical"
        if type_key not in QUESTION_PROMPTS:
            type_key = "technical"
            
        prompt_template = QUESTION_PROMPTS[type_key]
        tech_context = ", ".join(setup.stack) if setup.stack else setup.role
        
        prompt = prompt_template.format(
            level=setup.difficulty,
            role=f"{setup.role} (Tech stack: {tech_context})"
        )
        
        ai_response = await call_openai(prompt)
        
        return {
            "question": ai_response.get("question", "No question generated"),
            "context": {
                "tech_stack": setup.stack,
                "role": setup.role,
                "difficulty": setup.difficulty
            },
            "phase": setup.interview_type,
            "tags": ai_response.get("tags", [])
        }
    except Exception as e:
        print(f"Error in generate_question: {str(e)}")
        # Trả về câu hỏi mặc định nếu có lỗi API (Ví dụ: Key sai, hết tiền...)
        return {
            "question": f"Can you describe a challenging project you worked on using {', '.join(setup.stack)}?",
            "context": {"status": "error_fallback", "error": str(e)},
            "phase": setup.interview_type,
            "tags": ["General"]
        }

@app.post("/ai/evaluate-answer")
async def evaluate_answer(submission: AnswerSubmission):
    """
    Logic: Đánh giá câu trả lời của ứng viên bằng OpenAI.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("AIza"):
        import random
        score = random.randint(60, 90)
        return {
            "score": score,
            "feedback": "API Key is invalid or missing (You might be using a Google Key instead of OpenAI sk-...). This is a mock evaluation.",
            "is_correct": score > 70,
            "next_question": "Can you elaborate more on that?"
        }

    try:
        type_key = submission.interview_type.lower() if submission.interview_type else "technical"
        if type_key not in EVALUATION_PROMPTS:
            type_key = "technical"
            
        prompt_template = EVALUATION_PROMPTS[type_key]
        prompt = prompt_template.format(
            question=submission.question,
            answer=submission.answer
        )
        
        ai_response = await call_openai(prompt)
        
        return {
            "score": ai_response.get("score", 0),
            "feedback": ai_response.get("feedback", "No feedback provided"),
            "is_correct": ai_response.get("score", 0) > 70,
            "next_question": ai_response.get("next_question", None)
        }
    except Exception as e:
        print(f"Error in evaluate_answer: {str(e)}")
        return {
            "score": 0,
            "feedback": f"Evaluation failed due to API error: {str(e)}. Please check your API Key.",
            "is_correct": False,
            "next_question": None
        }

@app.post("/ai/generate-report")
async def generate_report(request: InterviewReportRequest):
    """
    Logic: Tổng hợp kết quả để đưa ra đánh giá cuối cùng.
    """
    if not os.getenv("OPENAI_API_KEY"):
        return {"overall_assessment": "Mock report: Please set API Key", "roadmap": [], "final_decision": "Review needed"}

    try:
        scores_str = json.dumps(request.scores)
        prompt = ROADMAP_PROMPT.format(
            role=request.role,
            level=request.difficulty,
            scores=scores_str
        )
        full_prompt = f"{prompt}\n\nCandidate Feedback Summary: {'. '.join(request.feedback_summary)}"
        
        ai_response = await call_openai(full_prompt)
        
        return {
            "overall_assessment": ai_response.get("overall_advice", ""),
            "roadmap": ai_response.get("roadmap", []),
            "final_decision": "Recommend Hire" if sum(request.scores.values()) / len(request.scores) > 70 else "Recommend Further Training"
        }
    except Exception as e:
        print(f"Error in generate_report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Report Generation failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
