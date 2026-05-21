using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace InterviewPro.API.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class InterviewSession
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string SessionGuid { get; set; } = Guid.NewGuid().ToString();
        
        public string Role { get; set; } = string.Empty;
        public string TechStack { get; set; } = "[]";
        public string Difficulty { get; set; } = string.Empty;
        public string InterviewType { get; set; } = string.Empty;
        
        public string CurrentPhase { get; set; } = "Setup";
        public int CurrentQuestionIndex { get; set; }
        public string Status { get; set; } = "InProgress";
        
        public string OverallFeedback { get; set; } = string.Empty;
        public double OverallScore { get; set; }
        public string SkillRoadmap { get; set; } = "[]";
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        public ICollection<InterviewQuestion> Questions { get; set; } = new List<InterviewQuestion>();
    }

    public class InterviewQuestion
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        public string Phase { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string UserAnswer { get; set; } = string.Empty;
        public double Score { get; set; }
        public string Feedback { get; set; } = string.Empty;
        public string EvaluationCriteria { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
