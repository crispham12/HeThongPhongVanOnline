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


# ═══════════════════════════════════════════════
# New Full Mock Endpoints
# ═══════════════════════════════════════════════

class FullMockCodingProblem(BaseModel):
    title: str
    description: str          # Mô tả bài toán đầy đủ
    difficulty: str           # "Easy" | "Medium" | "Hard"
    examples: List[Dict]      # [{"input": "...", "output": "...", "explanation": "..."}]
    constraints: List[str]    # ["1 <= n <= 1000", ...]
    test_cases: List[Dict]    # [{"input": "...", "expected_output": "..."}]
    starter_code: Dict[str, str]  # {"python": "def solution(...):", "javascript": "function solution(...) {", "java": "class Solution {"}

class GenerateFullMockCodingRequest(BaseModel):
    role: str = Field(..., description="backend | frontend | fullstack | data")
    difficulty_level: str = Field(..., description="intern | fresher | junior")
    stack: List[str] = Field(default=[], description="Tech stack user đã chọn")

class GenerateFullMockCodingResponse(BaseModel):
    problems: List[FullMockCodingProblem]  # Luôn 3 bài: Easy, Medium, Hard

@router.post("/full-mock/generate", response_model=GenerateFullMockCodingResponse)
async def generate_full_mock_coding(req: GenerateFullMockCodingRequest):
    """Sinh 3 bài coding tăng dần độ khó cho Full Mock Interview"""
    
    prompt = f"""Bạn là người ra đề phỏng vấn kỹ thuật tại công ty công nghệ hàng đầu.

Hãy tạo CHÍNH XÁC 3 bài coding cho ứng viên vị trí {req.role} cấp độ {req.difficulty_level}.
Tech stack: {', '.join(req.stack) if req.stack else 'General'}

YÊU CẦU:
- Bài 1: Easy — cấu trúc dữ liệu cơ bản, array/string manipulation
- Bài 2: Medium — thuật toán trung bình, có thể dùng HashMap/Stack/Queue
- Bài 3: Hard — thuật toán phức tạp, Dynamic Programming hoặc Graph

Mỗi bài phải có:
- title: tên bài ngắn gọn
- description: mô tả bài toán rõ ràng bằng tiếng Việt
- difficulty: "Easy" | "Medium" | "Hard"
- examples: 2-3 ví dụ với input, output, explanation
- constraints: 3-5 ràng buộc
- test_cases: CHÍNH XÁC 5 test cases (input và expected_output là các chuỗi string thô đại diện cho stdin và expected stdout. Chú ý: input và expected_output phải khớp định dạng và không được chứa code hay định dạng phức tạp)
- starter_code: code khởi đầu cho python, javascript, java

QUAN TRỌNG: Trả về JSON hợp lệ theo format sau, không có markdown:
{{
  "problems": [
    {{
      "title": "...",
      "description": "...",
      "difficulty": "Easy",
      "examples": [{{"input": "...", "output": "...", "explanation": "..."}}],
      "constraints": ["..."],
      "test_cases": [{{"input": "...", "expected_output": "..."}}],
      "starter_code": {{"python": "...", "javascript": "...", "java": "..."}}
    }},
    // bài 2 Medium
    // bài 3 Hard
  ]
}}"""

    try:
        response = await call_openai(prompt)
        # response is already a dict returned by call_openai because call_openai uses json.loads
        return GenerateFullMockCodingResponse(**response)
    except Exception as e:
        print(f"[Coding] Error generating full mock coding problems: {e}. Using fallback problems.")
        
        fallback_problems = [
            {
                "title": "Đảo ngược chuỗi (Reverse String)",
                "description": "Viết một hàm nhận đầu vào là một chuỗi và trả về chuỗi đảo ngược của nó. Ví dụ: 'hello' -> 'olleh'.",
                "difficulty": "Easy",
                "examples": [
                    {"input": "hello", "output": "olleh", "explanation": "Chuỗi đảo ngược của hello là olleh."}
                ],
                "constraints": [
                    "Độ dài chuỗi từ 1 đến 1000 ký tự."
                ],
                "test_cases": [
                    {"input": "hello", "expected_output": "olleh"},
                    {"input": "a", "expected_output": "a"},
                    {"input": "world", "expected_output": "dlrow"},
                    {"input": "mock", "expected_output": "kcom"},
                    {"input": "test", "expected_output": "tset"}
                ],
                "starter_code": {
                    "python": "def solution(s: str) -> str:\n    # Viết code ở đây\n    return s[::-1]",
                    "javascript": "function solution(s) {\n    // Viết code ở đây\n    return s.split('').reverse().join('');\n}",
                    "java": "class Solution {\n    public String solution(String s) {\n        // Viết code ở đây\n        return new StringBuilder(s).reverse().toString();\n    }\n}"
                }
            },
            {
                "title": "Kiểm tra chuỗi ngoặc hợp lệ (Valid Parentheses)",
                "description": "Cho một chuỗi chỉ chứa các ký tự '(', ')', '{', '}', '[' và ']'. Xác định xem chuỗi đầu vào có hợp lệ hay không. Một chuỗi đầu vào hợp lệ khi: Các ngoặc mở phải được đóng bằng cùng một loại ngoặc, và theo đúng thứ tự.",
                "difficulty": "Medium",
                "examples": [
                    {"input": "()[]{}", "output": "true", "explanation": "Các cặp ngoặc mở đều có ngoặc đóng tương ứng."}
                ],
                "constraints": [
                    "Độ dài chuỗi từ 1 đến 10^4."
                ],
                "test_cases": [
                    {"input": "()", "expected_output": "true"},
                    {"input": "()[]{}", "expected_output": "true"},
                    {"input": "(]", "expected_output": "false"},
                    {"input": "([)]", "expected_output": "false"},
                    {"input": "{[]}", "expected_output": "true"}
                ],
                "starter_code": {
                    "python": "def solution(s: str) -> str:\n    # Viết code ở đây, trả về 'true' hoặc 'false'\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top: return 'false'\n        else:\n            stack.append(char)\n    return 'true' if not stack else 'false'",
                    "javascript": "function solution(s) {\n    // Viết code ở đây, trả về 'true' hoặc 'false'\n    const stack = [];\n    const mapping = {')': '(', '}': '{', ']': '['};\n    for (let char of s) {\n        if (char in mapping) {\n            let top = stack.length ? stack.pop() : '#';\n            if (mapping[char] !== top) return 'false';\n        } else {\n            stack.push(char);\n        }\n    }\n    return stack.length === 0 ? 'true' : 'false';\n}",
                    "java": "import java.util.Stack;\nclass Solution {\n    public String solution(String s) {\n        // Viết code ở đây, trả về \"true\" hoặc \"false\"\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(' || c == '{' || c == '[') {\n                stack.push(c);\n            } else {\n                if (stack.isEmpty()) return \"false\";\n                char top = stack.pop();\n                if (c == ')' && top != '(') return \"false\";\n                if (c == '}' && top != '{') return \"false\";\n                if (c == ']' && top != '[') return \"false\";\n            }\n        }\n        return stack.isEmpty() ? \"true\" : \"false\";\n    }\n}"
                }
            },
            {
                "title": "Tổng lớn nhất của mảng con (Maximum Subarray)",
                "description": "Tìm mảng con liên tiếp (chứa ít nhất một số) có tổng lớn nhất trong một mảng số nguyên. Ví dụ: [-2,1,-3,4,-1,2,1,-5,4] -> 6 (mảng con [4,-1,2,1]). Input nhận vào là chuỗi các số cách nhau bởi dấu phẩy.",
                "difficulty": "Hard",
                "examples": [
                    {"input": "-2,1,-3,4,-1,2,1,-5,4", "output": "6", "explanation": "Mảng con [4,-1,2,1] có tổng lớn nhất bằng 6."}
                ],
                "constraints": [
                    "Số lượng phần tử từ 1 đến 10^5."
                ],
                "test_cases": [
                    {"input": "-2,1,-3,4,-1,2,1,-5,4", "expected_output": "6"},
                    {"input": "1", "expected_output": "1"},
                    {"input": "5,4,-1,7,8", "expected_output": "23"},
                    {"input": "-1", "expected_output": "-1"},
                    {"input": "-2,-1,-3", "expected_output": "-1"}
                ],
                "starter_code": {
                    "python": "def solution(s: str) -> str:\n    # Viết code ở đây, s là chuỗi số cách nhau bởi dấu phẩy\n    nums = [int(x) for x in s.split(',')]\n    max_so_far = nums[0]\n    curr_max = nums[0]\n    for x in nums[1:]:\n        curr_max = max(x, curr_max + x)\n        max_so_far = max(max_so_far, curr_max)\n    return str(max_so_far)",
                    "javascript": "function solution(s) {\n    // Viết code ở đây, s là chuỗi số cách nhau bởi dấu phẩy\n    const nums = s.split(',').map(Number);\n    let maxSoFar = nums[0];\n    let currMax = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        currMax = Math.max(nums[i], currMax + nums[i]);\n        maxSoFar = Math.max(maxSoFar, currMax);\n    }\n    return String(maxSoFar);\n}",
                    "java": "class Solution {\n    public String solution(String s) {\n        // Viết code ở đây, s là chuỗi số cách nhau bởi dấu phẩy\n        String[] parts = s.split(\",\");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) {\n            nums[i] = Integer.parseInt(parts[i].trim());\n        }\n        int maxSoFar = nums[0];\n        int currMax = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            currMax = Math.max(nums[i], currMax + nums[i]);\n            maxSoFar = Math.max(maxSoFar, currMax);\n        }\n        return String.valueOf(maxSoFar);\n    }\n}"
                }
            }
        ]
        
        return GenerateFullMockCodingResponse(problems=[FullMockCodingProblem(**p) for p in fallback_problems])


