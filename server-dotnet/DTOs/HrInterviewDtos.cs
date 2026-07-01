using System.Collections.Generic;

namespace InterviewPro.API.DTOs
{
    // ─────────────────────────────────────────────
    // 1. Start Interview
    // ─────────────────────────────────────────────
    public class StartHrInterviewRequest
    {
        public string Role { get; set; } = string.Empty;        // e.g. "Lập trình viên Backend"
        public string Difficulty { get; set; } = string.Empty;  // Intern | Fresher | Junior (acts as Level)
        public string QuestionMode { get; set; } = "BANK_FIRST_AI_FALLBACK"; // BANK_ONLY, BANK_FIRST_AI_FALLBACK, AI_ONLY
        public List<string> TechStack { get; set; } = new();
    }

    public class StartHrInterviewResponse
    {
        public string SessionId { get; set; } = string.Empty;
        public int TotalQuestions { get; set; } = 10;
        public List<HrQuestionDto> Questions { get; set; } = new();
    }

    // ─────────────────────────────────────────────
    // 2. Question DTO
    // ─────────────────────────────────────────────
    public class HrQuestionDto
    {
        public string QuestionId { get; set; } = string.Empty;
        public int QuestionIndex { get; set; }
        public string Category { get; set; } = string.Empty;
        public string QuestionText { get; set; } = string.Empty;
        public string ExpectedAnswerGuide { get; set; } = string.Empty;
    }

    // ─────────────────────────────────────────────
    // 3. Submit Answer
    // ─────────────────────────────────────────────
    public class SubmitHrAnswerRequest
    {
        public string QuestionId { get; set; } = string.Empty;
        public string AnswerText { get; set; } = string.Empty;
        public string? Transcript { get; set; }
        public int DurationSeconds { get; set; }
        public int WordCount { get; set; }
        public int FillerWords { get; set; }
    }

    public class SubmitHrAnswerResponse
    {
        public string AnswerId { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
        public HrFinalResultResponse? FinalResult { get; set; }
    }

    // ─────────────────────────────────────────────
    // 4. Session Detail
    // ─────────────────────────────────────────────
    public class HrSessionDetailResponse
    {
        public string SessionId { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int TotalQuestions { get; set; }
        public int AnsweredCount { get; set; }
        public List<HrQuestionDto> Questions { get; set; } = new();
    }

    // ─────────────────────────────────────────────
    // 5. Final Result
    // ─────────────────────────────────────────────
    public class HrFinalResultResponse
    {
        public string SessionId { get; set; } = string.Empty;
        public double HrFinalScore { get; set; }
        public string Level { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public List<string> OverallStrengths { get; set; } = new();
        public List<string> OverallWeaknesses { get; set; } = new();
        public List<RoadmapItemDto> ImprovementRoadmap { get; set; } = new();
        public string ReadinessLevel { get; set; } = string.Empty;
        public string Status { get; set; } = "completed";
    }

    public class RoadmapItemDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    // ─────────────────────────────────────────────
    // 6. History
    // ─────────────────────────────────────────────
    public class HrSessionHistoryItem
    {
        public string SessionId { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public double? FinalScore { get; set; }
        public string? FinalLevel { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public string? CompletedAt { get; set; }
    }
}
