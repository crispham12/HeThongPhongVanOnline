"""
HR Interview Routes — Python FastAPI

Mô-đun này xử lý 3 endpoint chính cho chức năng Phỏng vấn HR:
1. POST /ai/hr/generate-questions   — Sinh 10 câu hỏi HR
2. POST /ai/hr/evaluate-answer      — Đánh giá 1 câu trả lời (5 tiêu chí)
3. POST /ai/hr/final-evaluation     — Tổng kết cuối bài sau 10 câu

Kiến trúc:
- Pydantic schemas validate input/output
- Prompt templates inject ngữ cảnh vào rubric
- call_openai() gọi OpenAI API với response_format=json
- Fallback logic khi API key thiếu hoặc lỗi
"""

import json
import os
import traceback
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

from services.openai_service import call_openai, call_openai_with_usage
from prompts.evaluation.hr.hr_prompts import (
    HR_GENERATE_QUESTIONS_PROMPT,
    HR_EVALUATE_ANSWER_PROMPT,
    HR_FINAL_EVALUATION_PROMPT
)

router = APIRouter(prefix="/ai/hr", tags=["HR Interview"])


# ═══════════════════════════════════════════════
# Pydantic Schemas (Request / Response)
# ═══════════════════════════════════════════════

class GenerateHrQuestionsRequest(BaseModel):
    role: str = Field(..., description="Vai trò ứng tuyển, ví dụ: Lập trình viên Backend")
    difficulty: str = Field(..., description="Mức độ: Intern | Fresher | Junior")
    tech_stack: List[str] = Field(default=[], description="Danh sách công nghệ")
    total_questions: int = Field(default=10, ge=1, le=20)

class GeneratedQuestion(BaseModel):
    questionIndex: int
    category: str
    questionText: str
    expectedAnswerGuide: str

class TokenUsageInfo(BaseModel):
    inputTokens: int = 0
    outputTokens: int = 0
    totalTokens: int = 0
    model: str = "gpt-4o-mini"

class GenerateHrQuestionsResponse(BaseModel):
    questions: List[GeneratedQuestion]
    usage: Optional[TokenUsageInfo] = None

class GenerateSingleHrQuestionRequest(BaseModel):
    role: str
    level: str
    category: str
    target_skill: str = ""
    suggested_method: str = "STAR"
    max_answer_time: int = 120

class SingleGeneratedQuestion(BaseModel):
    questionText: str
    category: str
    difficulty: str
    targetSkill: str
    suggestedMethod: str
    maxAnswerTime: int
    expectedAnswerGuide: str

class GenerateSingleHrQuestionResponse(BaseModel):
    question: SingleGeneratedQuestion
    usage: Optional[TokenUsageInfo] = None

class EvaluateHrAnswerRequest(BaseModel):
    role: str
    difficulty: str
    tech_stack: List[str] = []
    question: str
    answer: str

class StarScoreItem(BaseModel):
    score: float
    feedback: str

class StarAnalysis(BaseModel):
    situation: StarScoreItem
    task: StarScoreItem
    action: StarScoreItem
    result: StarScoreItem

class StarChecklist(BaseModel):
    situation: bool
    task: bool
    action: bool
    result: bool

class ImprovedAnswer(BaseModel):
    situation: str
    task: str
    action: str
    result: str

class EvaluateHrAnswerResponse(BaseModel):
    summary: str
    starCompletion: int
    starChecklist: StarChecklist
    starAnalysis: StarAnalysis
    strengths: List[str]
    weaknesses: List[str]
    improvementSuggestions: List[str]
    improvedAnswer: ImprovedAnswer
    nextRecommendation: str
    usage: Optional[TokenUsageInfo] = None

class AnswerSummaryItem(BaseModel):
    question: str
    answer: str
    transcript: str = ""
    durationSeconds: int = 0
    wordCount: int = 0
    fillerWords: int = 0
    score: float = 0.0
    feedback: str = ""

class FinalEvaluationRequest(BaseModel):
    session_id: str
    role: str
    difficulty: str
    answers: List[AnswerSummaryItem]

