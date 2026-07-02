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

        public int DailyGithubAnalysisUsed { get; set; } = 0;

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

    public class UserCV
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string TemplateId { get; set; } = "nexus-pro";
        public string Title { get; set; } = string.Empty;
        public string PersonalInfo { get; set; } = "{}"; // JSON string containing name, title, email, phone, address, website, summary
        public string Experience { get; set; } = "[]";   // JSON string containing list of experiences
        public string Education { get; set; } = "[]";    // JSON string containing list of educations
        public string Skills { get; set; } = "[]";       // JSON string containing list of skills
        public string Languages { get; set; } = "[]";    // JSON string containing list of languages
        public string CoreStack { get; set; } = "[]";    // JSON string containing core stack technologies
        public string Proficiencies { get; set; } = "[]"; // JSON string containing visual systems, proficiency items
        public int AiScore { get; set; } = 80;
        public string AiFeedback { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class CvTemplate
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        public int Width { get; set; }
        public int Height { get; set; }
        public string BackgroundColor { get; set; } = "#FFFFFF";
        public string ThumbnailUrl { get; set; } = string.Empty;
        public string Thumbnail { get; set; } = string.Empty;
        public bool IsPublished { get; set; } = false;
        public string Status { get; set; } = "Draft"; // Draft / Published
        public string Version { get; set; } = "1.0.0";
        public string Category { get; set; } = string.Empty;
        public int CreatedByAdminId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<CvTemplateComponent> Components { get; set; } = new List<CvTemplateComponent>();
        public ICollection<CvTemplateSection> Sections { get; set; } = new List<CvTemplateSection>();
        public ICollection<CvTemplateContainer> Containers { get; set; } = new List<CvTemplateContainer>();
    }

    public class CvTemplateContainer
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TemplateId { get; set; }
        
        [Required]
        public string LayoutType { get; set; } = "OneColumn"; // OneColumn, TwoColumns, LeftSidebar, RightSidebar, Grid2Columns
        
        public int OrderIndex { get; set; }
        public string ConfigJson { get; set; } = "{}"; // Store container-specific settings like gap, padding, split ratio
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public CvTemplate? Template { get; set; }
        public ICollection<CvTemplateSection> Sections { get; set; } = new List<CvTemplateSection>();
    }

    public class CvSectionDefinition
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required]
        public string SectionType { get; set; } = string.Empty;
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        [Required]
        public string Category { get; set; } = "Core"; // Core, Optional, Custom
        public string DefaultBindingPath { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        
        public bool IsRequired { get; set; }
        public bool IsRepeatable { get; set; }
        public bool IsSingleInstance { get; set; }
        public bool IsATSFriendly { get; set; }
        
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class CvTemplateSection
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TemplateId { get; set; }
        public Guid SectionDefinitionId { get; set; }
        
        public Guid? ContainerId { get; set; } // Nullable because legacy sections might not have it yet
        public int ColumnIndex { get; set; } = 0; // 0 for left/main, 1 for right sidebar, etc.
        public string LayoutConfigJson { get; set; } = "{}"; // JSON string storing WidthMode, HeightMode, CompactMode, Padding, Gap, etc.
        
        [Required]
        public string DisplayName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string BindingPath { get; set; } = string.Empty;
        
        public int OrderIndex { get; set; }
        public string Status { get; set; } = "Added"; // Added, Hidden, Locked, Deleted
        
        public bool IsRequired { get; set; }
        public bool IsRepeatable { get; set; }
        public bool IsHidden { get; set; }
        public bool IsLocked { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Soft Delete
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        public string? DeletedBy { get; set; }
        public DateTime? RestoredAt { get; set; }
        public string? RestoredBy { get; set; }

        // Navigation properties
        public CvTemplate? Template { get; set; }
        public CvSectionDefinition? SectionDefinition { get; set; }
        public CvTemplateContainer? Container { get; set; }
    }

    public class CvComponentDefinition
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required]
        public string ComponentType { get; set; } = string.Empty;
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string DefaultBindingPath { get; set; } = string.Empty;
        public string DefaultVariant { get; set; } = "default";
        public string SupportedVariantsJson { get; set; } = "[]";
        public string CompatibleSectionTypesJson { get; set; } = "[]";
        public bool IsRepeatable { get; set; }
        public bool IsBindable { get; set; }
        public bool IsContainer { get; set; }
        public bool IsSingleInstance { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class CvTemplateComponent
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TemplateId { get; set; }
        public Guid SectionId { get; set; }
        public Guid? ParentComponentId { get; set; }
        public Guid ComponentDefinitionId { get; set; }
        
        [Required]
        public string DisplayName { get; set; } = string.Empty;
        [Required]
        public string ComponentType { get; set; } = string.Empty;
        public string Variant { get; set; } = "default";
        public string BindingPath { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public string PropertiesJson { get; set; } = "{}";
        
        public bool IsHidden { get; set; }
        public bool IsLocked { get; set; }
        
        // Soft Delete
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        public string? DeletedBy { get; set; }
        public DateTime? RestoredAt { get; set; }
        public string? RestoredBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public CvTemplate? Template { get; set; }
        public CvTemplateSection? Section { get; set; }
        public CvTemplateComponent? ParentComponent { get; set; }
        public CvComponentDefinition? ComponentDefinition { get; set; }
        public ICollection<CvTemplateComponent> ChildComponents { get; set; } = new List<CvTemplateComponent>();
    }

    public class SubscriptionPlan
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // e.g., Free, Premium Monthly, Premium Yearly
        public decimal Price { get; set; }
        public string Duration { get; set; } = string.Empty; // e.g., Lifetime, Monthly, Yearly
        public string FeaturesJson { get; set; } = "[]"; // List of features stored as JSON
        public bool IsActive { get; set; } = true;
    }

    public class UserSubscription
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public int SubscriptionPlanId { get; set; }
        public SubscriptionPlan? SubscriptionPlan { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "Active"; // Active, Expired, Cancelled
    }

    public class PaymentTransaction
    {
        public string Id { get; set; } = string.Empty; // e.g., #RAI-12894
        public int UserId { get; set; }
        public User? User { get; set; }
        public int SubscriptionPlanId { get; set; }
        public SubscriptionPlan? SubscriptionPlan { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty; // Momo, ZaloPay, Visa, Banking
        public string Status { get; set; } = string.Empty; // Success, Pending, Failed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

