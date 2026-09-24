using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AiRequestLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Feature = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RequestType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Model = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    InputTokens = table.Column<int>(type: "int", nullable: false),
                    OutputTokens = table.Column<int>(type: "int", nullable: false),
                    TotalTokens = table.Column<int>(type: "int", nullable: false),
                    EstimatedCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ResponseTimeMs = table.Column<long>(type: "bigint", nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PromptVersion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Temperature = table.Column<double>(type: "float", nullable: false),
                    EvaluationTime = table.Column<double>(type: "float", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiRequestLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CodingProblems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProblemCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ShortDescription = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CategoriesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RecommendedLevel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InputFormat = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OutputFormat = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConstraintsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExamplesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PublicTestCasesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HiddenTestCasesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SupportedLanguagesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StarterCodeJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SolutionJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AllowRandomSelection = table.Column<bool>(type: "bit", nullable: false),
                    IsClientVisible = table.Column<bool>(type: "bit", nullable: false),
                    TargetSkillsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EstimatedMinutes = table.Column<int>(type: "int", nullable: false),
                    FunctionName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MethodSignature = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReturnType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedByAdminId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByAdminName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodingProblems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FullMockSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    SessionGuid = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TechStackJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompletedRoundsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HrSessionGuid = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TechnicalSessionGuid = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CodingSessionGuid = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FullMockSessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HrInterviewSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    SessionGuid = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TechStackJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TotalQuestions = table.Column<int>(type: "int", nullable: false),
                    CurrentQuestionIndex = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FinalScore = table.Column<double>(type: "float", nullable: true),
                    FinalLevel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FinalSummary = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AnsweredQuestions = table.Column<int>(type: "int", nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HrInterviewSessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HrQuestionBanks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuestionText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpectedAnswerGuide = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TargetSkill = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SuggestedMethod = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MaxAnswerTime = table.Column<int>(type: "int", nullable: false),
                    Source = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    RoleContext = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LevelContext = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UsageCount = table.Column<int>(type: "int", nullable: false),
                    LastUsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HrQuestionBanks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InterviewAnalysisJobs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Progress = table.Column<int>(type: "int", nullable: false),
                    CurrentStep = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AnalysisResultId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewAnalysisJobs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InterviewAnalysisResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    OverallScore = table.Column<double>(type: "float", nullable: false),
                    STARScore = table.Column<double>(type: "float", nullable: false),
                    CommunicationScore = table.Column<double>(type: "float", nullable: false),
                    ConfidenceScore = table.Column<double>(type: "float", nullable: false),
                    ProfessionalismScore = table.Column<double>(type: "float", nullable: false),
                    LogicScore = table.Column<double>(type: "float", nullable: false),
                    CompletenessScore = table.Column<double>(type: "float", nullable: false),
                    ClarityScore = table.Column<double>(type: "float", nullable: false),
                    OverallStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SummaryText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TopPercentile = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HiringReadiness = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewAnalysisResults", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InterviewSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    SessionGuid = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TechStack = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InterviewType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CurrentPhase = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CurrentQuestionIndex = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OverallFeedback = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OverallScore = table.Column<double>(type: "float", nullable: false),
                    SkillRoadmap = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TotalQuestions = table.Column<int>(type: "int", nullable: false),
                    AnsweredQuestions = table.Column<int>(type: "int", nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewSessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PracticeSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    SkillType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LatestScore = table.Column<double>(type: "float", nullable: false),
                    BestScore = table.Column<double>(type: "float", nullable: false),
                    AttemptCount = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticeSessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpectedAnswerGuide = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExampleAnswer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Category = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TechStackJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TagsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Source = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AllowAIUse = table.Column<bool>(type: "bit", nullable: false),
                    AllowRandomSelection = table.Column<bool>(type: "bit", nullable: false),
                    IsClientVisible = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByAdminId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AvatarUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Plan = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PremiumExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResetToken = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ResetTokenExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsLocked = table.Column<bool>(type: "bit", nullable: false),
                    LockReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DailyInterviewUsed = table.Column<int>(type: "int", nullable: false),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CodingAssessmentHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CodingProblemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InterviewSessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodingAssessmentHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodingAssessmentHistories_CodingProblems_CodingProblemId",
                        column: x => x.CodingProblemId,
                        principalTable: "CodingProblems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CodingPracticeAttempts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CodingProblemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AttemptNumber = table.Column<int>(type: "int", nullable: false),
                    Language = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SubmittedCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PassedTestCases = table.Column<int>(type: "int", nullable: false),
                    TotalTestCases = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<float>(type: "real", nullable: true),
                    RuntimeMs = table.Column<int>(type: "int", nullable: true),
                    MemoryUsageMb = table.Column<float>(type: "real", nullable: true),
                    AiFeedbackJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodingPracticeAttempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodingPracticeAttempts_CodingProblems_CodingProblemId",
                        column: x => x.CodingProblemId,
                        principalTable: "CodingProblems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserCodingProblemProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CodingProblemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BestScore = table.Column<float>(type: "real", nullable: true),
                    LatestScore = table.Column<float>(type: "real", nullable: true),
                    AttemptCount = table.Column<int>(type: "int", nullable: false),
                    IsSolved = table.Column<bool>(type: "bit", nullable: false),
                    LastAttemptAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCodingProblemProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCodingProblemProgresses_CodingProblems_CodingProblemId",
                        column: x => x.CodingProblemId,
                        principalTable: "CodingProblems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HrInterviewAnswers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    AnswerText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Transcript = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DurationSeconds = table.Column<int>(type: "int", nullable: false),
                    WordCount = table.Column<int>(type: "int", nullable: false),
                    FillerWords = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HrInterviewAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HrInterviewAnswers_HrInterviewSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "HrInterviewSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HrInterviewDrafts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    AnswerText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Transcript = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DurationSeconds = table.Column<int>(type: "int", nullable: false),
                    WordCount = table.Column<int>(type: "int", nullable: false),
                    FillerWords = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HrInterviewDrafts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HrInterviewDrafts_HrInterviewSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "HrInterviewSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HrInterviewEvaluations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    StarStructureScore = table.Column<double>(type: "float", nullable: false),
                    CommunicationScore = table.Column<double>(type: "float", nullable: false),
                    ProfessionalismScore = table.Column<double>(type: "float", nullable: false),
                    ConfidenceScore = table.Column<double>(type: "float", nullable: false),
                    LogicScore = table.Column<double>(type: "float", nullable: false),
                    CompletenessScore = table.Column<double>(type: "float", nullable: false),
                    ClarityScore = table.Column<double>(type: "float", nullable: false),
                    OverallScore = table.Column<double>(type: "float", nullable: false),
                    HiringReadiness = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OverallStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PromptVersion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EvaluationModel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OverallObservation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StrengthSummary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WeaknessSummary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HiringRecommendation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HrInterviewEvaluations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HrInterviewEvaluations_HrInterviewSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "HrInterviewSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HrInterviewQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    QuestionBankId = table.Column<int>(type: "int", nullable: true),
                    QuestionGuid = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QuestionIndex = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QuestionText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpectedAnswerGuide = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TargetSkill = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SuggestedMethod = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Source = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MaxAnswerTime = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HrInterviewQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HrInterviewQuestions_HrInterviewSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "HrInterviewSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InterviewImprovements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ResultId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Score = table.Column<double>(type: "float", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewImprovements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewImprovements_InterviewAnalysisResults_ResultId",
                        column: x => x.ResultId,
                        principalTable: "InterviewAnalysisResults",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InterviewStarAnalyses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ResultId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Score = table.Column<double>(type: "float", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Feedback = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewStarAnalyses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewStarAnalyses_InterviewAnalysisResults_ResultId",
                        column: x => x.ResultId,
                        principalTable: "InterviewAnalysisResults",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InterviewStrengths",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ResultId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Score = table.Column<double>(type: "float", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewStrengths", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewStrengths_InterviewAnalysisResults_ResultId",
                        column: x => x.ResultId,
                        principalTable: "InterviewAnalysisResults",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InterviewQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    Phase = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserAnswer = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Score = table.Column<double>(type: "float", nullable: false),
                    Feedback = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EvaluationCriteria = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewQuestions_InterviewSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "InterviewSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PracticeAttempts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    AttemptNumber = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<double>(type: "float", nullable: false),
                    DurationSeconds = table.Column<int>(type: "int", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Summary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticeAttempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PracticeAttempts_PracticeSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "PracticeSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserQuestionPracticeHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    UserAnswer = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AiScore = table.Column<float>(type: "real", nullable: true),
                    AiFeedback = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StrengthsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WeaknessesJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImprovementSuggestionsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PracticeStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserQuestionPracticeHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserQuestionPracticeHistories_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CandidateReports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionGuid = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CandidateName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TargetRole = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Level = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OverallScore = table.Column<float>(type: "real", nullable: false),
                    HiringRecommendation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConfidenceScore = table.Column<float>(type: "real", nullable: false),
                    AiAssessmentSummary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CandidateReports_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CodingInterviewSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionGuid = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Level = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TechStack = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Language = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CurrentProblemIndex = table.Column<int>(type: "int", nullable: false),
                    CurrentStage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OverallScore = table.Column<float>(type: "real", nullable: false),
                    AvgProblemUnderstandingScore = table.Column<float>(type: "real", nullable: false),
                    AvgAlgorithmDesignScore = table.Column<float>(type: "real", nullable: false),
                    AvgCorrectnessScore = table.Column<float>(type: "real", nullable: false),
                    AvgQualityScore = table.Column<float>(type: "real", nullable: false),
                    AvgComplexityScore = table.Column<float>(type: "real", nullable: false),
                    AvgTestingScore = table.Column<float>(type: "real", nullable: false),
                    AvgCommunicationScore = table.Column<float>(type: "real", nullable: false),
                    FinalReportJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InterviewMemorySummary = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodingInterviewSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodingInterviewSessions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PaymentOrders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    PlanType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Amount = table.Column<long>(type: "bigint", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActualAmount = table.Column<long>(type: "bigint", nullable: true),
                    SePayTransactionId = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentOrders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TechnicalInterviewSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionGuid = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Level = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TechStack = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OverallScore = table.Column<float>(type: "real", nullable: false),
                    FinalFeedbackJson = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TechnicalInterviewSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TechnicalInterviewSessions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HrInterviewQuestionEvaluations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InterviewAnswerId = table.Column<int>(type: "int", nullable: false),
                    QuestionScore = table.Column<double>(type: "float", nullable: false),
                    StarScore = table.Column<double>(type: "float", nullable: false),
                    CommunicationScore = table.Column<double>(type: "float", nullable: false),
                    ConfidenceScore = table.Column<double>(type: "float", nullable: false),
                    Strengths = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Weaknesses = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Suggestions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SituationScore = table.Column<double>(type: "float", nullable: false),
                    SituationStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SituationFeedback = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TaskScore = table.Column<double>(type: "float", nullable: false),
                    TaskStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TaskFeedback = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ActionScore = table.Column<double>(type: "float", nullable: false),
                    ActionStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ActionFeedback = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ResultScore = table.Column<double>(type: "float", nullable: false),
                    ResultStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ResultFeedback = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HrInterviewQuestionEvaluations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HrInterviewQuestionEvaluations_HrInterviewAnswers_InterviewAnswerId",
                        column: x => x.InterviewAnswerId,
                        principalTable: "HrInterviewAnswers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HrInterviewImprovements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EvaluationId = table.Column<int>(type: "int", nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HrInterviewImprovements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HrInterviewImprovements_HrInterviewEvaluations_EvaluationId",
                        column: x => x.EvaluationId,
                        principalTable: "HrInterviewEvaluations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HrInterviewRecommendedPractices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EvaluationId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EstimatedTime = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RecommendedLevel = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HrInterviewRecommendedPractices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HrInterviewRecommendedPractices_HrInterviewEvaluations_EvaluationId",
                        column: x => x.EvaluationId,
                        principalTable: "HrInterviewEvaluations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HrInterviewStrengths",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EvaluationId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Score = table.Column<double>(type: "float", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HrInterviewStrengths", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HrInterviewStrengths_HrInterviewEvaluations_EvaluationId",
                        column: x => x.EvaluationId,
                        principalTable: "HrInterviewEvaluations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PracticeAttemptQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AttemptId = table.Column<int>(type: "int", nullable: false),
                    SourceQuestionId = table.Column<int>(type: "int", nullable: true),
                    Question = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserAnswer = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Score = table.Column<double>(type: "float", nullable: false),
                    AiFeedback = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticeAttemptQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PracticeAttemptQuestions_PracticeAttempts_AttemptId",
                        column: x => x.AttemptId,
                        principalTable: "PracticeAttempts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CodingReports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CandidateReportId = table.Column<int>(type: "int", nullable: false),
                    OverallCodingScore = table.Column<float>(type: "real", nullable: false),
                    ProblemUnderstandingScore = table.Column<float>(type: "real", nullable: false),
                    AlgorithmDesignScore = table.Column<float>(type: "real", nullable: false),
                    CodeCorrectnessScore = table.Column<float>(type: "real", nullable: false),
                    CodeQualityScore = table.Column<float>(type: "real", nullable: false),
                    ComplexityAnalysisScore = table.Column<float>(type: "real", nullable: false),
                    TestingValidationScore = table.Column<float>(type: "real", nullable: false),
                    CommunicationScore = table.Column<float>(type: "real", nullable: false),
                    StrengthsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WeaknessesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LearningRoadmapJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CodingRecommendation = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodingReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodingReports_CandidateReports_CandidateReportId",
                        column: x => x.CandidateReportId,
                        principalTable: "CandidateReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HRReports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CandidateReportId = table.Column<int>(type: "int", nullable: false),
                    OverallHrScore = table.Column<float>(type: "real", nullable: false),
                    CommunicationScore = table.Column<float>(type: "real", nullable: false),
                    MotivationScore = table.Column<float>(type: "real", nullable: false),
                    ProblemSolvingScore = table.Column<float>(type: "real", nullable: false),
                    TeamworkScore = table.Column<float>(type: "real", nullable: false),
                    AdaptabilityScore = table.Column<float>(type: "real", nullable: false),
                    ProfessionalismScore = table.Column<float>(type: "real", nullable: false),
                    SelfAwarenessScore = table.Column<float>(type: "real", nullable: false),
                    StrengthsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImprovementsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AiSummary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HrRecommendation = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HRReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HRReports_CandidateReports_CandidateReportId",
                        column: x => x.CandidateReportId,
                        principalTable: "CandidateReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TechnicalReports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CandidateReportId = table.Column<int>(type: "int", nullable: false),
                    OverallTechnicalScore = table.Column<float>(type: "real", nullable: false),
                    TechnicalKnowledgeScore = table.Column<float>(type: "real", nullable: false),
                    ProblemSolvingScore = table.Column<float>(type: "real", nullable: false),
                    PracticalExperienceScore = table.Column<float>(type: "real", nullable: false),
                    SystemThinkingScore = table.Column<float>(type: "real", nullable: false),
                    CommunicationScore = table.Column<float>(type: "real", nullable: false),
                    BestPracticesScore = table.Column<float>(type: "real", nullable: false),
                    StrengthsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WeaknessesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AiSummary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TechnicalRecommendation = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TechnicalReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TechnicalReports_CandidateReports_CandidateReportId",
                        column: x => x.CandidateReportId,
                        principalTable: "CandidateReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CodingInterviewProblems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    ProblemIndex = table.Column<int>(type: "int", nullable: false),
                    CodingProblemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Source = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PassedTestCases = table.Column<int>(type: "int", nullable: false),
                    TotalTestCases = table.Column<int>(type: "int", nullable: false),
                    ExecutionTimeMs = table.Column<int>(type: "int", nullable: false),
                    MemoryUsageMb = table.Column<float>(type: "real", nullable: false),
                    ProblemUnderstandingScore = table.Column<float>(type: "real", nullable: false),
                    AlgorithmDesignScore = table.Column<float>(type: "real", nullable: false),
                    CorrectnessScore = table.Column<float>(type: "real", nullable: false),
                    QualityScore = table.Column<float>(type: "real", nullable: false),
                    ComplexityScore = table.Column<float>(type: "real", nullable: false),
                    TestingScore = table.Column<float>(type: "real", nullable: false),
                    CommunicationScore = table.Column<float>(type: "real", nullable: false),
                    SubmittedCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StaticAnalysisResultJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AIReviewFeedbackJson = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodingInterviewProblems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodingInterviewProblems_CodingInterviewSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "CodingInterviewSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TechnicalInterviewQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    QuestionIndex = table.Column<int>(type: "int", nullable: false),
                    Stage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpectedAnswer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CandidateAnswer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DurationSeconds = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<float>(type: "real", nullable: false),
                    FeedbackJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AnsweredAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TechnicalInterviewQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TechnicalInterviewQuestions_TechnicalInterviewSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "TechnicalInterviewSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CodingInterviewStageLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProblemId = table.Column<int>(type: "int", nullable: false),
                    Stage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CandidateInput = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AiResponse = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EvaluationJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodingInterviewStageLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodingInterviewStageLogs_CodingInterviewProblems_ProblemId",
                        column: x => x.ProblemId,
                        principalTable: "CodingInterviewProblems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AiRequestLogs_CreatedAt",
                table: "AiRequestLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AiRequestLogs_Feature",
                table: "AiRequestLogs",
                column: "Feature");

            migrationBuilder.CreateIndex(
                name: "IX_AiRequestLogs_Status",
                table: "AiRequestLogs",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_AiRequestLogs_UserId",
                table: "AiRequestLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateReports_UserId",
                table: "CandidateReports",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CodingAssessmentHistories_CodingProblemId",
                table: "CodingAssessmentHistories",
                column: "CodingProblemId");

            migrationBuilder.CreateIndex(
                name: "IX_CodingAssessmentHistories_UserId_InterviewSessionId",
                table: "CodingAssessmentHistories",
                columns: new[] { "UserId", "InterviewSessionId" });

            migrationBuilder.CreateIndex(
                name: "IX_CodingInterviewProblems_SessionId",
                table: "CodingInterviewProblems",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_CodingInterviewSessions_UserId",
                table: "CodingInterviewSessions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CodingInterviewStageLogs_ProblemId",
                table: "CodingInterviewStageLogs",
                column: "ProblemId");

            migrationBuilder.CreateIndex(
                name: "IX_CodingPracticeAttempts_CodingProblemId",
                table: "CodingPracticeAttempts",
                column: "CodingProblemId");

            migrationBuilder.CreateIndex(
                name: "IX_CodingPracticeAttempts_UserId_CodingProblemId",
                table: "CodingPracticeAttempts",
                columns: new[] { "UserId", "CodingProblemId" });

            migrationBuilder.CreateIndex(
                name: "IX_CodingPracticeAttempts_UserId_CodingProblemId_AttemptNumber",
                table: "CodingPracticeAttempts",
                columns: new[] { "UserId", "CodingProblemId", "AttemptNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_CodingProblems_CreatedAt",
                table: "CodingProblems",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CodingProblems_Difficulty",
                table: "CodingProblems",
                column: "Difficulty");

            migrationBuilder.CreateIndex(
                name: "IX_CodingProblems_IsClientVisible",
                table: "CodingProblems",
                column: "IsClientVisible");

            migrationBuilder.CreateIndex(
                name: "IX_CodingProblems_Status",
                table: "CodingProblems",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CodingReports_CandidateReportId",
                table: "CodingReports",
                column: "CandidateReportId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HrInterviewAnswers_SessionId",
                table: "HrInterviewAnswers",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_HrInterviewDrafts_SessionId",
                table: "HrInterviewDrafts",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_HrInterviewEvaluations_SessionId",
                table: "HrInterviewEvaluations",
                column: "SessionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HrInterviewImprovements_EvaluationId",
                table: "HrInterviewImprovements",
                column: "EvaluationId");

            migrationBuilder.CreateIndex(
                name: "IX_HrInterviewQuestionEvaluations_InterviewAnswerId",
                table: "HrInterviewQuestionEvaluations",
                column: "InterviewAnswerId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HrInterviewQuestions_SessionId",
                table: "HrInterviewQuestions",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_HrInterviewRecommendedPractices_EvaluationId",
                table: "HrInterviewRecommendedPractices",
                column: "EvaluationId");

            migrationBuilder.CreateIndex(
                name: "IX_HrInterviewStrengths_EvaluationId",
                table: "HrInterviewStrengths",
                column: "EvaluationId");

            migrationBuilder.CreateIndex(
                name: "IX_HRReports_CandidateReportId",
                table: "HRReports",
                column: "CandidateReportId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InterviewImprovements_ResultId",
                table: "InterviewImprovements",
                column: "ResultId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewQuestions_SessionId",
                table: "InterviewQuestions",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewStarAnalyses_ResultId",
                table: "InterviewStarAnalyses",
                column: "ResultId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewStrengths_ResultId",
                table: "InterviewStrengths",
                column: "ResultId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentOrders_UserId",
                table: "PaymentOrders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeAttemptQuestions_AttemptId",
                table: "PracticeAttemptQuestions",
                column: "AttemptId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeAttemptQuestions_Category",
                table: "PracticeAttemptQuestions",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeAttempts_CreatedAt",
                table: "PracticeAttempts",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeAttempts_Score",
                table: "PracticeAttempts",
                column: "Score");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeAttempts_SessionId",
                table: "PracticeAttempts",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSessions_CreatedAt",
                table: "PracticeSessions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSessions_SkillType",
                table: "PracticeSessions",
                column: "SkillType");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSessions_UserId",
                table: "PracticeSessions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSessions_UserId_SkillType",
                table: "PracticeSessions",
                columns: new[] { "UserId", "SkillType" });

            migrationBuilder.CreateIndex(
                name: "IX_Questions_Category",
                table: "Questions",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_CreatedAt",
                table: "Questions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_IsClientVisible",
                table: "Questions",
                column: "IsClientVisible");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_Status",
                table: "Questions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TechnicalInterviewQuestions_SessionId",
                table: "TechnicalInterviewQuestions",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_TechnicalInterviewSessions_UserId",
                table: "TechnicalInterviewSessions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TechnicalReports_CandidateReportId",
                table: "TechnicalReports",
                column: "CandidateReportId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserCodingProblemProgresses_CodingProblemId",
                table: "UserCodingProblemProgresses",
                column: "CodingProblemId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCodingProblemProgresses_UserId_CodingProblemId",
                table: "UserCodingProblemProgresses",
                columns: new[] { "UserId", "CodingProblemId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserQuestionPracticeHistories_QuestionId",
                table: "UserQuestionPracticeHistories",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_UserQuestionPracticeHistories_UserId_QuestionId",
                table: "UserQuestionPracticeHistories",
                columns: new[] { "UserId", "QuestionId" });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AiRequestLogs");

            migrationBuilder.DropTable(
                name: "CodingAssessmentHistories");

            migrationBuilder.DropTable(
                name: "CodingInterviewStageLogs");

            migrationBuilder.DropTable(
                name: "CodingPracticeAttempts");

            migrationBuilder.DropTable(
                name: "CodingReports");

            migrationBuilder.DropTable(
                name: "FullMockSessions");

            migrationBuilder.DropTable(
                name: "HrInterviewDrafts");

            migrationBuilder.DropTable(
                name: "HrInterviewImprovements");

            migrationBuilder.DropTable(
                name: "HrInterviewQuestionEvaluations");

            migrationBuilder.DropTable(
                name: "HrInterviewQuestions");

            migrationBuilder.DropTable(
                name: "HrInterviewRecommendedPractices");

            migrationBuilder.DropTable(
                name: "HrInterviewStrengths");

            migrationBuilder.DropTable(
                name: "HrQuestionBanks");

            migrationBuilder.DropTable(
                name: "HRReports");

            migrationBuilder.DropTable(
                name: "InterviewAnalysisJobs");

            migrationBuilder.DropTable(
                name: "InterviewImprovements");

            migrationBuilder.DropTable(
                name: "InterviewQuestions");

            migrationBuilder.DropTable(
                name: "InterviewStarAnalyses");

            migrationBuilder.DropTable(
                name: "InterviewStrengths");

            migrationBuilder.DropTable(
                name: "PaymentOrders");

            migrationBuilder.DropTable(
                name: "PracticeAttemptQuestions");

            migrationBuilder.DropTable(
                name: "TechnicalInterviewQuestions");

            migrationBuilder.DropTable(
                name: "TechnicalReports");

            migrationBuilder.DropTable(
                name: "UserCodingProblemProgresses");

            migrationBuilder.DropTable(
                name: "UserQuestionPracticeHistories");

            migrationBuilder.DropTable(
                name: "CodingInterviewProblems");

            migrationBuilder.DropTable(
                name: "HrInterviewAnswers");

            migrationBuilder.DropTable(
                name: "HrInterviewEvaluations");

            migrationBuilder.DropTable(
                name: "InterviewSessions");

            migrationBuilder.DropTable(
                name: "InterviewAnalysisResults");

            migrationBuilder.DropTable(
                name: "PracticeAttempts");

            migrationBuilder.DropTable(
                name: "TechnicalInterviewSessions");

            migrationBuilder.DropTable(
                name: "CandidateReports");

            migrationBuilder.DropTable(
                name: "CodingProblems");

            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "CodingInterviewSessions");

            migrationBuilder.DropTable(
                name: "HrInterviewSessions");

            migrationBuilder.DropTable(
                name: "PracticeSessions");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
