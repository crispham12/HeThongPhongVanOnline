using System;
using System.Collections.Generic;

namespace InterviewPro.API.Entities
{
    public class HrInterviewSession
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string SessionGuid { get; set; } = Guid.NewGuid().ToString();
        public string Role { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string TechStackJson { get; set; } = "[]";
        public int TotalQuestions { get; set; } = 10;
        public int CurrentQuestionIndex { get; set; } = 0;
        public string Status { get; set; } = "InProgress"; // InProgress, Completed, Cancelled
        public double? FinalScore { get; set; }
        public string? FinalLevel { get; set; }
        public string? FinalSummary { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        // Navigation properties
        public ICollection<HrInterviewQuestion> Questions { get; set; } = new List<HrInterviewQuestion>();
        public ICollection<HrInterviewAnswer> Answers { get; set; } = new List<HrInterviewAnswer>();
        public ICollection<HrInterviewDraft> Drafts { get; set; } = new List<HrInterviewDraft>();
        public HrInterviewEvaluation? FinalResult { get; set; }
    }

    public class HrInterviewQuestion
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        public int? QuestionBankId { get; set; } // Null if generated pure AI, else point to DB
        public string QuestionGuid { get; set; } = Guid.NewGuid().ToString();
        public int QuestionIndex { get; set; }
        public string Category { get; set; } = string.Empty;
        public string QuestionText { get; set; } = string.Empty;
        public string ExpectedAnswerGuide { get; set; } = string.Empty;
        public string Difficulty { get; set; } = "Fresher";
        public string TargetSkill { get; set; } = string.Empty;
        public string SuggestedMethod { get; set; } = "STAR";
        public string Source { get; set; } = "MANUAL"; // MANUAL, AI_GENERATED
        public int MaxAnswerTime { get; set; } = 120;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class HrInterviewAnswer
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        public int QuestionId { get; set; }
        public string AnswerText { get; set; } = string.Empty;
        public string Transcript { get; set; } = string.Empty;
        public int DurationSeconds { get; set; }
        public int WordCount { get; set; }
        public int FillerWords { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        
        public HrInterviewQuestionEvaluation? Evaluation { get; set; }
    }

    public class HrInterviewDraft
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        public int QuestionId { get; set; }
        public string AnswerText { get; set; } = string.Empty;
        public string Transcript { get; set; } = string.Empty;
        public int DurationSeconds { get; set; }
        public int WordCount { get; set; }
        public int FillerWords { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class HrInterviewQuestionEvaluation
    {
        public int Id { get; set; }
        public int AnswerId { get; set; }
        public double Score { get; set; }
        public string Strength { get; set; } = string.Empty;
        public string Weakness { get; set; } = string.Empty;
        public string MissingStar { get; set; } = string.Empty;
        public string SuggestedAnswer { get; set; } = string.Empty;
    }

    public class HrInterviewEvaluation
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        public double HrFinalScore { get; set; }
        public double CommunicationScore { get; set; }
        public double StarScore { get; set; }
        public double ConfidenceScore { get; set; }
        public double ProfessionalismScore { get; set; }
        public double GrowthMindsetScore { get; set; }
        public double CultureFitScore { get; set; }
        
        public string Level { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string OverallStrengthsJson { get; set; } = "[]";
        public string OverallWeaknessesJson { get; set; } = "[]";
        public string ImprovementRoadmapJson { get; set; } = "[]";
        public string ReadinessLevel { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class AiRequestLog
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        // UserId nullable — không bắt buộc (anonymous requests)
        public int? UserId { get; set; }

        // Tên người dùng thực hiện request (nullable)
        public string? UserName { get; set; }

        // Feature values: InterviewQuestionGeneration, HRStarScoring, TechnicalScoring, CVAnalysis, CareerConsulting...
        public string Feature { get; set; } = string.Empty;

        // RequestType: GenerateQuestions, EvaluateHrAnswer, AnalyzeCV, CareerAdvice...
        public string RequestType { get; set; } = string.Empty;

        // AI model được sử dụng: gpt-4o-mini, gpt-4o, etc.
        public string? Model { get; set; }

        // Status: Success, Failed, Timeout
        public string Status { get; set; } = "Success";

        // Token usage
        public int InputTokens { get; set; } = 0;
        public int OutputTokens { get; set; } = 0;
        public int TotalTokens { get; set; } = 0;

        // Estimated cost (USD)
        public decimal EstimatedCost { get; set; } = 0m;

        // Response time in milliseconds
        public long ResponseTimeMs { get; set; } = 0;

        // Error detail (null nếu Success)
        public string? ErrorMessage { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class HrQuestionBank
    {
        public int Id { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string ExpectedAnswerGuide { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string TargetSkill { get; set; } = string.Empty;
        public string SuggestedMethod { get; set; } = string.Empty;
        public int MaxAnswerTime { get; set; } = 120;
        public string Source { get; set; } = "MANUAL"; // MANUAL, AI_GENERATED
        public bool IsActive { get; set; } = true;
        
        // Optional tracking fields
        public string RoleContext { get; set; } = string.Empty;
        public string LevelContext { get; set; } = string.Empty;
        public int UsageCount { get; set; } = 0;
        public DateTime? LastUsedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}

