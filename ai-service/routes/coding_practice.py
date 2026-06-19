"""
coding_practice.py — Coding Practice Judge Endpoints
=====================================================
Routes:
  POST /ai/practice/run    — Run code against public test cases (no AI, no save)
  POST /ai/practice/submit — Run code against all test cases + AI code review

Design:
  - Code execution is handled by coding_executor.execute_code()
  - AI review is called ONLY after all test cases complete, and ONLY on submit
  - If AI fails → still return real test results with error note in aiFeedback
  - Memory usage is measured by psutil when available (real RSS), else 0.0
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import asyncio

from utils.coding_executor import execute_code
from services.openai_service import call_openai_with_usage

router = APIRouter(prefix="/ai/practice", tags=["Coding Practice"])


# ═══════════════════════════════════════════════
# Request / Response Schemas
# ═══════════════════════════════════════════════

class TestCaseSchema(BaseModel):
    input: str
    expectedOutput: str
    isHidden: Optional[bool] = False


class CodeRunRequest(BaseModel):
    language: str
    code: str
    testCases: List[TestCaseSchema]
    functionName: Optional[str] = None
    methodSignature: Optional[str] = None
    returnType: Optional[str] = None


class CodeSubmitRequest(BaseModel):
    problemTitle: str
    problemDescription: str
    language: str
    code: str
    testCases: List[TestCaseSchema]
    functionName: Optional[str] = None
    methodSignature: Optional[str] = None
    returnType: Optional[str] = None


# ═══════════════════════════════════════════════
# Helpers
# ═══════════════════════════════════════════════

def _determine_status(results: list, passed: int, total: int) -> str:
    """Classify overall submission status from individual test results."""
    if total == 0:
        return "NoTestCases"
    if any(r.get("status") == "CompileError" for r in results):
        return "CompileError"
    if any(r.get("status") == "Timeout" for r in results):
        return "Timeout"
    if any(r.get("status") == "RuntimeError" for r in results):
        return "RuntimeError"
    if passed == total:
        return "Accepted"
    return "WrongAnswer"


def _compute_runtime_ms(results: list) -> int:
    """Sum execution times across all test cases."""
    return int(sum(r.get("executionTimeMs", 0) for r in results))


def _compute_memory_mb(results: list) -> float:
    """Take the peak memory across all test cases (max memoryMb)."""
    values = [r.get("memoryMb", 0.0) for r in results if r.get("memoryMb", 0.0) > 0]
    return round(max(values), 2) if values else 0.0


def _safe_score(passed: int, total: int) -> float:
    if total == 0:
        return 0.0
    return round((passed / total) * 100, 1)


# ═══════════════════════════════════════════════
# POST /ai/practice/run
# ═══════════════════════════════════════════════

@router.post("/run")
async def run_code(req: CodeRunRequest):
    """
    Execute code against public test cases only.
    - Does NOT call AI
    - Does NOT save any attempt
    - Returns raw test case results for immediate display
    """
    if not req.code or not req.code.strip():
        raise HTTPException(status_code=400, detail="Code không được để trống.")
    if not req.testCases:
        raise HTTPException(status_code=400, detail="Không có test case nào để chạy.")

    try:
        tcs = [
            {"input": tc.input, "expectedOutput": tc.expectedOutput}
            for tc in req.testCases
        ]

        # Run in thread pool to not block the event loop
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(
            None, 
            execute_code, 
            req.language, 
            req.code, 
            tcs,
            req.functionName,
            req.methodSignature,
            req.returnType
        )

        passed = sum(1 for r in results if r.get("passed"))
        total = len(results)

        return {
            "results": results,
            "passedTestCases": passed,
            "totalTestCases": total,
            "runtimeMs": _compute_runtime_ms(results),
            "memoryUsageMb": _compute_memory_mb(results),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code execution failed: {str(e)}")


# ═══════════════════════════════════════════════
# POST /ai/practice/submit
# ═══════════════════════════════════════════════

@router.post("/submit")
async def submit_code(req: CodeSubmitRequest):
    """
    Execute code against ALL test cases (public + hidden), then call AI review.

    Flow:
      1. Run code against all test cases (real execution)
      2. Compute pass/fail/score
      3. Determine overall status
      4. Call OpenAI for code review (non-blocking failure)
      5. Return combined result

    If OpenAI fails → still return real test results with error note.
    """
    if not req.code or not req.code.strip():
        raise HTTPException(status_code=400, detail="Code không được để trống.")
    if not req.testCases:
        raise HTTPException(status_code=400, detail="Không có test case nào để chấm.")

    # ── Step 1: Execute code ──────────────────────────────
    try:
        tcs = [
            {"input": tc.input, "expectedOutput": tc.expectedOutput}
            for tc in req.testCases
        ]

        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(
            None, 
            execute_code, 
            req.language, 
            req.code, 
            tcs,
            req.functionName,
            req.methodSignature,
            req.returnType
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code execution failed: {str(e)}")

    # ── Step 2: Compute metrics ───────────────────────────
    passed = sum(1 for r in results if r.get("passed"))
    total = len(results)
    score = _safe_score(passed, total)
    status = _determine_status(results, passed, total)
    runtime_ms = _compute_runtime_ms(results)
    memory_mb = _compute_memory_mb(results)

    # ── Step 3: AI Code Review ────────────────────────────
    ai_feedback = None
    usage_info = {"inputTokens": 0, "outputTokens": 0, "totalTokens": 0, "model": "gpt-4o-mini"}

    api_key = os.getenv("OPENAI_API_KEY")
    has_valid_key = bool(api_key) and not api_key.startswith("AIza") or (
        bool(api_key) and api_key.startswith("AIza")  # Gemini also works via compat layer
    )

    if has_valid_key:
        try:
            prompt = f"""Bạn là Senior Tech Lead và chuyên gia thuật toán. Hãy đánh giá bài nộp của ứng viên cho bài toán sau:

