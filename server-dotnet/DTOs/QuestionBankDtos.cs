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
    bool IsClientVisible,
    string Status
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

public class CodingExampleDto
{
    public string Input { get; set; } = string.Empty;
    public string Output { get; set; } = string.Empty;
    public string? Explanation { get; set; }
}

public class CodingTestCaseDto
{
    public string Input { get; set; } = string.Empty;
    public string ExpectedOutput { get; set; } = string.Empty;
    public bool IsHidden { get; set; }
}

public class CodingSolutionDto
{
    public string Idea { get; set; } = string.Empty;
    public string TimeComplexity { get; set; } = string.Empty;
    public string SpaceComplexity { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}

public class CreateCodingProblemRequest
{
    public string Title { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
    public List<string> Categories { get; set; } = new();
    public string RecommendedLevel { get; set; } = string.Empty;
    public string FunctionName { get; set; } = string.Empty;
    public string MethodSignature { get; set; } = string.Empty;
    public string ReturnType { get; set; } = string.Empty;
    public string? InputFormat { get; set; }
    public string? OutputFormat { get; set; }
    public List<string> Constraints { get; set; } = new();
    public List<CodingExampleDto> Examples { get; set; } = new();
    public List<CodingTestCaseDto> PublicTestCases { get; set; } = new();
    public List<CodingTestCaseDto> HiddenTestCases { get; set; } = new();
    public List<string> SupportedLanguages { get; set; } = new();
    public Dictionary<string, string> StarterCode { get; set; } = new();
    public CodingSolutionDto Solution { get; set; } = new();
    public List<string> TargetSkills { get; set; } = new();
    public int EstimatedMinutes { get; set; } = 15;
    public string Status { get; set; } = "Draft";
    public bool IsClientVisible { get; set; }
    public bool AllowRandomSelection { get; set; }
}

public class UpdateCodingProblemRequest
{
    public string Title { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
    public List<string> Categories { get; set; } = new();
    public string RecommendedLevel { get; set; } = string.Empty;
    public string FunctionName { get; set; } = string.Empty;
    public string MethodSignature { get; set; } = string.Empty;
    public string ReturnType { get; set; } = string.Empty;
    public string? InputFormat { get; set; }
    public string? OutputFormat { get; set; }
    public List<string> Constraints { get; set; } = new();
    public List<CodingExampleDto> Examples { get; set; } = new();
    public List<CodingTestCaseDto> PublicTestCases { get; set; } = new();
    public List<CodingTestCaseDto> HiddenTestCases { get; set; } = new();
    public List<string> SupportedLanguages { get; set; } = new();
    public Dictionary<string, string> StarterCode { get; set; } = new();
    public CodingSolutionDto Solution { get; set; } = new();
    public List<string> TargetSkills { get; set; } = new();
    public int EstimatedMinutes { get; set; } = 15;
    public string Status { get; set; } = "Draft";
    public bool IsClientVisible { get; set; }
    public bool AllowRandomSelection { get; set; }
}

public class CodingProblemAdminDto
{
    public Guid Id { get; set; }
    public string ProblemCode { get; set; } = "";
    public string Title { get; set; } = "";
    public string ShortDescription { get; set; } = "";
    public string Description { get; set; } = "";
    public string Difficulty { get; set; } = "";
    public List<string> Categories { get; set; } = new();
    public string RecommendedLevel { get; set; } = "";
    public string? InputFormat { get; set; }
    public string? OutputFormat { get; set; }
    public List<string> Constraints { get; set; } = new();
    public List<CodingExampleDto> Examples { get; set; } = new();
    public List<CodingTestCaseDto> PublicTestCases { get; set; } = new();
    public List<CodingTestCaseDto> HiddenTestCases { get; set; } = new();
    public List<string> SupportedLanguages { get; set; } = new();
    public Dictionary<string, string> StarterCode { get; set; } = new();
    public CodingSolutionDto Solution { get; set; } = new();
    public List<string> TargetSkills { get; set; } = new();
    public int EstimatedMinutes { get; set; } = 15;
    public string Status { get; set; } = "";
    public bool AllowRandomSelection { get; set; }
    public bool IsClientVisible { get; set; }
    public Guid CreatedByAdminId { get; set; }
    public string CreatedByAdminName { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
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
    public float? HighestScore { get; set; }
    public string? LastAttemptAt { get; set; }
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
    
    // STAR fields
    public int StarCompletion { get; set; }
    public InterviewPro.API.Interfaces.StarChecklist StarChecklist { get; set; } = new();
    public InterviewPro.API.Interfaces.StarAnalysisResult StarAnalysis { get; set; } = new();
    public InterviewPro.API.Interfaces.ImprovedAnswerResult ImprovedAnswer { get; set; } = new();
    public string NextRecommendation { get; set; } = string.Empty;
    
    // Technical scores
    public InterviewPro.API.DTOs.AiScores? TechnicalScores { get; set; }
}

// ══════════════════════════════════════════════════
// CLIENT — Practice Coding DTOs
// ══════════════════════════════════════════════════

public class CodingProblemListItemDto
{
    public Guid Id { get; set; }
    public string ProblemCode { get; set; } = "";
    public string Title { get; set; } = "";
    public string ShortDescription { get; set; } = "";
    public string Difficulty { get; set; } = "";
    public List<string> Categories { get; set; } = new();
    public string RecommendedLevel { get; set; } = "";
    public string FunctionName { get; set; } = "";
    public string MethodSignature { get; set; } = "";
    public string ReturnType { get; set; } = "";
    public List<string> SupportedLanguages { get; set; } = new();
    public int PublicTestCaseCount { get; set; }
    public int HiddenTestCaseCount { get; set; }
    public List<string> TargetSkills { get; set; } = new();
    public int EstimatedMinutes { get; set; } = 15;
    public string Status { get; set; } = "";
    public bool IsClientVisible { get; set; }
    public bool AllowRandomSelection { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Updated/Added fields for redesigned tracking:
    public string PracticeStatus { get; set; } = "NotStarted"; // NotStarted | InProgress | Solved
    public int AttemptCount { get; set; }
    public float? BestScore { get; set; }
    public string CompletionStatus { get; set; } = "NotStarted";
}

public class CodingProblemDetailDto
{
    public Guid Id { get; set; }
    public string ProblemCode { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string ShortDescription { get; set; } = "";
    public string Difficulty { get; set; } = "";
    public List<string> Categories { get; set; } = new();
    public string RecommendedLevel { get; set; } = "";
    public string FunctionName { get; set; } = "";
    public string MethodSignature { get; set; } = "";
    public string ReturnType { get; set; } = "";
    public string? InputFormat { get; set; }
    public string? OutputFormat { get; set; }
    public List<string> Constraints { get; set; } = new();
    public List<CodingExampleDto> Examples { get; set; } = new();
    public List<CodingTestCaseDto> PublicTestCases { get; set; } = new();
    public List<CodingTestCaseDto>? HiddenTestCases { get; set; }
    public List<string> SupportedLanguages { get; set; } = new();
    public Dictionary<string, string> StarterCode { get; set; } = new();
    public CodingSolutionDto? Solution { get; set; }
    public string Status { get; set; } = "";
    public bool IsClientVisible { get; set; }
    public bool AllowRandomSelection { get; set; }
    public List<string> TargetSkills { get; set; } = new();
    public int EstimatedMinutes { get; set; } = 15;
    public Guid CreatedByAdminId { get; set; }
    public string CreatedByAdminName { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Updated tracking fields
    public string PracticeStatus { get; set; } = "NotStarted";
    public int AttemptCount { get; set; }
    public float? BestScore { get; set; }
}

public record SubmitCodeRequest(string Language, string Code);

public class AiFeedbackDto
{
    public List<string> Strengths { get; set; } = new();
    public List<string> Weaknesses { get; set; } = new();
    public List<string> Suggestions { get; set; } = new();
    public string TimeComplexity { get; set; } = "";
    public string SpaceComplexity { get; set; } = "";
}

public class TestCaseResultDto
{
    public int Index { get; set; }
    public string Input { get; set; } = "";
    public string ExpectedOutput { get; set; } = "";
    public string ActualOutput { get; set; } = "";
    public string Status { get; set; } = ""; // Passed, Failed, Error, Timeout
    public bool Passed { get; set; }
    public int ExecutionTimeMs { get; set; }
}

public class SubmitCodeResult
{
    public int AttemptId { get; set; }
    public int AttemptNumber { get; set; }
    public string Status { get; set; } = "";
    public int PassedTestCases { get; set; }
    public int TotalTestCases { get; set; }
    public float? Score { get; set; }
    public int? RuntimeMs { get; set; }
    public float? MemoryUsageMb { get; set; }
    public AiFeedbackDto? AiFeedback { get; set; }
    public List<TestCaseResultDto> TestResults { get; set; } = new();
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

public class CodingPracticeAttemptDto
{
    public int Id { get; set; }
    public Guid CodingProblemId { get; set; }
    public string CodingProblemTitle { get; set; } = "";
    public int AttemptNumber { get; set; }
    public string Language { get; set; } = "";
    public string SubmittedCode { get; set; } = "";
    public int PassedTestCases { get; set; }
    public int TotalTestCases { get; set; }
    public string Status { get; set; } = "";
    public float? Score { get; set; }
    public int? RuntimeMs { get; set; }
    public float? MemoryUsageMb { get; set; }
    public AiFeedbackDto? AiFeedback { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CodingProgressDto
{
    public int TotalProblemsCount { get; set; }
    public int SolvedProblemsCount { get; set; }
    public int TotalAttemptsCount { get; set; }
    public double AverageScore { get; set; }
    public double PassRate { get; set; }
}