class CompositeScores(BaseModel):
    starScore: float = 0.0
    communicationScore: float = 0.0
    professionalismScore: float = 0.0
    confidenceScore: float = 0.0
    logicScore: float = 0.0
    completenessScore: float = 0.0
    clarityScore: float = 0.0

class FinalStarAnalysis(BaseModel):
    situation: StarScoreItem
    task: StarScoreItem
    action: StarScoreItem
    result: StarScoreItem

class FinalQuestionEvaluation(BaseModel):
    questionIndex: int
    questionScore: float
    starScore: float
    communicationScore: float
    confidenceScore: float
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    starAnalysis: FinalStarAnalysis

class FinalStrength(BaseModel):
    title: str
    description: str
    score: float
    status: str

class FinalImprovement(BaseModel):
    priority: str
    title: str
    description: str

class RecommendedPractice(BaseModel):
    title: str
    estimatedTime: str
    difficulty: str
    recommendedLevel: str

class FinalEvaluationResponse(BaseModel):
    compositeScores: CompositeScores
    questionEvaluations: List[FinalQuestionEvaluation]
    strengths: List[FinalStrength]
    improvements: List[FinalImprovement]
    recommendedPractice: List[RecommendedPractice]
    summary: str
    usage: Optional[TokenUsageInfo] = None


# ═══════════════════════════════════════════════
# Endpoint 1: Sinh 10 câu hỏi HR
# ═══════════════════════════════════════════════

