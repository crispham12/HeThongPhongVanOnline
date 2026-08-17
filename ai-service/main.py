from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import uvicorn
import json
import os

from services.openai_service import call_openai
from prompts.prompts import QUESTION_PROMPTS, EVALUATION_PROMPTS, ROADMAP_PROMPT
from routes.hr import router as hr_router
from routes.coding import router as coding_router
from routes.coding_practice import router as coding_practice_router
from routes.voice import router as voice_router
from routes.technical import router as technical_router
from routes.coding_interview import router as coding_interview_router

app = FastAPI(title="InterviewPro AI Service")

# Thêm CORS để cho phép các domain khác gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register HR Interview router
app.include_router(hr_router)

# Register Coding Question Bank AI Generator router
app.include_router(coding_router)

# Register Coding Practice router
app.include_router(coding_practice_router)

# Register Voice Analysis router
app.include_router(voice_router)

# Register Technical Interview router
app.include_router(technical_router)

# Register Coding Interview router
app.include_router(coding_interview_router)

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

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/ai/generate-question")
async def generate_question(setup: InterviewSetup):
    """
    Logic: Phân tích 'stack' và 'difficulty' để sinh câu hỏi bằng OpenAI.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("AIza"):
        # Fallback nếu chưa có key hoặc dùng nhầm key Google (AIza...)
        return {
            "question": f"Hãy chia sẻ kinh nghiệm của bạn về {', '.join(setup.stack)} với vai trò {setup.role}.",
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
        usage = ai_response.pop("usage", None)
        ai_response.pop("model", None)

        response_data = {
            "question": ai_response.get("question", "No question generated"),
            "context": {
                "tech_stack": setup.stack,
                "role": setup.role,
                "difficulty": setup.difficulty
            },
            "phase": setup.interview_type,
            "tags": ai_response.get("tags", [])
        }
        if usage:
            response_data["usage"] = usage
        return response_data
    except Exception as e:
        print(f"Error in generate_question: {str(e)}")
        # Trả về câu hỏi mặc định nếu có lỗi API (Đí dụ: Key sai, hết tiền...)
        return {
            "question": f"Bạn có thể kể về một dự án thử thách mà bạn đã làm với {', '.join(setup.stack)} không?",
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
            "feedback": "API Key không hợp lệ hoặc bị thiếu (Có thể bạn đang dùng Google Key thay vì OpenAI sk-...). Đây là đánh giá giả lập.",
            "is_correct": score > 70,
            "next_question": "Bạn có thể giải thích chi tiết hơn về vấn đề này không?"
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
        usage = ai_response.pop("usage", None)
        ai_response.pop("model", None)

        response_data = {
            "score": ai_response.get("score", 0),
            "feedback": ai_response.get("feedback", "No feedback provided"),
            "is_correct": ai_response.get("score", 0) > 70,
            "next_question": ai_response.get("next_question", None)
        }
        if usage:
            response_data["usage"] = usage
        return response_data
    except Exception as e:
        print(f"Error in evaluate_answer: {str(e)}")
        return {
            "score": 0,
            "feedback": f"Đánh giá thất bại do lỗi API: {str(e)}. Vui lòng kiểm tra lại API Key.",
            "is_correct": False,
            "next_question": None
        }

@app.post("/ai/generate-report")
async def generate_report(request: InterviewReportRequest):
    """
    Logic: Tổng hợp kết quả để đưa ra đánh giá cuối cùng.
    """
    if not os.getenv("OPENAI_API_KEY"):
        return {"overall_assessment": "Báo cáo giả lập: Vui lòng cấu hình API Key", "roadmap": [], "final_decision": "Cần xem xét thêm"}

    try:
        scores_str = json.dumps(request.scores)
        prompt = ROADMAP_PROMPT.format(
            role=request.role,
            level=request.difficulty,
            scores=scores_str
        )
        full_prompt = f"{prompt}\n\nCandidate Feedback Summary: {'. '.join(request.feedback_summary)}"

        ai_response = await call_openai(full_prompt)
        usage = ai_response.pop("usage", None)
        ai_response.pop("model", None)

        response_data = {
            "overall_assessment": ai_response.get("overall_advice", ""),
            "roadmap": ai_response.get("roadmap", []),
            "final_decision": "Đề xuất tuyển dụng" if sum(request.scores.values()) / len(request.scores) > 70 else "Đề xuất đào tạo thêm"
        }
        if usage:
            response_data["usage"] = usage
        return response_data
    except Exception as e:
        print(f"Error in generate_report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Report Generation failed: {str(e)}")

class CVAnalysisRequest(BaseModel):
    cv_title: str
    personal_info: dict
    experiences: List[dict]
    educations: List[dict]
    skills: List[str]

@app.post("/ai/analyze-cv")
async def analyze_cv(request: CVAnalysisRequest):
    """
    Logic: Phân tích nội dung CV và đưa ra điểm số kèm lời khuyên cải thiện.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("AIza"):
        # Fallback Mock Logic
        score = 85
        has_metrics = False
        feedback = "Chúc mừng! CV của bạn có cấu trúc tốt và nội dung rõ ràng. "
        
        # Check for numbers/percentages in experiences as standard quantification
        for exp in request.experiences:
            desc = exp.get("description", "")
            if any(char.isdigit() for char in desc):
                has_metrics = True
                break
        
        if not has_metrics:
            score = 82
            feedback += "Tuy nhiên, để đạt điểm xuất sắc, hãy bổ sung chỉ số định lượng vào mô tả kinh nghiệm (ví dụ: 'tối ưu tốc độ tải trang 40%', 'quản lý đội ngũ 3 người')."
        else:
            score = 92
            feedback += "Điểm cộng lớn là phần kinh nghiệm của bạn đã có số liệu thực tế đo lường hiệu quả (đáp ứng chuẩn ATS tối ưu)."
            
        if len(request.skills) < 4:
            score = max(70, score - 5)
            feedback += " Hãy bổ sung thêm các kỹ năng chuyên môn quan trọng và từ khóa công nghệ ở mục Skills & Stack."
            
        return {"score": score, "feedback": feedback}

    try:
        # Construct detailed OpenAI prompt
        prompt = f"""
        You are an expert HR recruiter and ATS optimizer. Analyze this candidate resume details:
        Resume Title: {request.cv_title}
        Personal Info: {json.dumps(request.personal_info, ensure_ascii=False)}
        Experiences: {json.dumps(request.experiences, ensure_ascii=False)}
        Educations: {json.dumps(request.educations, ensure_ascii=False)}
        Skills: {", ".join(request.skills)}

        Please evaluate the CV on a scale of 0 to 100 based on structure, readability, spelling, and how well it communicates technical achievements and quantifiable impact (metrics).
        Suggest 1-2 practical improvements to increase their ATS compatibility and recruiting appeal.

        Your response MUST be in Vietnamese and formatted as a JSON object with the following structure:
        {{
          "score": <integer score from 0 to 100>,
          "feedback": "<detailed feedback in Vietnamese. Point out specifically which experience section could be improved with metrics or which skills to highlight. Keep it professional and under 150 words.>"
        }}
        """

        ai_response = await call_openai(prompt)
        usage = ai_response.pop("usage", None)
        ai_response.pop("model", None)

        response_data = {
            "score": ai_response.get("score", 80),
            "feedback": ai_response.get("feedback", "Đã đánh giá thành công.")
        }
        if usage:
            response_data["usage"] = usage
        return response_data
    except Exception as e:
        print(f"Error in analyze_cv: {str(e)}")
        return {
            "score": 75,
            "feedback": f"Không thể gọi API đánh giá AI thực tế do lỗi: {str(e)}. Hãy kiểm tra API key của bạn."
        }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
