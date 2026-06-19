"""
Coding Question Bank AI Generator Routes — Python FastAPI

Endpoint:
  POST /ai/coding/generate-problem

Nhiệm vụ:
  - Nhận tên bài / link LeetCode / mô tả ngắn từ Admin
  - Gọi OpenAI để sinh toàn bộ dữ liệu bài coding
  - Trả về JSON đầy đủ cho Admin xem trước và chỉnh sửa
  - KHÔNG tự động lưu vào database

Output bao gồm:
  - Tiêu đề, mô tả ngắn, mô tả bài toán (được viết lại)
  - Độ khó + giải thích
  - Category, Tags, Role
  - Input/Output format, Constraints, Examples
  - Public Test Cases (≥5), Hidden Test Cases (≥10)
  - Starter Code (Java, Python, C#, JavaScript)
  - Solution (Java, Python, C#, JavaScript)
  - Time/Space Complexity
  - Quality check flags
"""

import json
import os
import traceback
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from services.openai_service import call_openai

try:
    from openai import RateLimitError, AuthenticationError, PermissionDeniedError
except ImportError:
    # Fallback if openai version doesn't export these
    RateLimitError = Exception
    AuthenticationError = Exception
    PermissionDeniedError = Exception

router = APIRouter(prefix="/ai/coding", tags=["Coding Question Bank"])


# ═══════════════════════════════════════════════
# Pydantic Schemas
# ═══════════════════════════════════════════════

class GenerateCodingProblemRequest(BaseModel):
    prompt: str = Field(..., description="Tên bài LeetCode, link, hoặc mô tả ngắn. Ví dụ: 'Two Sum'")