@router.post("/generate-questions", response_model=GenerateHrQuestionsResponse)
async def generate_hr_questions(req: GenerateHrQuestionsRequest):
    """
    Sinh câu hỏi HR phù hợp với role, difficulty và tech stack.
    
    Logic:
    1. Inject thông tin ứng viên vào prompt template
    2. Gọi OpenAI → bắt trả JSON
    3. Parse và validate qua Pydantic schema
    4. Nếu API key lỗi → trả fallback 10 câu hỏi mẫu
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("AIza"):
        return GenerateHrQuestionsResponse(questions=_build_fallback_questions(req.role, req.difficulty))

    try:
        tech_str = ", ".join(req.tech_stack) if req.tech_stack else "General IT"
        prompt = HR_GENERATE_QUESTIONS_PROMPT.format(
            role=req.role,
            difficulty=req.difficulty,
            tech_stack=tech_str,
            total_questions=req.total_questions
        )

        result, usage_data = await call_openai_with_usage(prompt)
        questions = result.get("questions", [])

        # Validate minimum count
        if len(questions) < req.total_questions:
            # Bổ sung câu hỏi fallback nếu AI trả thiếu
            fallback = _build_fallback_questions(req.role, req.difficulty)
            for i in range(len(questions), req.total_questions):
                questions.append(fallback[i].__dict__ if hasattr(fallback[i], '__dict__') else fallback[i])

        return GenerateHrQuestionsResponse(
            questions=[GeneratedQuestion(**q) for q in questions[:req.total_questions]],
            usage=TokenUsageInfo(**usage_data)
        )
    except Exception as e:
        print(f"[HR] Error generating questions: {e}")
        traceback.print_exc()
        return GenerateHrQuestionsResponse(questions=_build_fallback_questions(req.role, req.difficulty))


# ═══════════════════════════════════════════════
# Endpoint 1.5: Sinh 1 câu hỏi HR
# ═══════════════════════════════════════════════

@router.post("/generate-single-question", response_model=GenerateSingleHrQuestionResponse)
async def generate_single_hr_question(req: GenerateSingleHrQuestionRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("AIza"):
        # Fallback trivial
        return GenerateSingleHrQuestionResponse(
            question=SingleGeneratedQuestion(
                questionText=f"Hãy nói về một lần bạn thể hiện kỹ năng {req.target_skill} trong công việc.",
                category=req.category,
                difficulty=req.level,
                targetSkill=req.target_skill,
                suggestedMethod=req.suggested_method,
                maxAnswerTime=req.max_answer_time,
                expectedAnswerGuide="Ứng viên nên dùng cấu trúc STAR."
            )
        )

    try:
        prompt = HR_GENERATE_QUESTIONS_PROMPT.format(
            role=req.role,
            difficulty=req.level,
            tech_stack=req.target_skill if req.target_skill else "General IT",
            total_questions=1
        )

        result, usage_data = await call_openai_with_usage(prompt)
        
        q_data = result.get("questions", [{}])[0]
        
        single_question = SingleGeneratedQuestion(
            questionText=q_data.get("questionText", f"Hãy nói về một lần bạn thể hiện kỹ năng {req.target_skill} trong công việc."),
            category=req.category,
            difficulty=req.level,
            targetSkill=req.target_skill,
            suggestedMethod=req.suggested_method,
            maxAnswerTime=req.max_answer_time,
            expectedAnswerGuide=q_data.get("expectedAnswerGuide", "Ứng viên nên dùng cấu trúc STAR.")
        )
        
        return GenerateSingleHrQuestionResponse(
            question=single_question,
            usage=TokenUsageInfo(**usage_data)
        )
    except Exception as e:
        print(f"[HR] Error generating single question: {e}")
        return GenerateSingleHrQuestionResponse(
            question=SingleGeneratedQuestion(
                questionText=f"Hãy nói về một lần bạn thể hiện kỹ năng {req.target_skill} trong công việc.",
                category=req.category,
                difficulty=req.level,
                targetSkill=req.target_skill,
                suggestedMethod=req.suggested_method,
                maxAnswerTime=req.max_answer_time,
                expectedAnswerGuide="Ứng viên nên dùng cấu trúc STAR."
            )
        )


# ═════════════════════════════════════════════
# Endpoint 2: Đánh giá câu trả lời theo rubric STAR
# ═════════════════════════════════════════════

@router.post("/evaluate-answer", response_model=EvaluateHrAnswerResponse)
async def evaluate_hr_answer(req: EvaluateHrAnswerRequest):
    """
    Đánh giá câu trả lời HR theo framework STAR với rubric đầy đủ.
    Output gồm: starAnalysis, starChecklist, improvedAnswer, nextRecommendation.
    """
    # 2. CHẶN CÂU TRẢ LỜI QUÁ NGẮN HOẶC VÔ NGHĨA TRƯỚC KHI GỌI AI
    if not req.answer or len(req.answer.strip()) < 30:
        return _build_fallback_evaluation(question=req.question, answer=req.answer, role=req.role, difficulty=req.difficulty)

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("AIza"):
        return _build_fallback_evaluation(question=req.question, answer=req.answer, role=req.role, difficulty=req.difficulty)

    try:
        tech_str = ", ".join(req.tech_stack) if req.tech_stack else "General IT"
        prompt = HR_EVALUATE_ANSWER_PROMPT.format(
            role=req.role,
            difficulty=req.difficulty,
            tech_stack=tech_str,
            question=req.question,
            answer=req.answer
        )

        result, usage_data = await call_openai_with_usage(prompt)

        # Parse starAnalysis
        star_raw = result.get("starAnalysis", {})
        def _parse_star_item(data, key):
            item = data.get(key, {})
            return StarScoreItem(
                score=_clamp_score(item.get("score", 0)),
                feedback=item.get("feedback") or "Chưa có nhận xét chi tiết."
            )

        star_analysis = StarAnalysis(
            situation=_parse_star_item(star_raw, "situation"),
            task=_parse_star_item(star_raw, "task"),
            action=_parse_star_item(star_raw, "action"),
            result=_parse_star_item(star_raw, "result")
        )

        # Parse starChecklist
        checklist_raw = result.get("starChecklist", {})
        checklist = StarChecklist(
            situation=bool(checklist_raw.get("situation", False)),
            task=bool(checklist_raw.get("task", False)),
            action=bool(checklist_raw.get("action", False)),
            result=bool(checklist_raw.get("result", False))
        )

        # 7. STAR COMPLETION PHẢI TÍNH THEO CHECKLIST
        completion_count = sum([
            checklist.situation, checklist.task, checklist.action, checklist.result
        ])
        star_completion = completion_count * 25

        summary = result.get("summary") or "Đánh giá hoàn thành một phần cấu trúc STAR."

        # Parse improvedAnswer
        improved_raw = result.get("improvedAnswer", {})
        # If AI didn't return, fallback to generic
        improved = ImprovedAnswer(
            situation=improved_raw.get("situation") or "Trong một dự án hoặc tình huống học tập, tôi từng gặp một vấn đề cần xử lý liên quan đến câu hỏi này.",
            task=improved_raw.get("task") or "Nhiệm vụ của tôi là xác định vấn đề, chịu trách nhiệm phần việc được giao và đóng góp giải pháp phù hợp.",
            action=improved_raw.get("action") or "Tôi chủ động trao đổi với các thành viên, phân tích nguyên nhân, ưu tiên việc quan trọng và thực hiện các bước cần thiết để cải thiện tình huống.",
            result=improved_raw.get("result") or "Kết quả là vấn đề được xử lý tốt hơn, nhóm phối hợp hiệu quả hơn và tôi rút ra bài học về cách làm việc chuyên nghiệp."
        )

        return EvaluateHrAnswerResponse(
            summary=summary,
            starCompletion=star_completion,
            starChecklist=checklist,
            starAnalysis=star_analysis,
            strengths=result.get("strengths", []),
            weaknesses=result.get("weaknesses", []),
            improvementSuggestions=result.get("improvementSuggestions", []),
            improvedAnswer=improved,
            nextRecommendation=result.get("nextRecommendation", ""),
            usage=TokenUsageInfo(**usage_data)
        )
    except Exception as e:
        print(f"[HR] Error evaluating answer: {e}")
        return _build_fallback_evaluation(question=req.question, answer=req.answer, role=req.role, difficulty=req.difficulty)


# ═══════════════════════════════════════════════
# Endpoint 3: Tổng kết cuối bài
# ═══════════════════════════════════════════════

@router.post("/final-evaluation", response_model=FinalEvaluationResponse)
async def final_evaluation(req: FinalEvaluationRequest):
    """
    Tổng kết toàn bộ phiên phỏng vấn HR sau 10 câu.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("AIza"):
        avg = round(sum(a.score for a in req.answers) / max(len(req.answers), 1), 1)
        return _build_fallback_final(avg, req.difficulty)

    try:
        # Tạo bản tóm tắt 10 câu cho AI
        answers_text = ""
        valid_answers = 0
        for i, ans in enumerate(req.answers, 1):
            answers_text += f"Question {i}:\n{ans.question}\n\n"
            if not ans.answer and not ans.transcript:
                answers_text += "Candidate Answer:\n[No answer submitted / missingData = true]\n\n---\n\n"
            else:
                valid_answers += 1
                display_ans = ans.transcript if ans.transcript else ans.answer
                answers_text += f"Candidate Answer:\n{display_ans}\n\n"
                answers_text += f"Duration: {ans.durationSeconds} seconds\n"
                answers_text += f"Word Count: {ans.wordCount}\n"
                answers_text += f"Filler Words: {ans.fillerWords}\n\n---\n\n"

        if valid_answers == 0:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="No valid answers found for evaluation.")

        print(f"[HR Final Eval] SessionId: {req.session_id}")
        print(f"[HR Final Eval] Questions count: {len(req.answers)}")
        print(f"[HR Final Eval] Answers count: {valid_answers}")
        print(f"[HR Final Eval] answers_summary length: {len(answers_text)}")

        prompt = HR_FINAL_EVALUATION_PROMPT.format(
            role=req.role,
            difficulty=req.difficulty,
            session_id=req.session_id,
            answers_summary=answers_text
        )

        result, usage_data = await call_openai_with_usage(prompt)

        return FinalEvaluationResponse(
            compositeScores=CompositeScores(**result.get("compositeScores", {})),
            questionEvaluations=[FinalQuestionEvaluation(**q) for q in result.get("questionEvaluations", [])],
            strengths=[FinalStrength(**s) for s in result.get("strengths", [])],
            improvements=[FinalImprovement(**i) for i in result.get("improvements", [])],
            recommendedPractice=[RecommendedPractice(**r) for r in result.get("recommendedPractice", [])],
            summary=result.get("summary", "Ứng viên đã hoàn thành phỏng vấn HR."),
            usage=TokenUsageInfo(**usage_data)
        )
    except Exception as e:
        print(f"[HR] Error in final evaluation: {e}")
        traceback.print_exc()
        return _build_fallback_final()