class EvaluateFullMockCodingRequest(BaseModel):
    problem_title: str
    problem_description: str
    user_code: str
    language: str                    # "python" | "javascript" | "java"
    test_results: List[Dict]         # [{"input": "...", "expected": "...", "actual": "...", "passed": bool}]
    passed_count: int
    total_count: int

class EvaluateFullMockCodingResponse(BaseModel):
    score: int                        # 0-100
    test_score: int                   # 0-50 (từ test cases)
    quality_score: int                # 0-30 (code quality)
    complexity_score: int             # 0-20 (time/space complexity)
    feedback: str                     # Nhận xét tổng quan tiếng Việt
    code_quality_notes: str           # Nhận xét code quality
    complexity_notes: str             # Nhận xét độ phức tạp
    improvement_suggestions: List[str] # 2-3 gợi ý cải thiện

@router.post("/full-mock/evaluate", response_model=EvaluateFullMockCodingResponse)
async def evaluate_full_mock_coding(req: EvaluateFullMockCodingRequest):
    """AI chấm bài coding sau khi đã chạy qua Piston"""
    
    test_score = round((req.passed_count / req.total_count) * 50) if req.total_count > 0 else 0
    
    test_summary = "\n".join([
        f"- Test {i+1}: {'✓ PASS' if r.get('passed') else '✗ FAIL'} | Input: {r.get('input')} | Expected: {r.get('expected')} | Actual: {r.get('actual')}"
        for i, r in enumerate(req.test_results)
    ])
    
    prompt = f"""Bạn là technical interviewer chấm bài coding phỏng vấn.

BÀI TOÁN: {req.problem_title}
{req.problem_description}

CODE ỨNG VIÊN ({req.language}):
```{req.language}
{req.user_code}
```

KẾT QUẢ CHẠY TEST ({req.passed_count}/{req.total_count} tests passed):
{test_summary}

ĐIỂM TEST CASES ĐÃ TÍNH: {test_score}/50

Hãy chấm thêm 2 tiêu chí sau và trả về JSON:

1. CODE QUALITY (0-30 điểm):
   - Đặt tên biến/hàm rõ ràng: 0-10
   - Cấu trúc code sạch, dễ đọc: 0-10  
   - Xử lý edge cases: 0-10

2. COMPLEXITY (0-20 điểm):
   - Time complexity phù hợp: 0-10
   - Space complexity phù hợp: 0-10

Trả về JSON (không có markdown):
{{
  "quality_score": <0-30>,
  "complexity_score": <0-20>,
  "feedback": "<nhận xét tổng quan 2-3 câu tiếng Việt>",
  "code_quality_notes": "<nhận xét code quality 1-2 câu>",
  "complexity_notes": "<nhận xét độ phức tạp 1-2 câu, ước tính Big O>",
  "improvement_suggestions": ["<gợi ý 1>", "<gợi ý 2>", "<gợi ý 3>"]
}}"""

    try:
        response = await call_openai(prompt)
        # response is already a dict
        quality_score = min(30, max(0, response.get("quality_score", 0)))
        complexity_score = min(20, max(0, response.get("complexity_score", 0)))
        total_score = test_score + quality_score + complexity_score
        
        return EvaluateFullMockCodingResponse(
            score=total_score,
            test_score=test_score,
            quality_score=quality_score,
            complexity_score=complexity_score,
            feedback=response.get("feedback", ""),
            code_quality_notes=response.get("code_quality_notes", ""),
            complexity_notes=response.get("complexity_notes", ""),
            improvement_suggestions=response.get("improvement_suggestions", [])
        )
    except Exception as e:
        # Fallback: chỉ tính điểm test cases nếu AI lỗi
        return EvaluateFullMockCodingResponse(
            score=test_score,
            test_score=test_score,
            quality_score=0,
            complexity_score=0,
            feedback=f"Không thể phân tích chi tiết do lỗi AI: {str(e)}. Điểm dựa trên test cases.",
            code_quality_notes="",
            complexity_notes="",
            improvement_suggestions=[]
        )


