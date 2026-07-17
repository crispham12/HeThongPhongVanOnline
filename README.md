# InterviewPro AI — Nền Tảng Luyện Tập Phỏng Vấn IT

> Đồ án tốt nghiệp | React + ASP.NET Core 8 + Python FastAPI

InterviewPro là nền tảng luyện tập phỏng vấn xin việc dành cho **sinh viên IT năm 3-4 và fresher**, giúp người dùng cải thiện cả **nội dung câu trả lời** lẫn **cách diễn đạt bằng giọng nói** thông qua AI.

---

## 🎯 Tính Năng Cốt Lõi

### 1. Full Mock Interview
Mô phỏng đúng quy trình tuyển dụng thực tế — 3 vòng liên tiếp theo thứ tự bắt buộc:

```
Vòng 1: HR Interview (10 câu)
      ↓ kết quả + feedback
Vòng 2: Technical Interview (10 câu)
      ↓ kết quả + feedback
Vòng 3: Coding Assessment (2 bài)
      ↓
Báo cáo tổng kết toàn bộ 3 vòng
```

### 2. Practice Mode — Ngân Hàng Câu Hỏi
Luyện tập từng vòng riêng lẻ (HR / Technical / Coding) theo vị trí và cấp độ tự chọn, không bắt buộc thứ tự.

### 3. AI Chấm Điểm Nội Dung
Mỗi câu trả lời được AI (OpenAI gpt-4o-mini) chấm ngay lập tức với điểm số (0–100) và feedback cụ thể theo từng tiêu chí:
- HR: Cấu trúc STAR, độ rõ ràng, tính liên quan
- Technical: Độ chính xác, chiều sâu, trade-offs
- Coding: Tính đúng đắn, độ phức tạp, chất lượng code

### 4. AI Phân Tích Giọng Nói *(Điểm khác biệt)*
User có thể trả lời bằng giọng nói. Hệ thống phân tích:
- **Tốc độ nói**: chậm / vừa / nhanh (words per minute)
- **Filler words**: đếm và liệt kê ("ừm", "à", "thì là"...)
- **Độ rõ ràng**: dựa trên chất lượng transcription

### 5. Learning Path Cá Nhân Hóa
Sau mỗi buổi, AI tự động gợi ý câu hỏi luyện tiếp từ ngân hàng câu hỏi dựa trên điểm yếu vừa phát hiện (tiêu chí < 60/100).

### 6. Lịch Sử & So Sánh Tiến Độ
Xem lại tất cả buổi đã làm, biểu đồ điểm theo thời gian, theo dõi xu hướng cải thiện.

---

## 👥 Phân Quyền & Mô Hình Freemium

| | Free | Premium |
|---|---|---|
| Số buổi/ngày | 3 buổi | Không giới hạn |
| Tính năng | Đầy đủ | Đầy đủ |
| Nâng cấp | Liên hệ Admin | Admin cấp thủ công |

> **1 buổi** = 1 vòng hoàn chỉnh (HR hoặc Technical hoặc Coding)  
> **Full Mock** = 3 buổi (mỗi vòng tính 1 buổi)  
> Quota reset lúc 00:00 GMT+7 mỗi ngày

**Hai phân quyền chính:**
- `Role = 0` → User thường
- `Role = 1` → Admin (quản lý câu hỏi, cấp Premium)

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────┐     REST API      ┌──────────────────────┐
│  React (Vite)   │ ◄───────────────► │  ASP.NET Core 8 API  │
│  Frontend       │                   │  Backend             │
│  :5173          │                   │  :5000               │
└─────────────────┘                   └──────────┬───────────┘
                                                 │ HTTP
                                      ┌──────────▼───────────┐
                                      │  Python FastAPI       │
                                      │  AI Service           │
                                      │  :8000                │
                                      │                       │
                                      │  • OpenAI gpt-4o-mini │
                                      │  • Whisper API        │
                                      └──────────────────────┘
