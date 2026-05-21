# InterviewPro AI – Fullstack AI Interview Simulator Platform

## 🏗️ Project Structure

```
duantotnghiepmoi/
├── client/           → React + Vite + TailwindCSS frontend
├── server-dotnet/    → ASP.NET Core 8 Web API (Clean Architecture)
├── ai-service/       → Python FastAPI AI service (OpenAI integration)
└── docker-compose.yml
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- .NET SDK 8.0
- Python 3.11+
- PostgreSQL 15+ (or Docker)

### 1. Frontend (React)
```bash
cd client
cp .env.example .env          # Edit VITE_API_URL and VITE_AI_URL
npm install
npm run dev                   # → http://localhost:5173
```

### 2. Backend (ASP.NET Core)
```bash
cd server-dotnet
# Edit appsettings.json with your DB credentials
dotnet restore
dotnet ef database update     # requires: dotnet ef tool
dotnet run                    # → http://localhost:5000
```

### 3. AI Service (Python)
```bash
cd ai-service
cp .env.example .env          # Add your OPENAI_API_KEY
pip install -r requirements.txt
uvicorn main:app --reload     # → http://localhost:8000
```

### 🐳 Docker (All-in-one)
```bash
cp ai-service/.env.example ai-service/.env  # Set OPENAI_API_KEY
docker-compose up --build
```

---

## 🎯 Features

| Module | Status |
|--------|--------|
| JWT Authentication | ✅ |
| Dashboard + Analytics | ✅ |
| Interview Setup | ✅ |
| HR Interview (Chat UI) | ✅ |
| Technical Interview | ✅ |
| Coding Assessment (Monaco Editor) | ✅ |
| GitHub Repository Analysis | ✅ |
| AI Evaluation + Radar Chart | ✅ |
| Interview History | ✅ |

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, returns JWT |

### Interviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/interviews | Create interview session |
| GET | /api/interviews/{id} | Get interview by ID |
| GET | /api/interviews/history | Paginated history |
| GET | /api/dashboard/stats | Dashboard statistics |
| POST | /api/github/analyze | Analyze GitHub repo |

### AI Service (port 8000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /generate-question | AI question generation |
| POST | /evaluate-answer | AI answer evaluation |
| POST | /analyze-github | GitHub analysis |
| POST | /generate-roadmap | Personalized learning path |
| GET | /health | Health check |

---

## 🎨 Tech Stack

**Frontend:** React 18, Vite, TailwindCSS 3, React Router, Framer Motion, Recharts, Monaco Editor, Lucide Icons, Axios

**Backend:** ASP.NET Core 8, Entity Framework Core 8, PostgreSQL, JWT Bearer Auth, Swagger/OpenAPI, BCrypt, Clean Architecture

**AI Service:** FastAPI, OpenAI SDK, Pydantic v2, Python 3.12, uvicorn

---

## 📂 Folder Details

### `client/src/`
```
pages/
  auth/         → Login, Register
  interview/    → InterviewSetup, HRInterview, TechnicalInterview, CodingAssessment
  Dashboard.jsx
  GithubAnalysis.jsx
  EvaluationResult.jsx
  History.jsx
  Landing.jsx
components/
  layout/       → AppLayout, Sidebar
  ui/           → StatCard
context/        → AuthContext (JWT)
lib/            → axios.js (Axios instances)
```

### `server-dotnet/`
```
Controllers/   → Auth, Interviews, Dashboard, Github
Services/      → AuthService, InterviewService, AiService
Repositories/  → UserRepository, InterviewRepository
Entities/      → User, Interview, Question, Answer, GithubAnalysis
DTOs/          → Request/Response types
Interfaces/    → Service & Repository contracts
Data/          → AppDbContext (EF Core)
```

### `ai-service/`
```
routes/        → questions.py, answers.py, github.py, roadmap.py
services/      → openai_service.py
prompts/       → prompts.py (all OpenAI prompts)
models/        → schemas.py (Pydantic models)
analyzers/     → (extendable analyzers)
utils/         → (utilities)
main.py        → FastAPI app entry
```

---

## 🔐 Environment Variables

### client/.env
```
VITE_API_URL=http://localhost:5000/api
VITE_AI_URL=http://localhost:8000
```

### server-dotnet/appsettings.json
```json
{
  "ConnectionStrings": { "DefaultConnection": "Host=...;Database=interviewpro;..." },
  "Jwt": { "Key": "32-char-secret", "Issuer": "InterviewProAPI", "Audience": "InterviewProClient" },
  "AiService": { "BaseUrl": "http://localhost:8000" }
}
```

### ai-service/.env
```
OPENAI_API_KEY=sk-...
```
