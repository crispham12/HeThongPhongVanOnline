using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InterviewPro.API.Entities
{
    // ─────────────────────────────────────────────────
    // Question Bank (HR + Technical)
    // ─────────────────────────────────────────────────
    public class Question
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public string? ExpectedAnswerGuide { get; set; }
        public string? ExampleAnswer { get; set; }

        /// <summary>HR | Technical | GitHub</summary>
        public string Category { get; set; } = "HR";

        public string Role { get; set; } = string.Empty;

        /// <summary>Intern | Fresher | Junior | Middle | Senior</summary>
        public string Difficulty { get; set; } = "Fresher";

        /// <summary>JSON array of tech stack strings</summary>
        public string? TechStackJson { get; set; }

        /// <summary>JSON array of tag strings</summary>
        public string? TagsJson { get; set; }

        /// <summary>HumanCreated | AiGenerated</summary>
        public string Source { get; set; } = "HumanCreated";

        /// <summary>Draft | Published | Disabled</summary>
        public string Status { get; set; } = "Draft";

        public bool AllowAIUse { get; set; } = true;
        public bool AllowRandomSelection { get; set; } = true;

        /// <summary>Controls whether Client can see this question</summary>
        public bool IsClientVisible { get; set; } = true;

        public int CreatedByAdminId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    // ─────────────────────────────────────────────────
    // Coding Problem Bank
    // ─────────────────────────────────────────────────
    public class CodingProblem
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string ProblemCode { get; set; } = string.Empty;

        [Required]
        public string Title { get; set; } = string.Empty;

        public string ShortDescription { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        /// <summary>Easy | Medium | Hard</summary>
        public string Difficulty { get; set; } = "Easy";

        /// <summary>JSON array of category strings, e.g. ["Array", "HashMap"]</summary>
        public string CategoriesJson { get; set; } = "[]";

        public string RecommendedLevel { get; set; } = string.Empty;

        public string? InputFormat { get; set; }
        public string? OutputFormat { get; set; }

        /// <summary>JSON array of constraint strings</summary>
        public string ConstraintsJson { get; set; } = "[]";

        /// <summary>JSON array of {input, output, explanation} objects</summary>
        public string ExamplesJson { get; set; } = "[]";

        /// <summary>JSON array of test case objects (public)</summary>
        public string PublicTestCasesJson { get; set; } = "[]";

        /// <summary>JSON array of test case objects (hidden)</summary>
        public string HiddenTestCasesJson { get; set; } = "[]";

        /// <summary>JSON array of supported languages, e.g. ["Java", "Python"]</summary>
        public string SupportedLanguagesJson { get; set; } = "[]";

        /// <summary>JSON map: {"Java": "...", "Python": "..."}</summary>
        public string StarterCodeJson { get; set; } = "{}";

        /// <summary>JSON map of solutions: {"idea": "...", "timeComplexity": "...", "spaceComplexity": "...", "code": "..."}</summary>
        public string SolutionJson { get; set; } = "{}";

        /// <summary>Draft | Published | Disabled</summary>
        public string Status { get; set; } = "Draft";

        public bool AllowRandomSelection { get; set; } = true;

        /// <summary>Controls whether Client can see this problem</summary>
        public bool IsClientVisible { get; set; } = true;
        
        /// <summary>JSON array of target skills, e.g. ["Array", "HashMap"]</summary>
        public string TargetSkillsJson { get; set; } = "[]";

        public int EstimatedMinutes { get; set; } = 15;

        public string FunctionName { get; set; } = string.Empty;
        public string MethodSignature { get; set; } = string.Empty;
        public string ReturnType { get; set; } = string.Empty;

        public Guid CreatedByAdminId { get; set; }
        public string CreatedByAdminName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }

    // ─────────────────────────────────────────────────
    // User Question Practice History (HR / Technical)
    // ─────────────────────────────────────────────────
    public class UserQuestionPracticeHistory
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int QuestionId { get; set; }

        public string UserAnswer { get; set; } = string.Empty;

        public float? AiScore { get; set; }
        public string? AiFeedback { get; set; }
        public string? StrengthsJson { get; set; }
        public string? WeaknessesJson { get; set; }
        public string? ImprovementSuggestionsJson { get; set; }

        /// <summary>NotStarted | Practiced | Completed</summary>
        public string PracticeStatus { get; set; } = "Practiced";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Question? Question { get; set; }
    }

    // ─────────────────────────────────────────────────
    // Coding Practice Attempt
    // ─────────────────────────────────────────────────
    public class CodingPracticeAttempt
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public Guid CodingProblemId { get; set; }

        /// <summary>Sequential number per user per problem: 1, 2, 3...</summary>
        public int AttemptNumber { get; set; } = 1;

        public string Language { get; set; } = string.Empty;
        public string SubmittedCode { get; set; } = string.Empty;

        public int PassedTestCases { get; set; }
        public int TotalTestCases { get; set; }

        public float? Score { get; set; }

        /// <summary>Estimated execution time in milliseconds</summary>
        public int? RuntimeMs { get; set; }

        /// <summary>Estimated memory usage in MB</summary>
        public float? MemoryUsageMb { get; set; }

        /// <summary>JSON: {strengths[], weaknesses[], suggestions[], timeComplexity, spaceComplexity}</summary>
        public string AiFeedbackJson { get; set; } = "{}";

        /// <summary>Accepted | Failed | RuntimeError | CompileError | Timeout</summary>
        public string Status { get; set; } = "Failed";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public CodingProblem? CodingProblem { get; set; }
    }

    // ─────────────────────────────────────────────────
    // User Coding Problem Progress (per user per problem)
    // ─────────────────────────────────────────────────
    public class UserCodingProblemProgress
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public Guid CodingProblemId { get; set; }

        public float? BestScore { get; set; }
        public float? LatestScore { get; set; }
        public int AttemptCount { get; set; }

        /// <summary>True when at least one attempt has Status = Accepted</summary>
        public bool IsSolved { get; set; }

        public DateTime? LastAttemptAt { get; set; }

        // Navigation
        public CodingProblem? CodingProblem { get; set; }
    }

    // ─────────────────────────────────────────────────
    // Coding Assessment History (per user per problem/session)
    // ─────────────────────────────────────────────────
    public class CodingAssessmentHistory
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public Guid CodingProblemId { get; set; }
        public Guid InterviewSessionId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public CodingProblem? CodingProblem { get; set; }
    }
}