```

**Tech Stack:**
- **Frontend**: React 18, Vite, TailwindCSS, Axios
- **Backend**: ASP.NET Core 8, Entity Framework Core, JWT Auth
- **AI Service**: Python 3.11, FastAPI, OpenAI SDK
- **Database**: SQL Server / PostgreSQL

---

## 🚀 Hướng Dẫn Cài Đặt

### Yêu Cầu
- Node.js 18+
- .NET SDK 8.0
- Python 3.11+
- SQL Server hoặc PostgreSQL

### 1. Backend (ASP.NET Core)

```bash
cd server-dotnet
# Cấu hình chuỗi kết nối DB trong appsettings.json → "DefaultConnection"
dotnet restore
dotnet ef database update   # Tạo database từ migrations
dotnet run                  # Chạy tại http://localhost:5000
```

### 2. AI Service (Python FastAPI)

```bash
cd ai-service
cp .env.example .env        # Điền OPENAI_API_KEY vào file .env
pip install -r requirements.txt
uvicorn main:app --reload   # Chạy tại http://localhost:8000
```

### 3. Frontend (React Vite)

```bash
cd client
cp .env.example .env        # Điền VITE_API_URL và VITE_AI_URL nếu khác mặc định
npm install
npm run dev                 # Chạy tại http://localhost:5173
```

---

## 📁 Cấu Trúc Thư Mục

```
HeThongPhongVanOnline/
│
├── client/                         → React Frontend
│   └── src/
│       ├── pages/
│       │   ├── user/interview/     → HR, Technical, Coding, Full Mock
│       │   ├── user/               → Dashboard, History, Practice
│       │   └── admin/              → Quản lý câu hỏi, user
│       ├── components/             → UI components dùng chung
│       └── services/               → Axios API calls
│
├── server-dotnet/                  → ASP.NET Core Backend
│   ├── Controllers/                → REST API endpoints
│   ├── Entities/                   → Database models (EF Core)
│   ├── DTOs/                       → Data Transfer Objects
│   ├── Interfaces/                 → Service interfaces
│   └── Services/                   → Business logic
│
├── ai-service/                     → Python AI Layer
│   ├── routes/                     → /hr, /technical, /coding, /voice
│   └── prompts/                    → Prompt engineering files
│
└── docs/                           → Tài liệu dự án
    ├── REQUIREMENTS.md             → Yêu cầu chức năng đầy đủ
    └── USER_FLOW.md                → Luồng nghiệp vụ chi tiết
```

---

## 🔌 API Overview

### Backend (.NET — :5000)
| Nhóm | Endpoint |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Full Mock | `POST /api/interview/full-mock/create`, `GET /api/interview/full-mock/{id}/report` |
| Practice | `GET /api/practice/questions`, `POST /api/practice/submit` |
| Lịch sử | `GET /api/interviews/history`, `GET /api/interviews/progress` |
| Admin — Câu hỏi | `GET/POST/PUT/DELETE /api/admin/questions` |
| Admin — Users | `GET /api/admin/users`, `PATCH /api/admin/users/{id}/plan` |

### AI Service (Python — :8000)
| Endpoint | Mô tả |
|---|---|
| `POST /ai/hr/generate-questions` | Sinh câu hỏi HR động |
| `POST /ai/hr/evaluate-answer` | Chấm điểm câu trả lời HR |
| `POST /ai/technical/generate-questions` | Sinh câu hỏi Technical |
| `POST /ai/technical/evaluate-answer` | Chấm điểm Technical |
| `POST /ai/coding/generate` | Sinh bài Coding |
| `POST /ai/coding/evaluate` | Chấm điểm Coding |
| `POST /ai/voice/transcribe` | Chuyển giọng nói → văn bản (Whisper) |
| `POST /ai/voice/analyze` | Phân tích tốc độ, filler words, độ rõ |

---

## 📋 Tài Liệu Liên Quan

- [`REQUIREMENTS.md`](./docs/REQUIREMENTS.md) — Đặc tả yêu cầu đầy đủ (14 tính năng, input/output/lỗi)
- [`USER_FLOW.md`](./docs/USER_FLOW.md) — Luồng nghiệp vụ chi tiết từng chức năng

---

## ⚠️ OUT OF SCOPE

Các tính năng sau **không có trong phiên bản này**:

| Tính năng | Lý do |
|---|---|
| Thanh toán online (SePay, VNPay) | Ngoài phạm vi đồ án |
| CV Builder | Không liên quan đến mục tiêu luyện phỏng vấn |
| Phân tích GitHub repo | Chưa đủ điều kiện kỹ thuật |

---

*Lưu ý: Nếu gặp lỗi `dotnet run`, kiểm tra port 5000 có đang bị chiếm không. Nếu gặp lỗi CORS, kiểm tra `VITE_API_URL` trong file `.env` của client.*
