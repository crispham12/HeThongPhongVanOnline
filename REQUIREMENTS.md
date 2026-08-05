# REQUIREMENTS.md
> Phiên bản: 1.0 | Trạng thái: DRAFT — Chờ APPROVED  
> Dự án: InterviewPro — Hệ thống luyện tập phỏng vấn online  
> Ngày tạo: 2025  
> Tác giả: PM/BA Role

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Mục tiêu
Xây dựng nền tảng web cho phép sinh viên IT năm 3-4 và fresher (dưới 1 năm kinh nghiệm) luyện tập phỏng vấn xin việc tại nhà thông qua AI, nhằm nâng cao khả năng trả lời cả về nội dung lẫn cách diễn đạt bằng giọng nói.

### 1.2 Đối tượng người dùng
| Actor | Mô tả | Quyền hạn |
|---|---|---|
| Guest | Người chưa đăng ký | Xem trang giới thiệu, đăng ký tài khoản |
| User (Free) | Đã đăng ký, chưa nâng cấp | 3 buổi/ngày, đầy đủ tính năng |
| User (Premium) | Đã liên hệ và được Admin cấp | Không giới hạn buổi/ngày |
| Admin | Quản trị viên hệ thống | Quản lý ngân hàng câu hỏi, quản lý user, cấp Premium |

### 1.3 Định nghĩa thuật ngữ
- **Buổi phỏng vấn**: 1 vòng hoàn chỉnh (HR hoặc Technical hoặc Coding), tính vào giới hạn Free
- **Full Mock Interview**: Session đặc biệt gồm 3 vòng liên tiếp (HR → Technical → Coding), tính là 3 buổi
- **Practice Mode**: Luyện từng vòng riêng lẻ từ ngân hàng câu hỏi, tính là 1 buổi mỗi vòng
- **Điểm yếu**: Tiêu chí có điểm < 60/100 sau khi AI chấm

