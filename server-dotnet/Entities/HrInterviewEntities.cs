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
        
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        public string? DeletedBy { get; set; }
        public int AnsweredQuestions { get; set; } = 0;
        public int DurationMinutes { get; set; } = 0;

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
        public int InterviewAnswerId { get; set; }
        public double QuestionScore { get; set; }
        public double StarScore { get; set; }
        public double CommunicationScore { get; set; }
        public double ConfidenceScore { get; set; }
        public string Strengths { get; set; } = "[]";
        public string Weaknesses { get; set; } = "[]";
        public string Suggestions { get; set; } = "[]";
        
        // STAR Analysis Fields
        public double SituationScore { get; set; }
        public string SituationStatus { get; set; } = string.Empty;
        public string SituationFeedback { get; set; } = string.Empty;
        
        public double TaskScore { get; set; }
        public string TaskStatus { get; set; } = string.Empty;
        public string TaskFeedback { get; set; } = string.Empty;
        
        public double ActionScore { get; set; }
        public string ActionStatus { get; set; } = string.Empty;
        public string ActionFeedback { get; set; } = string.Empty;
        
        public double ResultScore { get; set; }
        public string ResultStatus { get; set; } = string.Empty;
        public string ResultFeedback { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class HrInterviewEvaluation
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        
        // New Composite Scores
        public double StarStructureScore { get; set; }
        public double CommunicationScore { get; set; }
        public double ProfessionalismScore { get; set; }
        public double ConfidenceScore { get; set; }
        public double LogicScore { get; set; }
        public double CompletenessScore { get; set; }
        public double ClarityScore { get; set; }
        public double OverallScore { get; set; }

        public string HiringReadiness { get; set; } = string.Empty;
        public string OverallStatus { get; set; } = string.Empty;
        public string PromptVersion { get; set; } = string.Empty;
        public string EvaluationModel { get; set; } = string.Empty;
        
        // Summary Fields
        public string OverallObservation { get; set; } = string.Empty;
        public string StrengthSummary { get; set; } = string.Empty;
        public string WeaknessSummary { get; set; } = string.Empty;
        public string HiringRecommendation { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<HrInterviewStrength> Strengths { get; set; } = new List<HrInterviewStrength>();
        public ICollection<HrInterviewImprovement> Improvements { get; set; } = new List<HrInterviewImprovement>();
        public ICollection<HrInterviewRecommendedPractice> RecommendedPractices { get; set; } = new List<HrInterviewRecommendedPractice>();
    }

    public class HrInterviewStrength
    {
        public int Id { get; set; }
        public int EvaluationId { get; set; }
        public string Title { get; set; } = string.Empty;
        public double Score { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class HrInterviewImprovement
    {
        public int Id { get; set; }
        public int EvaluationId { get; set; }
        public string Priority { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class HrInterviewRecommendedPractice
    {
        public int Id { get; set; }
        public int EvaluationId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string EstimatedTime { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string RecommendedLevel { get; set; } = string.Empty;
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

        // Prompt metadata
        public string PromptVersion { get; set; } = string.Empty;
        public double Temperature { get; set; } = 0.0;
        public double EvaluationTime { get; set; } = 0.0;

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

