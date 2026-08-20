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
        public bool IsFullMock { get; set; } = false;
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
        public double OverallScore { get; set; }
        public CompositeScoresDto CompositeScores { get; set; } = new();
        public List<HrQuestionEvaluationDto> QuestionEvaluations { get; set; } = new();
        public List<HrStrengthDto> Strengths { get; set; } = new();
        public List<HrImprovementDto> Improvements { get; set; } = new();
        public List<HrRecommendedPracticeDto> RecommendedPractice { get; set; } = new();
        public string OverallObservation { get; set; } = string.Empty;
        public string StrengthSummary { get; set; } = string.Empty;
        public string WeaknessSummary { get; set; } = string.Empty;
        public string HiringRecommendation { get; set; } = string.Empty;
        public string ReadinessLevel { get; set; } = string.Empty;
        public string Status { get; set; } = "completed";
    }

    public class CompositeScoresDto
    {
        public double StarStructureScore { get; set; }
        public double CommunicationScore { get; set; }
        public double ProfessionalismScore { get; set; }
        public double ConfidenceScore { get; set; }
        public double LogicScore { get; set; }
        public double CompletenessScore { get; set; }
        public double ClarityScore { get; set; }
    }

    public class HrQuestionEvaluationDto
    {
        public int QuestionIndex { get; set; }
        public double QuestionScore { get; set; }
        public double StarScore { get; set; }
        public double CommunicationScore { get; set; }
        public double ConfidenceScore { get; set; }
        public List<string> Strengths { get; set; } = new();
        public List<string> Weaknesses { get; set; } = new();
        public List<string> Suggestions { get; set; } = new();
        public StarAnalysisDto StarAnalysis { get; set; } = new();
    }

    public class StarAnalysisDto
    {
        public StarItemDto Situation { get; set; } = new();
        public StarItemDto Task { get; set; } = new();
        public StarItemDto Action { get; set; } = new();
        public StarItemDto Result { get; set; } = new();
    }

    public class StarItemDto
    {
        public double Score { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Feedback { get; set; } = string.Empty;
    }

    public class HrStrengthDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public double Score { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class HrImprovementDto
    {
        public string Priority { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class HrRecommendedPracticeDto
    {
        public string Title { get; set; } = string.Empty;
        public string EstimatedTime { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string RecommendedLevel { get; set; } = string.Empty;
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