class TestCase(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = None


class StarterCodeMap(BaseModel):
    java: str = ""
    python: str = ""
    csharp: str = ""
    javascript: str = ""


class SolutionEntry(BaseModel):
    idea: str
    pseudocode: str
    code: str


class SolutionMap(BaseModel):
    java: Optional[SolutionEntry] = None
    python: Optional[SolutionEntry] = None
    csharp: Optional[SolutionEntry] = None
    javascript: Optional[SolutionEntry] = None


class ComplexityAnalysis(BaseModel):
    timeComplexity: str
    spaceComplexity: str
    explanation: str


class DifficultyInfo(BaseModel):
    level: str      # Easy | Medium | Hard
    reason: str


class QualityCheck(BaseModel):
    descriptionValid: bool = True
    testCasesValid: bool = True
    solutionValidated: bool = True


class GenerateCodingProblemResponse(BaseModel):
    title: str
    shortDescription: str
    description: str
    difficulty: DifficultyInfo
    category: str
    role: str
    tags: List[str]
    inputFormat: str
    outputFormat: str
    constraints: List[str]
    examples: List[TestCase]
    publicTestCases: List[TestCase]
    hiddenTestCases: List[TestCase]
    supportedLanguages: List[str]
    starterCode: Dict[str, str]
    solution: Dict[str, Any]
    complexity: ComplexityAnalysis
    qualityCheck: QualityCheck


# ═══════════════════════════════════════════════
# Build Prompt
# ═══════════════════════════════════════════════

def build_generation_prompt(user_prompt: str) -> str:
    return f"""
You are a Senior Software Engineer and Technical Interviewer with 15+ years of experience designing coding interview problems.

The admin has requested to create a coding interview problem based on this input:
"{user_prompt}"

Your task is to generate a COMPLETE coding problem in JSON format. IMPORTANT RULES:
1. Do NOT copy text verbatim from LeetCode or any other source.
2. Rewrite the problem description in your own words while preserving the algorithm logic.
3. Generate at least 5 public test cases and at least 10 hidden test cases.
4. All starter code must be syntactically valid (compilable) but contain NO solution logic.
5. Solutions must be complete and correct implementations.
6. Self-verify: ensure all test cases pass the solution before returning.

Return a single valid JSON object with this EXACT structure:

{{
  "title": "Creative title for the problem (not a copy of LeetCode title)",
  "shortDescription": "One sentence summary of what to solve (under 100 chars)",
  "description": "Full problem description in 3-5 paragraphs. Written from scratch. Professional tone. Explain context, objective, and constraints. In Vietnamese is acceptable.",
  "difficulty": {{
    "level": "Easy",
    "reason": "Bullet points explaining why: what data structures needed, target level (Intern/Fresher/Junior/etc.)"
  }},
  "category": "Main algorithm category e.g. Array, Hash Table, Dynamic Programming",
  "role": "Target job role e.g. Software Engineer - Intern",
  "tags": ["tag1", "tag2", "tag3"],
  "inputFormat": "Describe input format clearly",
  "outputFormat": "Describe expected output format clearly",
  "constraints": [
    "2 <= nums.length <= 10^4",
    "All values are unique"
  ],
  "examples": [
    {{
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0,1]",
      "explanation": "Because nums[0] + nums[1] == 9"
    }}
  ],
  "publicTestCases": [
    {{
      "input": "...",
      "output": "...",
      "explanation": "optional explanation"
    }}
  ],
  "hiddenTestCases": [
    {{
      "input": "...",
      "output": "..."
    }}
  ],
  "supportedLanguages": ["Java", "Python", "C#", "JavaScript"],
  "starterCode": {{
    "java": "class Solution {{\\n    public int[] solve(int[] nums, int target) {{\\n        // Your code here\\n    }}\\n}}",
    "python": "class Solution:\\n    def solve(self, nums: list[int], target: int) -> list[int]:\\n        # Your code here\\n        pass",
    "csharp": "public class Solution {{\\n    public int[] Solve(int[] nums, int target) {{\\n        // Your code here\\n    }}\\n}}",
    "javascript": "/**\\n * @param {{number[]}} nums\\n * @param {{number}} target\\n * @return {{number[]}}\\n */\\nvar solve = function(nums, target) {{\\n    // Your code here\\n}};"
  }},
  "solution": {{
    "java": {{
      "idea": "Explain approach in 2-3 sentences",
      "pseudocode": "Step by step pseudocode",
      "code": "Complete Java solution code"
    }},
    "python": {{
      "idea": "Explain approach in 2-3 sentences",
      "pseudocode": "Step by step pseudocode",
      "code": "Complete Python solution code"
    }},
    "csharp": {{
      "idea": "Explain approach in 2-3 sentences",
      "pseudocode": "Step by step pseudocode",
      "code": "Complete C# solution code"
    }},
    "javascript": {{
      "idea": "Explain approach in 2-3 sentences",
      "pseudocode": "Step by step pseudocode",
      "code": "Complete JavaScript solution code"
    }}
  }},
  "complexity": {{
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "explanation": "Explain why this is the time and space complexity"
  }},
  "qualityCheck": {{
    "descriptionValid": true,
    "testCasesValid": true,
    "solutionValidated": true
  }}
}}

REQUIREMENTS:
- publicTestCases: MINIMUM 5 entries
- hiddenTestCases: MINIMUM 10 entries (include edge cases: empty arrays, single element, negatives, large values, duplicates)
- Starter code: Must have placeholder comments and correct method signatures, NO logic
- Solutions: Must be 100% correct, well-commented implementations
- All string values in JSON must use \\n for newlines inside code fields
"""


# ═══════════════════════════════════════════════
# Endpoint
# ═══════════════════════════════════════════════

@router.post("/generate-problem", response_model=None)
async def generate_coding_problem(request: GenerateCodingProblemRequest):
    """
    AI Assistant: Generate a complete coding problem for Admin review.
    The Admin must manually review, edit, and save — NOT auto-published.
    """
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key or api_key.startswith("AIza"):
        # Mock fallback for development without API key
        raise HTTPException(
            status_code=503,
            detail="OpenAI API Key chưa được cấu hình hoặc không hợp lệ. Vui lòng kiểm tra file .env."
        )

    try:
        print(f"\n[AI Coding Generator] Generating problem for prompt: '{request.prompt}'")
        prompt = build_generation_prompt(request.prompt)

        result = await call_openai(prompt, model="gpt-4o-mini")

        # Remove internal usage metadata before returning to client
        result.pop("usage", None)
        result.pop("model", None)

        # Validate minimum test case counts
        public_cases = result.get("publicTestCases", [])
        hidden_cases = result.get("hiddenTestCases", [])

        if len(public_cases) < 5:
            print(f"[AI Coding Generator] Warning: Only {len(public_cases)} public test cases generated (minimum 5)")
        if len(hidden_cases) < 10:
            print(f"[AI Coding Generator] Warning: Only {len(hidden_cases)} hidden test cases generated (minimum 10)")

        print(f"[AI Coding Generator] Successfully generated: '{result.get('title', 'Unknown')}' | Difficulty: {result.get('difficulty', {}).get('level', 'Unknown')} | Public: {len(public_cases)} | Hidden: {len(hidden_cases)}")

        return result

    except HTTPException:
        raise
    except RateLimitError as e:
        # Handles openai.RateLimitError — covers both quota exceeded and rate limiting
        err_str = str(e)
        print(f"[AI Coding Generator] RateLimitError: {err_str}")
        if "insufficient_quota" in err_str or "quota" in err_str.lower():
            raise HTTPException(
                status_code=402,
                detail="⚠️ OpenAI API key đã hết quota. Vui lòng nạp thêm credit tại: https://platform.openai.com/account/billing"
            )
        raise HTTPException(
            status_code=429,
            detail="⏳ AI đang bận, vui lòng thử lại sau vài giây."
        )
    except AuthenticationError as e:
        print(f"[AI Coding Generator] AuthenticationError: {e}")
        raise HTTPException(
            status_code=503,
            detail="❌ OpenAI API Key không hợp lệ. Vui lòng kiểm tra lại file .env trong thư mục ai-service."
        )
    except Exception as e:
        err_str = str(e)
        print(f"[AI Coding Generator] Unexpected error: {err_str}")
        traceback.print_exc()

        # Fallback string detection for cases not caught by typed handlers
        if "insufficient_quota" in err_str or "quota" in err_str.lower():
            raise HTTPException(
                status_code=402,
                detail="⚠️ OpenAI API key đã hết quota. Vui lòng nạp thêm credit tại: https://platform.openai.com/account/billing"
            )
        if "invalid_api_key" in err_str or "Incorrect API key" in err_str:
            raise HTTPException(
                status_code=503,
                detail="❌ OpenAI API Key không hợp lệ. Vui lòng kiểm tra lại file .env."
            )

        raise HTTPException(
            status_code=500,
            detail=f"Không thể sinh bài coding: {err_str}"
        )


