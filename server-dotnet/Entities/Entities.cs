using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace InterviewPro.API.Entities
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(256)]
        public string FullName { get; set; } = string.Empty;

        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public string Name 
        { 
            get => FullName; 
            set => FullName = value; 
        }

        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public int Role { get; set; } = 0; // 0 = User, 1 = Admin

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(50)]
        public string UserCode { get; set; } = string.Empty;

        public string? AvatarUrl { get; set; }

        [MaxLength(50)]
        public string Plan { get; set; } = "Free"; // Free, Premium

        [MaxLength(50)]
        public string Status { get; set; } = "Active"; // Active, Locked, Inactive

        public bool IsLocked { get; set; } = false;

        public string? LockReason { get; set; }

        public int DailyInterviewUsed { get; set; } = 0;

        public DateTime? LastLoginAt { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
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
        
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        public int TotalQuestions { get; set; } = 10;
        public int AnsweredQuestions { get; set; } = 0;
        public int DurationMinutes { get; set; } = 0;

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

