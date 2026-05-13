namespace InterviewPro.API.DTOs;

// ──────────────── Auth ────────────────
public record RegisterRequest(string Name, string Email, string Password);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, UserDto User);
public record UserDto(Guid Id, string Name, string Email, string Role);

// ──────────────── Interview ────────────────
public record CreateInterviewRequest(string Role, string Type, string Level);
public record InterviewDto(Guid Id, string Role, string Type, string Level, string Status, int? TotalScore, DateTime CreatedAt);

// ──────────────── Answer ────────────────
public record SubmitAnswerRequest(Guid InterviewId, Guid QuestionId, string Content);
public record AnswerDto(Guid Id, string Content, string? AiFeedback, int? Score);

// ──────────────── Dashboard ────────────────
public record DashboardStatsDto(int TotalInterviews, double AverageScore, int Streak, List<InterviewDto> RecentHistory);

// ──────────────── GitHub ────────────────
public record GithubAnalysisRequest(string RepoUrl);
public record GithubAnalysisDto(Guid Id, string RepoUrl, int ArchitectureScore, int CleanCodeScore, int SecurityScore, int PerformanceScore, string Summary, List<string> Strengths, List<string> Improvements, DateTime CreatedAt);