# ═══════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════

def _clamp_score(score) -> float:
    """1. THÊM HELPER CLAMP SCORE"""
    try:
        value = float(score)
        return max(0.0, min(10.0, value))
    except:
        return 0.0


def _build_fallback_questions(role: str, difficulty: str) -> list:
    """Trả 10 câu hỏi mẫu khi AI Service lỗi."""
    categories = [
        "Giới thiệu bản thân", "Mục tiêu nghề nghiệp", "Điểm mạnh / điểm yếu",
        "Làm việc nhóm", "Xử lý mâu thuẫn", "Áp lực deadline",
        "Học công nghệ mới", "Tư duy giải quyết vấn đề",
        "Trách nhiệm trong dự án", "Lý do phù hợp vị trí"
    ]
    questions = [
        "Hãy giới thiệu ngắn gọn về bản thân bạn.",
        f"Mục tiêu nghề nghiệp 3 năm tới của bạn trong ngành IT là gì?",
        "Điểm mạnh lớn nhất của bạn là gì? Hãy kể ví dụ cụ thể.",
        "Hãy kể về một lần bạn làm việc nhóm trong dự án lập trình.",
        "Bạn xử lý thế nào khi không đồng ý với ý kiến của thành viên khác trong team?",
        "Bạn làm gì khi gặp deadline gấp mà còn nhiều task chưa hoàn thành?",
        "Kể về một công nghệ mới bạn đã tự học gần đây và cách bạn tiếp cận.",
        "Khi gặp một bug khó, quy trình debug của bạn như thế nào?",
        "Hãy mô tả một dự án bạn chịu trách nhiệm chính và vai trò của bạn.",
        f"Vì sao bạn nghĩ mình phù hợp với vị trí {role} ở cấp độ {difficulty}?"
    ]
    
    return [
        GeneratedQuestion(
            questionIndex=i + 1,
            category=categories[i],
            questionText=questions[i],
            expectedAnswerGuide="Ứng viên nên trả lời có cấu trúc STAR với ví dụ cụ thể."
        )
        for i in range(10)
    ]