**Tên bài:** {req.problemTitle}

**Mô tả bài toán:**
{req.problemDescription[:1000]}

**Ngôn ngữ lập trình:** {req.language}

**Code của ứng viên:**
```{req.language.lower()}
{req.code}
```

**Kết quả chạy test:**
- Passed: {passed}/{total} test cases
- Trạng thái: {status}
- Tổng thời gian thực thi: {runtime_ms}ms

Hãy đánh giá code theo các tiêu chí:
1. Tính đúng đắn và logic thuật toán
2. Độ sạch code, đặt tên biến, cấu trúc code
3. Xử lý edge case
4. Độ phức tạp thời gian và không gian (Big O)

Phản hồi bằng tiếng Việt. Trả về JSON với schema sau:
{{
  "timeComplexity": "<Big O string, ví dụ: O(n)>",
  "spaceComplexity": "<Big O string>",
  "strengths": ["điểm mạnh 1", "điểm mạnh 2"],
  "weaknesses": ["điểm yếu 1", "điểm yếu 2"],
  "suggestions": ["gợi ý cải thiện 1", "gợi ý cải thiện 2"]
}}"""

            ai_res, usage_info = await call_openai_with_usage(prompt)
            ai_feedback = {
                "strengths": ai_res.get("strengths", []),
                "weaknesses": ai_res.get("weaknesses", []),
                "suggestions": ai_res.get("suggestions", []),
                "timeComplexity": ai_res.get("timeComplexity", "N/A"),
                "spaceComplexity": ai_res.get("spaceComplexity", "N/A"),
            }

        except Exception as e:
            print(f"[AI Review] Failed: {e}")
            ai_feedback = {
                "strengths": [],
                "weaknesses": [],
                "suggestions": [],
                "timeComplexity": "N/A",
                "spaceComplexity": "N/A",
                "error": "AI Feedback tạm thời không khả dụng. Vui lòng thử lại sau.",
            }
    else:
        # No valid API key → return placeholder (not fake scores)
        ai_feedback = {
            "strengths": [],
            "weaknesses": [],
            "suggestions": ["Cấu hình OPENAI_API_KEY để nhận đánh giá chi tiết từ AI."],
            "timeComplexity": "N/A",
            "spaceComplexity": "N/A",
            "error": "AI Feedback chưa được cấu hình.",
        }

    # ── Step 4: Return combined result ────────────────────
    return {
        "status": status,
        "passedTestCases": passed,
        "totalTestCases": total,
        "score": score,
        "runtimeMs": runtime_ms,
        "memoryUsageMb": memory_mb,
        "results": results,
        "aiFeedback": ai_feedback,
        "usage": usage_info,
    }
