using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCodingInterview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CodingInterviewStageLogs");

            migrationBuilder.DropTable(
                name: "CodingInterviewProblems");

            migrationBuilder.DropTable(
                name: "CodingInterviewSessions");
        }
    }
}