def _sanitize_strengths(strengths: list, overall: float, star_completion: int, word_count: int, checklist: StarChecklist) -> list:
    banned_generic_strengths = [
        "trình bày mạch lạc", "dễ hiểu", "ngắn gọn", "có cố gắng",
        "thái độ tích cực", "tự tin", "khá tốt", "ổn"
    ]

    if overall < 4.0 or star_completion < 50 or word_count < 20:
        return []

    if not any([checklist.situation, checklist.task, checklist.action, checklist.result]):
        return []

    clean = []
    for s in strengths or []:
        text = s.strip()
        lower = text.lower()
        if not text:
            continue
        if any(banned in lower for banned in banned_generic_strengths):
            continue
        clean.append(text)

    return clean[:5]


def _build_fallback_evaluation(question: str = "", answer: str = "", role: str = "Developer", difficulty: str = "Fresher") -> EvaluateHrAnswerResponse:
    return EvaluateHrAnswerResponse(
        summary="Không có dữ liệu hợp lệ để đánh giá hoặc hệ thống AI tạm thời không khả dụng.",
        starCompletion=0,
        starChecklist=StarChecklist(situation=False, task=False, action=False, result=False),
        starAnalysis=StarAnalysis(
            situation=StarScoreItem(score=0.0, feedback=""),
            task=StarScoreItem(score=0.0, feedback=""),
            action=StarScoreItem(score=0.0, feedback=""),
            result=StarScoreItem(score=0.0, feedback="")
        ),
        strengths=[],
        weaknesses=[],
        improvementSuggestions=[],
        improvedAnswer=ImprovedAnswer(situation="", task="", action="", result=""),
        nextRecommendation=""
    )


def _build_fallback_final() -> FinalEvaluationResponse:
    return FinalEvaluationResponse(
        compositeScores=CompositeScores(),
        questionEvaluations=[],
        strengths=[],
        improvements=[],
        recommendedPractice=[],
        summary="Không có dữ liệu hợp lệ để đánh giá."
    )
