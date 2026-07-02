# AI Prompt Registry

This document catalogs all AI prompts used across the project to maintain a clean architecture and prevent duplicated responsibilities.

## 1. Evaluation Prompts

| Prompt Name | Category | Location | Purpose | Owner Module | Version |
|---|---|---|---|---|---|
| `HR_GENERATE_QUESTIONS_PROMPT` | Evaluation | `ai-service/prompts/evaluation/hr/hr_prompts.py` | Generate behavioral questions | `ai-service` | 1.0 |
| `HR_EVALUATE_ANSWER_PROMPT` | Evaluation | `ai-service/prompts/evaluation/hr/hr_prompts.py` | Evaluate single answer strictly using STAR | `ai-service` | 2.0 |
| `HR_FINAL_EVALUATION_PROMPT` | Evaluation | `ai-service/prompts/evaluation/hr/hr_prompts.py` | Evaluate the full 10-question session | `ai-service` | 1.0 |
| `EVALUATION_PROMPTS["technical"]` | Evaluation | `ai-service/prompts/prompts.py` | Evaluate technical answers | `ai-service` | 1.0 |
| `EVALUATION_PROMPTS["coding"]` | Evaluation | `ai-service/prompts/prompts.py` | Evaluate coding challenges | `ai-service` | 1.0 |
| `GITHUB_ANALYSIS_PROMPT` | Evaluation | `ai-service/prompts/prompts.py` | Evaluate GitHub repo quality | `ai-service` | 1.0 |
| `ROADMAP_PROMPT` | Evaluation | `ai-service/prompts/prompts.py` | Generate personalized learning roadmap | `ai-service` | 1.0 |

## 2. Implementation Prompts (Development Only)

Implementation prompts are used exclusively during development for code generation and refactoring. They are not invoked by the runtime application. See `implementation_prompts.md` for templates.

| Prompt Name | Category | Location | Purpose |
|---|---|---|---|
| `BACKEND_ARCHITECT` | Implementation | `docs/prompts/implementation_prompts.md` | Guide C# backend refactoring and clean architecture |
| `FRONTEND_ENGINEER` | Implementation | `docs/prompts/implementation_prompts.md` | Guide React UI and state management implementation |
| `DATABASE_MIGRATION` | Implementation | `docs/prompts/implementation_prompts.md` | Guide EF Core migrations and schema design |

## 3. UI/UX Design Prompts (Development Only)

UI design prompts are used to generate aesthetic interfaces. They are strictly separate from business logic prompts. See `ui_prompts.md` for templates.

| Prompt Name | Category | Location | Purpose |
|---|---|---|---|
| `INTERVIEW_UI` | UI/UX | `docs/prompts/ui_prompts.md` | Design the real-time interview layout |
| `DASHBOARD_UI` | UI/UX | `docs/prompts/ui_prompts.md` | Design the admin/user dashboard screens |
| `COMPONENTS_UI` | UI/UX | `docs/prompts/ui_prompts.md` | Design reusable React components |