### 1.4 Ràng buộc kỹ thuật
- Frontend: React
- Backend: .NET MVC (C#)
- AI Service: Python (FastAPI)
- AI Provider: OpenAI API (gpt-4o-mini cho text, Whisper API cho voice)
- Ngôn ngữ giao diện: Tiếng Việt
- Ngôn ngữ AI phản hồi: Tiếng Việt

### 1.5 Môi trường phát triển & Cài đặt (Dành cho Team)
Để team có thể tải, cài đặt và bắt đầu làm việc ngay lập tức, vui lòng cài đặt các công cụ sau:
- **Node.js 18+** (cần thiết cho Frontend Vite/React): [Tải về Node.js](https://nodejs.org/en/download/)
- **.NET SDK 8.0** (cần thiết cho Backend ASP.NET Core): [Tải về .NET SDK 8.0](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- **Python 3.11+** (cần thiết cho AI Service): [Tải về Python 3.11+](https://www.python.org/downloads/)
- **Hệ quản trị Cơ sở dữ liệu**:
  - [SQL Server Developer/Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) HOẶC [PostgreSQL](https://www.postgresql.org/download/)
- **Công cụ hỗ trợ (Khuyên dùng)**:
  - [Git](https://git-scm.com/downloads) (Quản lý source code)
  - [Visual Studio Code](https://code.visualstudio.com/Download) (IDE nhẹ, hỗ trợ nhiều ngôn ngữ)

---

## 2. PHẠM VI TÍNH NĂNG

### 2.1 IN SCOPE (MVP — 2 tháng)
- [F01] Xác thực người dùng (đăng ký, đăng nhập, đăng xuất)
- [F02] Full Mock Interview (HR → Technical → Coding)
- [F03] Practice Mode — luyện từng vòng từ ngân hàng câu hỏi
- [F04] Ghi âm giọng nói + Transcription (Whisper API)
- [F05] AI chấm điểm nội dung (OpenAI gpt-4o-mini)
- [F06] AI phân tích giọng nói (tốc độ, filler words, độ rõ)
- [F07] Báo cáo sau buổi phỏng vấn
- [F08] AI gợi ý câu hỏi luyện tập dựa trên điểm yếu
- [F09] Lịch sử phỏng vấn
- [F10] So sánh tiến độ theo thời gian
- [F11] Ngân hàng câu hỏi (Admin quản lý)
- [F12] Quản lý tài khoản người dùng (Admin)
- [F13] Giới hạn Free tier (3 buổi/ngày)
- [F14] Cấp Premium thủ công bởi Admin

### 2.2 OUT OF SCOPE (Không làm trong MVP)
- CV Builder, CV Template Editor
- Thanh toán online (SePay, VNPay, Stripe)
- Mock UI thanh toán
- Phân tích GitHub repo
- Voice-only mode (không có text backup)
- Đa ngôn ngữ giao diện (chỉ tiếng Việt)

---

## 3. YÊU CẦU CHỨC NĂNG CHI TIẾT

---

### F01 — XÁC THỰC NGƯỜI DÙNG

#### F01.1 Đăng ký tài khoản
**Actor**: Guest  
**Input**: Họ tên (bắt buộc, 2-100 ký tự), Email (bắt buộc, đúng định dạng, chưa tồn tại trong hệ thống), Mật khẩu (bắt buộc, tối thiểu 8 ký tự, có ít nhất 1 chữ hoa và 1 số), Xác nhận mật khẩu  
**Output**: Tài khoản được tạo với Plan = "Free", DailyInterviewUsed = 0, trạng thái Active  
**Điều kiện tiên quyết**: Guest chưa có tài khoản với email đó  
**Luồng chính**:
1. Guest nhập form đăng ký
2. Hệ thống validate input phía client (format, độ dài)
3. Hệ thống gửi request lên backend
4. Backend kiểm tra email chưa tồn tại
5. Backend hash mật khẩu (BCrypt)
6. Backend tạo tài khoản, gán Plan = "Free"
7. Hệ thống trả về JWT token
8. Guest được redirect đến trang Dashboard

**Trường hợp lỗi**:
- Email đã tồn tại → Thông báo: "Email này đã được sử dụng"
- Mật khẩu không khớp → Thông báo: "Mật khẩu xác nhận không đúng"
- Email sai định dạng → Thông báo: "Email không hợp lệ"
- Họ tên < 2 ký tự → Thông báo: "Họ tên phải có ít nhất 2 ký tự"

#### F01.2 Đăng nhập
**Actor**: Guest có tài khoản  
**Input**: Email, Mật khẩu  
**Output**: JWT token hợp lệ, thông tin user (FullName, Plan, DailyInterviewUsed)  
**Điều kiện tiên quyết**: Tài khoản tồn tại và có trạng thái Active  
**Luồng chính**:
1. Guest nhập email và mật khẩu
2. Backend xác thực thông tin
3. Cập nhật LastLoginAt
4. Trả về JWT token (thời hạn 24 giờ)
5. Redirect đến Dashboard

**Trường hợp lỗi**:
- Email không tồn tại → Thông báo: "Email hoặc mật khẩu không đúng" (không tiết lộ email tồn tại hay không)
- Mật khẩu sai → Thông báo: "Email hoặc mật khẩu không đúng"
- Tài khoản bị khóa (IsLocked = true) → Thông báo: "Tài khoản bị khóa. Lý do: {LockReason}"
- JWT hết hạn khi đang dùng → Tự động logout, redirect về trang đăng nhập, thông báo: "Phiên đăng nhập đã hết hạn"

#### F01.3 Đăng xuất
**Input**: JWT token hiện tại  
**Output**: Token bị vô hiệu hóa, redirect về trang chủ

---

### F02 — FULL MOCK INTERVIEW

#### Mô tả
User trải qua 3 vòng phỏng vấn liên tiếp (HR → Technical → Coding) trong một session. Mỗi vòng hoàn chỉnh trước khi chuyển sang vòng tiếp theo. Tính 3 buổi vào giới hạn Free tier (mỗi vòng tính 1 buổi).

#### F02.1 Setup Full Mock Session
**Actor**: User (Free hoặc Premium)  
**Input**: Vị trí ứng tuyển (chọn từ danh sách: Frontend, Backend, Fullstack, Data), Cấp độ (chọn: Intern, Fresher, Junior), Tech Stack (chọn tối đa 5 từ danh sách theo vị trí)  
**Output**: Session được tạo với SessionType = "FullMock", trạng thái = "InProgress", RemainingRounds = ["HR", "Technical", "Coding"]  
**Điều kiện tiên quyết**:
- User đã đăng nhập
- User (Free): DailyInterviewUsed + 3 ≤ 3 (còn đủ quota cho cả 3 vòng). Nếu không đủ → thông báo lỗi quota

**Trường hợp lỗi**:
- User Free đã dùng ≥ 1 buổi hôm nay → Thông báo: "Bạn không đủ buổi hôm nay cho Full Mock (cần 3 buổi). Vui lòng liên hệ để nâng cấp Premium hoặc thử lại vào ngày mai."
- Không chọn vị trí → Validate: "Vui lòng chọn vị trí ứng tuyển"

#### F02.2 Vòng HR Interview (trong Full Mock)
**Input**: SessionId, các thông tin setup từ F02.1  
**Output**: 10 câu hỏi HR do AI sinh ra, phù hợp với vị trí và cấp độ  
**Luồng chính**:
1. Backend gọi Python AI Service: POST /ai/hr/generate-questions với {role, difficulty, tech_stack, total_questions: 10}
2. AI Service gọi OpenAI gpt-4o-mini sinh 10 câu hỏi HR
3. Hệ thống lưu câu hỏi vào DB gắn với SessionId
4. Frontend hiển thị câu hỏi lần lượt từng câu

**Với mỗi câu hỏi**:
- User chọn hình thức trả lời: Text hoặc Voice
- Nếu Voice: Ghi âm → Transcribe (Whisper API) → Hiển thị text để user xác nhận trước khi gửi
- User gửi câu trả lời
- AI chấm ngay lập tức (feedback + score 0-100)
- Hiển thị feedback và chuyển câu tiếp theo

**Kết thúc vòng HR**:
- AI tổng kết: điểm trung bình, điểm yếu theo tiêu chí STAR
- DailyInterviewUsed + 1
- Tự động chuyển sang Vòng Technical

**Trường hợp lỗi**:
- OpenAI API timeout (> 30 giây) → Thông báo: "AI đang bận, vui lòng thử lại" — không tính buổi
- Whisper transcription thất bại → Cho phép user nhập text thủ công, không tính lại buổi
- User thoát giữa chừng → Session lưu trạng thái "Abandoned", không tính buổi, không thể tiếp tục session cũ

#### F02.3 Vòng Technical Interview (trong Full Mock)
**Input**: SessionId, role, difficulty, tech_stack  
**Output**: 10 câu hỏi Technical phù hợp tech stack đã chọn  
**Luồng chính**: Tương tự F02.2 nhưng dùng prompt Technical  
**Tiêu chí chấm**: Tính chính xác kỹ thuật, độ sâu, trade-offs, tính ứng dụng thực tế  
**Kết thúc**: DailyInterviewUsed + 1, chuyển sang Vòng Coding

#### F02.4 Vòng Coding Assessment (trong Full Mock)
**Input**: SessionId, role, difficulty  
**Output**: 2 bài tập lập trình phù hợp cấp độ  
**Hình thức trả lời**: Chỉ Text (gõ code) — không có Voice cho vòng Coding  
**Tiêu chí chấm**: Tính đúng đắn, độ phức tạp thời gian/không gian, chất lượng code, edge cases  
**Kết thúc**: DailyInterviewUsed + 1, chuyển sang Báo cáo tổng kết

#### F02.5 Báo cáo tổng kết Full Mock
**Input**: SessionId hoàn chỉnh (cả 3 vòng)  
**Output**: Báo cáo tổng hợp gồm:
- Điểm từng vòng (HR, Technical, Coding)
- Điểm tổng kết (trung bình có trọng số: HR 30%, Technical 40%, Coding 30%)
- Phân tích giọng nói (nếu dùng Voice): tốc độ trung bình (chậm/vừa/nhanh), số filler words, đánh giá độ rõ
- Top 3 điểm mạnh
- Top 3 điểm yếu cần cải thiện
- Danh sách câu hỏi gợi ý luyện tập từ ngân hàng câu hỏi (tối đa 5 câu, liên quan đến điểm yếu)

---

### F03 — PRACTICE MODE (Ngân hàng câu hỏi)

#### Mô tả
User tự chọn luyện từng vòng riêng lẻ từ bộ câu hỏi có sẵn trong ngân hàng. Mỗi phiên luyện tập = 1 buổi.

#### F03.1 Chọn phiên luyện tập
**Actor**: User  
**Input**: Loại vòng (HR / Technical / Coding), Vị trí (Frontend/Backend/Fullstack/Data), Số câu (5 hoặc 10), Độ khó (Intern/Fresher/Junior)  
**Output**: Bộ câu hỏi được lấy ngẫu nhiên từ ngân hàng theo filter  
**Điều kiện tiên quyết**: DailyInterviewUsed < 3 (với Free user)  
**Trường hợp lỗi**:
- Không đủ câu hỏi trong ngân hàng phù hợp filter (< số câu yêu cầu) → Thông báo: "Chưa đủ câu hỏi cho bộ lọc này, vui lòng chọn tiêu chí khác"
- User Free đã hết quota → Thông báo: "Bạn đã dùng hết 3 buổi hôm nay. Vui lòng liên hệ {email} để nâng cấp Premium"

#### F03.2 Luồng luyện tập
Tương tự F02.2 nhưng:
- Câu hỏi lấy từ ngân hàng, không phải AI sinh động
- Hỗ trợ cả Text và Voice (trừ Coding chỉ Text)
- Kết thúc: hiển thị báo cáo phiên + gợi ý câu hỏi luyện tiếp

---

### F04 — GHI ÂM GIỌNG NÓI + TRANSCRIPTION

#### Mô tả
User bấm nút ghi âm, nói câu trả lời, hệ thống chuyển giọng nói thành văn bản qua Whisper API.

**Input**: File audio từ microphone (định dạng: WebM/MP3, tối đa 5 phút/câu)  
**Output**: Văn bản transcription hiển thị để user xác nhận, file audio lưu tạm (xóa sau khi transcribe xong)  
**Luồng chính**:
1. User bấm nút "Bắt đầu ghi âm"
2. Frontend xin quyền microphone (nếu chưa cấp → hướng dẫn cấp quyền)
3. User nói, hiển thị thời gian đang ghi
4. User bấm "Dừng ghi âm"
5. Frontend gửi file audio lên Backend
6. Backend chuyển sang Python AI Service: POST /ai/voice/transcribe
7. Python gọi Whisper API (openai.audio.transcriptions.create)
8. Trả về text
9. Frontend hiển thị text để user xem và chỉnh sửa nếu cần
10. User bấm "Xác nhận và gửi"

**Trường hợp lỗi**:
- Microphone bị từ chối quyền → Thông báo hướng dẫn cấp quyền, tự động chuyển sang nhập Text
- File audio < 1 giây → Thông báo: "Câu trả lời quá ngắn, vui lòng ghi âm lại"
- Whisper API lỗi → Cho phép chỉnh sửa text thủ công và gửi
- Chất lượng âm thanh kém (Whisper trả về < 50% confidence) → Cảnh báo: "Âm thanh không rõ, bạn có muốn ghi âm lại không?"

---

### F05 — AI CHẤM ĐIỂM NỘI DUNG

**Input**: Câu hỏi (string), Câu trả lời của user (string), Loại vòng (HR/Technical/Coding), Role, Level  
**Output**:
```json
{
  "score": 0-100,
  "feedback": "Nhận xét 2-3 câu bằng tiếng Việt",
  "strengths": ["điểm mạnh 1", "điểm mạnh 2"],
  "weaknesses": ["điểm yếu 1"],
  "criteria_scores": {
    "HR": {"clarity": 0-100, "star_method": 0-100, "relevance": 0-100},
    "Technical": {"accuracy": 0-100, "depth": 0-100, "trade_offs": 0-100},
    "Coding": {"correctness": 0-100, "complexity": 0-100, "code_quality": 0-100}
  }
}
```
**Thời gian phản hồi tối đa**: 30 giây  
**Trường hợp lỗi**:
- Timeout > 30s → Ghi log, trả về score = null, feedback = "Không thể chấm điểm lúc này", không tính vào điểm trung bình
- Response không phải JSON hợp lệ → Retry 1 lần, nếu vẫn lỗi → xử lý như timeout

---

### F06 — AI PHÂN TÍCH GIỌNG NÓI

**Input**: File audio gốc (trước khi transcribe), văn bản transcription, thời lượng audio (giây)  
**Output**:
```json
{
  "speaking_rate": "chậm | vừa | nhanh",
  "words_per_minute": 120,
  "filler_words": {
    "count": 5,
    "list": ["ừm", "à", "thì là"],
    "percentage": "8%"
  },
  "clarity_score": 0-100,
  "pause_analysis": "Dừng hợp lý | Dừng quá nhiều | Ít dừng",
  "feedback": "Nhận xét 1-2 câu về giọng nói bằng tiếng Việt"
}
```
**Ghi chú kỹ thuật**:
- speaking_rate: < 100 wpm = chậm, 100-160 wpm = vừa, > 160 wpm = nhanh
- filler_words: detect trong transcription text (ừm, à, ờ, thì là, kiểu như, vân vân)
- clarity_score: tính từ Whisper confidence score * 100

**Điều kiện**: Chỉ thực hiện khi user chọn trả lời bằng Voice  
**Trường hợp lỗi**: Nếu phân tích thất bại → bỏ qua phần này, không ảnh hưởng đến điểm nội dung

---

### F07 — BÁO CÁO SAU BUỔI PHỎNG VẤN

**Input**: SessionId hoàn chỉnh  
**Output**: Trang báo cáo gồm:
- Thông tin buổi: ngày, vị trí, cấp độ, thời lượng (phút)
- Điểm tổng (0-100) và nhận xét tổng quan
- Bảng điểm từng câu (câu hỏi, câu trả lời, điểm, feedback)
- Phân tích giọng nói (nếu có Voice)
- Gợi ý câu hỏi luyện tiếp (từ F08)

**Ràng buộc**: Báo cáo chỉ hiển thị khi session ở trạng thái "Completed"

---

### F08 — AI GỢI Ý CÂU HỎI LUYỆN TẬP

**Trigger**: Tự động sau khi session hoàn thành  
**Input**: Danh sách điểm yếu từ buổi vừa kết thúc (tiêu chí score < 60), role, level  
**Output**: Tối đa 5 câu hỏi từ ngân hàng câu hỏi, liên quan đến điểm yếu  
**Logic**:
1. Xác định tiêu chí yếu (score < 60)
2. Query ngân hàng câu hỏi có tag tương ứng với tiêu chí yếu
3. Lấy random tối đa 5 câu phù hợp role + level
4. Nếu ngân hàng không đủ câu → hiển thị ít hơn 5, không báo lỗi

**Trường hợp không có điểm yếu** (tất cả tiêu chí ≥ 60): Hiển thị thông báo "Bạn làm rất tốt! Hãy thử độ khó cao hơn" và gợi ý luyện level tiếp theo

---

### F09 — LỊCH SỬ PHỎNG VẤN

**Actor**: User  
**Input**: Filter tùy chọn (loại vòng, khoảng thời gian, vị trí)  
**Output**: Danh sách các session đã hoàn thành, sắp xếp mới nhất trước, gồm: ngày, vị trí, cấp độ, điểm tổng, loại session (Practice/FullMock)  
**Phân trang**: 10 session/trang  
**Ràng buộc**: Chỉ hiển thị session có Status = "Completed"

---

### F10 — SO SÁNH TIẾN ĐỘ

**Actor**: User  
**Input**: Chọn vị trí và loại vòng muốn xem tiến độ  
**Output**: Biểu đồ điểm theo thời gian (tối thiểu 2 session mới hiển thị), chỉ số xu hướng (đang tăng/giảm/ổn định)  
**Điều kiện**: User có ít nhất 2 session hoàn chỉnh cùng loại vòng và vị trí  
**Trường hợp chưa đủ data**: Thông báo "Hãy hoàn thành thêm buổi luyện tập để xem tiến độ"

---

### F11 — NGÂN HÀNG CÂU HỎI (Admin)

#### F11.1 Thêm câu hỏi
**Actor**: Admin  
**Input**: Nội dung câu hỏi (bắt buộc), Loại vòng (HR/Technical/Coding), Vị trí (Frontend/Backend/Fullstack/Data — có thể chọn nhiều), Cấp độ (Intern/Fresher/Junior — có thể chọn nhiều), Tags (tối đa 5 tag)  
**Output**: Câu hỏi được lưu, trạng thái Active  
**Validate**: Nội dung câu hỏi tối thiểu 20 ký tự, tối đa 1000 ký tự

#### F11.2 Sửa/Xóa câu hỏi
- Sửa: cập nhật nội dung, không ảnh hưởng session đã hoàn thành
- Xóa: soft delete (IsActive = false), không xóa khỏi DB

#### F11.3 Xem danh sách câu hỏi
**Output**: Bảng câu hỏi với filter theo loại, vị trí, cấp độ; hiển thị số lần đã được dùng

---

### F12 — QUẢN LÝ TÀI KHOẢN (Admin)

**Actor**: Admin  
**Chức năng**:
- Xem danh sách user: FullName, Email, Plan, DailyInterviewUsed, LastLoginAt, Status
- Tìm kiếm theo Email hoặc FullName
- Cấp Premium: cập nhật Plan = "Premium" cho user được chọn
- Thu hồi Premium: cập nhật Plan = "Free"
- Khóa tài khoản: IsLocked = true, nhập LockReason
- Mở khóa tài khoản: IsLocked = false

---

### F13 — GIỚI HẠN FREE TIER

**Logic**:
- Mỗi ngày (reset lúc 00:00 UTC+7), hệ thống đặt lại DailyInterviewUsed = 0 cho tất cả Free user
- Mỗi khi một vòng phỏng vấn hoàn thành: DailyInterviewUsed + 1
- Trước khi bắt đầu session: kiểm tra DailyInterviewUsed < 3 (Free) hoặc Plan = "Premium"
- Full Mock kiểm tra: DailyInterviewUsed + 3 ≤ 3, tức là chỉ cho phép khi DailyInterviewUsed = 0

**Thông báo khi hết quota**: "Bạn đã sử dụng hết 3 buổi hôm nay. Để luyện tập không giới hạn, vui lòng liên hệ [email] để nâng cấp tài khoản Premium."

---

### F14 — CẤP PREMIUM THỦ CÔNG

**Actor**: Admin  
**Luồng**: Admin vào trang quản lý user → tìm user → bấm "Cấp Premium" → xác nhận → hệ thống cập nhật Plan = "Premium"  
**Không có luồng tự động**: Không có cổng thanh toán, không có webhook

---

## 4. YÊU CẦU PHI CHỨC NĂNG

| ID | Yêu cầu | Tiêu chí đo lường |
|---|---|---|
| NFR01 | Thời gian phản hồi AI chấm điểm | ≤ 30 giây/câu |
| NFR02 | Thời gian transcription | ≤ 15 giây cho audio 2 phút |
| NFR03 | Bảo mật mật khẩu | BCrypt hash, không lưu plain text |
| NFR04 | JWT | Thời hạn 24 giờ, không lưu phía server (stateless) |
| NFR05 | API Key bảo mật | OpenAI API key chỉ ở backend/AI service, không expose ra frontend |
| NFR06 | File audio | Xóa khỏi server sau khi transcribe xong |
| NFR07 | Responsive | Hoạt động trên màn hình ≥ 768px (desktop, tablet) |

---

## 5. CÁC TRẠNG THÁI PHIÊN PHỎNG VẤN

```
Setup → InProgress → Completed
                  ↘ Abandoned (user thoát giữa chừng)
                  ↘ Error (AI service lỗi không phục hồi được)
```

- **Setup**: Đã tạo session, chưa bắt đầu câu hỏi đầu tiên
- **InProgress**: Đang trong quá trình trả lời
- **Completed**: Đã trả lời hết câu hỏi, có điểm và báo cáo
- **Abandoned**: User thoát — không tính vào DailyInterviewUsed
- **Error**: Lỗi hệ thống — không tính vào DailyInterviewUsed

---

## 6. TÍNH NĂNG LOẠI BỎ HOÀN TOÀN

Các tính năng sau được loại bỏ khỏi scope và KHÔNG được implement:

| Tính năng | Lý do loại bỏ |
|---|---|
| CV Builder & Template Editor | Không liên quan đến mục tiêu luyện phỏng vấn |
| Thanh toán SePay/VNPay | Quá phức tạp cho 2 tháng, không cần thiết cho đồ án |
| Mock UI thanh toán | Gây nhầm lẫn, không có giá trị thực |
| Phân tích GitHub | Chưa có API đọc code thật, chỉ là ý tưởng |
| InterviewSession cũ | Thay thế bằng HrInterviewSession làm chuẩn duy nhất |
| CreditWallet, CreditHistory | Thay bằng logic DailyInterviewUsed đơn giản |
| DailyGithubAnalysisUsed | Không có GitHub feature |

---

*Tài liệu này cần được APPROVED bởi Product Owner trước khi team bắt đầu implement.*  
*Mọi thay đổi sau khi APPROVED phải được ghi lại trong mục Change Log.*
