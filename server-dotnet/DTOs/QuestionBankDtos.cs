namespace InterviewPro.API.DTOs;

// ══════════════════════════════════════════════════
// ADMIN — Question Bank DTOs
// ══════════════════════════════════════════════════

public record CreateQuestionRequest(
    string Title,
    string Content,
    string? ExpectedAnswerGuide,
    string? ExampleAnswer,
    string Category,        // HR | Technical | GitHub
    string Role,
    string Difficulty,      // Intern | Fresher | Junior | Middle | Senior
    string? TechStackJson,
    string? TagsJson,
    string Source,          // HumanCreated | AiGenerated
    bool AllowAIUse,
    bool AllowRandomSelection,
    bool IsClientVisible,
    string Status
);

public record UpdateQuestionRequest(
    string Title,
    string Content,
    string? ExpectedAnswerGuide,
    string? ExampleAnswer,
    string Category,
    string Role,
    string Difficulty,
    string? TechStackJson,
    string? TagsJson,
    bool AllowAIUse,
    bool AllowRandomSelection,
    bool IsClientVisible
);

public class QuestionAdminDto
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Content { get; set; } = "";
    public string? ExpectedAnswerGuide { get; set; }
    public string? ExampleAnswer { get; set; }
    public string Category { get; set; } = "";
    public string Role { get; set; } = "";
    public string Difficulty { get; set; } = "";
    public string? TechStackJson { get; set; }
    public string? TagsJson { get; set; }
    public string Source { get; set; } = "";
    public string Status { get; set; } = "";
    public bool AllowAIUse { get; set; }
    public bool AllowRandomSelection { get; set; }
    public bool IsClientVisible { get; set; }
    public int CreatedByAdminId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// ══════════════════════════════════════════════════
// ADMIN — Coding Problem DTOs
// ══════════════════════════════════════════════════

public record CreateCodingProblemRequest(
    string Title,
    string ShortDescription,
    string Description,
    string Difficulty,       // Easy | Medium | Hard
    string Category,
    string Role,
    string? TagsJson,
    string? InputFormat,
    string? OutputFormat,
    string? ConstraintsJson,
    string? ExamplesJson,
    string? TestCasesJson,
    string? StarterCodeJson,
    string? SolutionJson,
    bool AllowRandomSelection,
    bool IsClientVisible
);

public record UpdateCodingProblemRequest(
    string Title,
    string ShortDescription,
    string Description,
    string Difficulty,
    string Category,
    string Role,
    string? TagsJson,
    string? InputFormat,
    string? OutputFormat,
    string? ConstraintsJson,
    string? ExamplesJson,
    string? TestCasesJson,
    string? StarterCodeJson,
    string? SolutionJson,
    bool AllowRandomSelection,
    bool IsClientVisible
);

public class CodingProblemAdminDto
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string ShortDescription { get; set; } = "";
    public string Description { get; set; } = "";
    public string Difficulty { get; set; } = "";
    public string Category { get; set; } = "";
    public string Role { get; set; } = "";
    public string? TagsJson { get; set; }
    public string? InputFormat { get; set; }
    public string? OutputFormat { get; set; }
    public string? ConstraintsJson { get; set; }
    public string? ExamplesJson { get; set; }
    public string? TestCasesJson { get; set; }
    public string? StarterCodeJson { get; set; }
    public string Status { get; set; } = "";
    public bool AllowRandomSelection { get; set; }
    public bool IsClientVisible { get; set; }
    public int CreatedByAdminId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// ══════════════════════════════════════════════════
// CLIENT — Practice Question DTOs
// ══════════════════════════════════════════════════

public class QuestionListItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Content { get; set; } = "";
    public string Category { get; set; } = "";
    public string Role { get; set; } = "";
    public string Difficulty { get; set; } = "";
    public string? TagsJson { get; set; }
    public string? TechStackJson { get; set; }
    public string PracticeStatus { get; set; } = "NotStarted"; // NotStarted | Practiced | Completed
}

public class QuestionDetailDto
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Content { get; set; } = "";
    public string? ExpectedAnswerGuide { get; set; }
    public string? ExampleAnswer { get; set; }
    public string Category { get; set; } = "";
    public string Role { get; set; } = "";
    public string Difficulty { get; set; } = "";
    public string? TechStackJson { get; set; }
    public string? TagsJson { get; set; }
    public string PracticeStatus { get; set; } = "NotStarted";
}

public record SubmitQuestionAnswerRequest(string Answer);

public class SubmitQuestionAnswerResult
{
    public int PracticeId { get; set; }
    public float? Score { get; set; }
    public string? Feedback { get; set; }
    public string? StrengthsJson { get; set; }
    public string? WeaknessesJson { get; set; }
    public string? ImprovementSuggestionsJson { get; set; }
}

// ══════════════════════════════════════════════════
// CLIENT — Practice Coding DTOs
// ══════════════════════════════════════════════════

public class CodingProblemListItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string ShortDescription { get; set; } = "";
    public string Difficulty { get; set; } = "";
    public string Category { get; set; } = "";
    public string Role { get; set; } = "";
    public string? TagsJson { get; set; }
    public string PracticeStatus { get; set; } = "NotStarted";
}

public class CodingProblemDetailDto
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string ShortDescription { get; set; } = "";
    public string Difficulty { get; set; } = "";
    public string Category { get; set; } = "";
    public string Role { get; set; } = "";
    public string? InputFormat { get; set; }
    public string? OutputFormat { get; set; }
    public string? ConstraintsJson { get; set; }
    public string? ExamplesJson { get; set; }
    public string? StarterCodeJson { get; set; }
    public string? TagsJson { get; set; }
    // Note: TestCasesJson and SolutionJson intentionally excluded from client view
    public string PracticeStatus { get; set; } = "NotStarted";
}

public record SubmitCodeRequest(string Language, string Code);

public class SubmitCodeResult
{
    public int PracticeId { get; set; }
    public string Status { get; set; } = "";
    public int PassedTestCases { get; set; }
    public int TotalTestCases { get; set; }
    public float? Score { get; set; }
    public string? AiFeedback { get; set; }
    public string? TimeComplexity { get; set; }
    public string? SpaceComplexity { get; set; }
}

// ══════════════════════════════════════════════════
// CLIENT — Progress DTOs
// ══════════════════════════════════════════════════

public class PracticeProgressDto
{
    public int TotalPracticed { get; set; }
    public int HrPracticed { get; set; }
    public int HrTotal { get; set; }
    public int TechnicalPracticed { get; set; }
    public int TechnicalTotal { get; set; }
    public int CodingPracticed { get; set; }
    public int CodingTotal { get; set; }
    public int DailyStreak { get; set; }
}

// ══════════════════════════════════════════════════
// Pagination
// ══════════════════════════════════════════════════

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalItems / PageSize);
}
