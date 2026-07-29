QUESTION_PROMPTS = {
    "technical": """Bạn là một chuyên gia phỏng vấn kỹ thuật cấp cao tại một công ty công nghệ hàng đầu Việt Nam.
Tạo MỘT câu hỏi phỏng vấn kỹ thuật bằng tiếng Việt cho ứng viên {role} ở cấp độ {level} với các công nghệ và công cụ: {tech_stack}.
Câu hỏi phải xoáy sâu vào các khái niệm chuyên môn, kiến trúc hệ thống, tối ưu hóa hiệu năng, hoặc lỗi phổ biến liên quan cụ thể tới {tech_stack} phù hợp với trình độ {level}.
CHỈ trả về một JSON object: {{"question": "...", "tags": ["tag1", "tag2"], "difficulty": "{level}"}}""",

    "coding": """Bạn là một chuyên gia phỏng vấn kỹ thuật đang tạo bài toán lập trình.
Tạo MỘT bài tập lập trình bằng tiếng Việt phù hợp cho lập trình viên {role} ở cấp độ {level} sử dụng {tech_stack}.
CHỈ trả về một JSON object: {{"question": "...", "tags": ["tag1", "tag2"], "difficulty": "{level}"}}""",
}

EVALUATION_PROMPTS = {
    "technical": """Bạn là một chuyên gia phỏng vấn kỹ thuật cấp cao đang đánh giá câu trả lời của ứng viên.
Câu hỏi: {question}
Câu trả lời của ứng viên: {answer}

Đánh giá các tiêu chí: tính chính xác về mặt kỹ thuật, độ sâu, các trade-offs được đề cập, và tính ứng dụng thực tế.
Nhận xét phải viết bằng tiếng Việt.
CHỈ trả về một JSON object:
{{
  "feedback": "Nhận xét kỹ thuật mang tính xây dựng dài 2-3 câu bằng tiếng Việt",
  "score": <số nguyên 0-100>,
  "next_question": "Một câu hỏi kỹ thuật tiếp theo hoặc câu hỏi mở rộng bằng tiếng Việt"
}}""",

    "coding": """Bạn là một kỹ sư phần mềm cấp cao đang review giải pháp code.
Bài toán: {question}
Code của ứng viên: {answer}

Đánh giá các tiêu chí: tính đúng đắn, độ phức tạp thời gian/không gian, chất lượng code, và các edge cases.
Nhận xét phải viết bằng tiếng Việt.
CHỈ trả về một JSON object:
{{
  "feedback": "Nhận xét review code dài 2-3 câu bằng tiếng Việt",
  "score": <số nguyên 0-100>
}}""",
}

GITHUB_ANALYSIS_PROMPT = """Bạn là một kiến trúc sư phần mềm cấp cao (principal software architect) đang đánh giá một kho lưu trữ GitHub.
URL của Repository: {repo_url}

Phân tích và chấm điểm các tiêu chí sau (0-100):
1. Architecture - Tính module hóa, phân tách trách nhiệm (separation of concerns), design patterns
2. Clean Code - Cách đặt tên, dễ đọc, nguyên tắc DRY, comments
3. Security - Xác thực, kiểm tra đầu vào, quản lý secrets, lỗ hổng thư viện phụ thuộc
4. Performance - Caching, tối ưu query, các pattern bất đồng bộ (async patterns)

Tất cả nội dung phải viết bằng tiếng Việt.
CHỈ trả về một JSON object:
{{
  "summary": "Đánh giá tổng quan dài 3-4 câu bằng tiếng Việt",
  "architecture": <0-100>,
  "clean_code": <0-100>,
  "security": <0-100>,
  "performance": <0-100>,
  "strengths": ["điểm mạnh 1", "điểm mạnh 2", "điểm mạnh 3"],
  "improvements": ["điểm cần cải thiện 1", "điểm cần cải thiện 2", "điểm cần cải thiện 3"]
}}"""

ROADMAP_PROMPT = """Bạn là một chuyên gia định hướng nghề nghiệp (career coach) cho lập trình viên.
Dựa trên kết quả phỏng vấn này:
Vai trò: {role} | Cấp độ: {level}
Điểm số: {scores}

Hãy tạo một lộ trình học tập cá nhân hóa trong 6 tuần bằng tiếng Việt.
CHỈ trả về một JSON object:
{{
  "roadmap": [
    {{"week": "Tuần 1-2", "title": "...", "description": "...", "resources": ["tài liệu 1"]}},
    {{"week": "Tuần 3-4", "title": "...", "description": "...", "resources": ["tài liệu 1"]}},
    {{"week": "Tuần 5-6", "title": "...", "description": "...", "resources": ["tài liệu 1"]}}
  ],
  "overall_advice": "Lời khuyên cá nhân hóa dài 2-3 câu bằng tiếng Việt"
}}"""
