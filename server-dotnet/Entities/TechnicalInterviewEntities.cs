using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InterviewPro.API.Entities
{
    [Table("TechnicalInterviewSessions")]
    public class TechnicalInterviewSession
    {
        [Key]
        public int Id { get; set; }
        public string SessionGuid { get; set; } = Guid.NewGuid().ToString();
        public int UserId { get; set; }
        
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        public string Role { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string TechStack { get; set; } = string.Empty; // Comma-separated or JSON
        
        public string Status { get; set; } = "InProgress"; // InProgress, Completed, Failed
        
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        
        public float OverallScore { get; set; } = 0.0f;
        
        public string? FinalFeedbackJson { get; set; } // JSON chứa Strengths, Weaknesses, Recommendation...
        
        public virtual ICollection<TechnicalInterviewQuestion> Questions { get; set; } = new List<TechnicalInterviewQuestion>();
    }

    [Table("TechnicalInterviewQuestions")]
    public class TechnicalInterviewQuestion
    {
        [Key]
        public int Id { get; set; }
        
        public int SessionId { get; set; }
        [ForeignKey("SessionId")]
        public virtual TechnicalInterviewSession? Session { get; set; }

        public int QuestionIndex { get; set; } // 1 to 10
        public string Stage { get; set; } = string.Empty; // Warm-up, Core, Applied, Project, System

        public string Content { get; set; } = string.Empty;
        public string? ExpectedAnswer { get; set; }
        
        public string? CandidateAnswer { get; set; }
        public int DurationSeconds { get; set; } = 0;
        
        public float Score { get; set; } = 0.0f;
        public string? FeedbackJson { get; set; } // JSON điểm thành phần (Technical, Problem Solving...)
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? AnsweredAt { get; set; }
    }
}
