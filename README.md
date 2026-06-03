# InterviewPro AI – Nền Tảng Luyện Tập & Phỏng Vấn AI

InterviewPro là một nền tảng fullstack (React + ASP.NET Core + FastAPI) mô phỏng các buổi phỏng vấn bằng AI, bao gồm phỏng vấn Nhân sự (HR), Kỹ thuật (Technical), và Đánh giá lập trình (Coding Assessment) với khả năng phân tích Github và đưa ra lộ trình học tập.

---

## 🚀 Hướng Dẫn Sử Dụng Nhanh (Quick Start)

### Yêu Cầu Cài Đặt (Prerequisites)
- **Node.js** 18+
- **.NET SDK** 8.0
- **Python** 3.11+
- **SQL Server** hoặc **PostgreSQL** (Tuỳ cấu hình trong `appsettings.json`)

### 1. Khởi Động Backend (ASP.NET Core)
Backend xử lý toàn bộ logic về Auth, Quản lý tài khoản, Ngân hàng câu hỏi và Lịch sử phỏng vấn.
```bash
cd server-dotnet
# Mở file appsettings.json và cấu hình chuỗi kết nối Database tại "DefaultConnection"
dotnet restore
dotnet ef database update     # Chạy migrations để tự động tạo Database
dotnet run                    # API sẽ chạy tại http://localhost:5000
```

### 2. Khởi Động AI Service (Python FastAPI)
AI Service kết nối với OpenAI để tạo câu hỏi động và chấm điểm câu trả lời của ứng viên.
```bash
cd ai-service
# Cấu hình biến môi trường
cp .env.example .env          # Mở file .env và điền OPENAI_API_KEY của bạn vào
pip install -r requirements.txt
uvicorn main:app --reload     # AI Service sẽ chạy tại http://localhost:8000
```

### 3. Khởi Động Frontend (React Vite)
Giao diện người dùng (Client) và bảng điều khiển Quản trị (Admin Panel).
```bash
cd client
# Cấu hình biến môi trường
cp .env.example .env          # Điền VITE_API_URL và VITE_AI_URL nếu khác mặc định
npm install
npm run dev                   # Web sẽ chạy tại http://localhost:5173
```

---

## 📖 Hướng Dẫn Sử Dụng (User Guide)

Hệ thống có hai phân quyền chính: **Admin** và **User**.

### 🛠️ Dành cho Admin (Quản trị viên)
1. **Đăng nhập quyền Admin**: Đảm bảo tài khoản của bạn được set `Role = 1` trong Database (Bảng `Users`).
2. **Quản lý Ngân Hàng Câu Hỏi (Question Bank)**:
   - Truy cập trang Admin Panel -> **Ngân hàng câu hỏi**.
   - Admin có thể **Thêm mới, Chỉnh sửa, Xoá, và Tìm kiếm** các câu hỏi HR / Kỹ thuật.
   - Bấm **Lưu & Công khai (Publish)**: Câu hỏi ngay lập tức được đẩy sang cho ứng viên tự do luyện tập.
3. **Quản lý Ngân Hàng Lập Trình (Coding Bank)**:
   - Truy cập **Ngân hàng bài coding** để thêm các bài thuật toán. Tương tự như câu hỏi thường, Admin có thể định nghĩa số lượng test cases, ngôn ngữ hỗ trợ.

### 🎓 Dành cho User (Ứng viên / Người dùng)
1. **Đăng ký / Đăng nhập**: User có thể tạo tài khoản và đăng nhập vào hệ thống.
2. **Dashboard & Thống kê**: Màn hình chính theo dõi chuỗi luyện tập (Daily Streak), số câu hỏi đã giải quyết.
3. **Phỏng vấn trực tiếp với AI**:
   - Truy cập phần Setup Phỏng vấn, chọn Role và JD.
   - Chat trực tiếp hoặc viết code cùng AI, nhận feedback real-time.
4. **Luyện tập Ngân Hàng Câu Hỏi**:
   - Truy cập **Ngân hàng luyện tập**. User sẽ thấy toàn bộ câu hỏi (Đã Publish) từ Admin.
   - Trả lời các câu hỏi HR, Kỹ thuật (Text) hoặc Lập trình (Trình soạn thảo Monaco Editor).
5. **Phân tích GitHub**:
   - Dán link GitHub Profile, AI sẽ phân tích source code và đưa ra điểm mạnh, điểm yếu.

---

## 🏗️ Cấu Trúc Thư Mục Dự Án

```
HeThongPhongVanOnline/
├── client/                 → React (Frontend)
│   ├── src/pages/admin/    → Giao diện quản lý cho Admin
│   ├── src/pages/user/     → Giao diện cho Ứng viên
│   └── src/services/       → Các file tích hợp Axios gọi Backend API
│
├── server-dotnet/          → ASP.NET Core 8 Web API (Backend)
│   ├── Controllers/        → Chứa các REST API endpoints
│   ├── Entities/           → Các Model ánh xạ xuống Database (EF Core)
│   └── DTOs/               → Data Transfer Objects
│
└── ai-service/             → Python FastAPI (AI Layer)
    ├── routes/             → API xử lý AI Generate/Evaluate
    └── prompts/            → Các file lưu trữ kỹ thuật Prompt Engineering
```

## 🔌 Danh Sách API (Overview)
- **Xác thực**: `/api/auth/register`, `/api/auth/login`
- **Người dùng (Client)**: `/api/practice/questions`, `/api/practice/coding`, `/api/practice/progress`
- **Quản trị (Admin)**: `/api/admin/questions`, `/api/admin/coding`
- **Trí tuệ nhân tạo (AI - Python)**: `/generate-question`, `/evaluate-answer`, `/analyze-github`

---

*Lưu ý: Nếu bạn gặp lỗi khi chạy `dotnet run`, hãy thử đóng Terminal cũ, hoặc kiểm tra xem port `5000` có bị chiếm dụng không.*
