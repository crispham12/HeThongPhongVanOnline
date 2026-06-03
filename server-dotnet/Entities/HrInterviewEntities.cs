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
        public HrInterviewFinalResult? FinalResult { get; set; }
    }

    public class HrInterviewQuestion
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        public string QuestionGuid { get; set; } = Guid.NewGuid().ToString();
        public int QuestionIndex { get; set; }
        public string Category { get; set; } = string.Empty;
        public string QuestionText { get; set; } = string.Empty;
        public string ExpectedAnswerGuide { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class HrInterviewAnswer
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        public int QuestionId { get; set; }
        public string AnswerText { get; set; } = string.Empty;
        
        // Detailed rubric scores
        public double CommunicationScore { get; set; }
        public double ClarityScore { get; set; }
        public double StarScore { get; set; }
        public double ProfessionalMindsetScore { get; set; }
        public double RelevanceScore { get; set; }
        
        // Calculated score (weighted average)
        public double QuestionScore { get; set; }
        public string Level { get; set; } = string.Empty;
        public string Feedback { get; set; } = string.Empty;
        
        // Lists serialized to JSON
        public string StrengthsJson { get; set; } = "[]";
        public string WeaknessesJson { get; set; } = "[]";
        public string ImprovementSuggestionsJson { get; set; } = "[]";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class HrInterviewFinalResult
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        public double HrFinalScore { get; set; }
        public string Level { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        
        // JSON serialized structures
        public string OverallStrengthsJson { get; set; } = "[]";
        public string OverallWeaknessesJson { get; set; } = "[]";
        public string ImprovementRoadmapJson { get; set; } = "[]"; // List of roadmap objects (title, description)
        
        public string ReadinessLevel { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class AiRequestLog
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Feature { get; set; } = "HRInterview";
        public string RequestType { get; set; } = string.Empty; // GenerateQuestions, EvaluateAnswer, FinalEvaluation
        public string Status { get; set; } = "Success"; // Success, Failed
        public long ResponseTimeMs { get; set; }
        public int TokensUsed { get; set; } = 0;
        public string? ErrorMessage { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
