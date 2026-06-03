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
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string ShortDescription { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        /// <summary>Easy | Medium | Hard</summary>
        public string Difficulty { get; set; } = "Easy";

        public string Category { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;

        /// <summary>JSON array of tag strings</summary>
        public string? TagsJson { get; set; }

        public string? InputFormat { get; set; }
        public string? OutputFormat { get; set; }

        /// <summary>JSON array of constraint strings</summary>
        public string? ConstraintsJson { get; set; }

        /// <summary>JSON array of {input, output, explanation} objects</summary>
        public string? ExamplesJson { get; set; }

        /// <summary>JSON array of test case objects (hidden)</summary>
        public string? TestCasesJson { get; set; }

        /// <summary>JSON map: {"Java": "...", "Python": "..."}</summary>
        public string? StarterCodeJson { get; set; }

        /// <summary>JSON map of solutions (hidden from client until submit)</summary>
        public string? SolutionJson { get; set; }

        /// <summary>Draft | Published | Disabled</summary>
        public string Status { get; set; } = "Draft";

        public bool AllowRandomSelection { get; set; } = true;

        /// <summary>Controls whether Client can see this problem</summary>
        public bool IsClientVisible { get; set; } = true;

        public int CreatedByAdminId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
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
    // User Coding Practice History
    // ─────────────────────────────────────────────────
    public class UserCodingPracticeHistory
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int CodingProblemId { get; set; }

        public string Language { get; set; } = string.Empty;
        public string SubmittedCode { get; set; } = string.Empty;

        public int PassedTestCases { get; set; }
        public int TotalTestCases { get; set; }

        /// <summary>Accepted | Failed | RuntimeError | CompileError</summary>
        public string Status { get; set; } = "Failed";

        public float? AiScore { get; set; }
        public string? AiFeedback { get; set; }
        public string? TimeComplexity { get; set; }
        public string? SpaceComplexity { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public CodingProblem? CodingProblem { get; set; }
    }
}
