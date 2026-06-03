using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class AddHrInterviewFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AiRequestLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Feature = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RequestType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ResponseTimeMs = table.Column<long>(type: "bigint", nullable: false),
                    TokensUsed = table.Column<int>(type: "int", nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiRequestLogs", x => x.Id);
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
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HrInterviewSessions", x => x.Id);
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
                    CommunicationScore = table.Column<double>(type: "float", nullable: false),
                    ClarityScore = table.Column<double>(type: "float", nullable: false),
                    StarScore = table.Column<double>(type: "float", nullable: false),
                    ProfessionalMindsetScore = table.Column<double>(type: "float", nullable: false),
                    RelevanceScore = table.Column<double>(type: "float", nullable: false),
                    QuestionScore = table.Column<double>(type: "float", nullable: false),
                    Level = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Feedback = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StrengthsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WeaknessesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImprovementSuggestionsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                name: "HrInterviewFinalResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    HrFinalScore = table.Column<double>(type: "float", nullable: false),
                    Level = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OverallStrengthsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OverallWeaknessesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImprovementRoadmapJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReadinessLevel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HrInterviewFinalResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HrInterviewFinalResults_HrInterviewSessions_SessionId",
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
                    QuestionGuid = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QuestionIndex = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QuestionText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpectedAnswerGuide = table.Column<string>(type: "nvarchar(max)", nullable: false),
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

            migrationBuilder.CreateIndex(
                name: "IX_HrInterviewAnswers_SessionId",
                table: "HrInterviewAnswers",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_HrInterviewFinalResults_SessionId",
                table: "HrInterviewFinalResults",
                column: "SessionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HrInterviewQuestions_SessionId",
                table: "HrInterviewQuestions",
                column: "SessionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AiRequestLogs");

            migrationBuilder.DropTable(
                name: "HrInterviewAnswers");

            migrationBuilder.DropTable(
                name: "HrInterviewFinalResults");

            migrationBuilder.DropTable(
                name: "HrInterviewQuestions");

            migrationBuilder.DropTable(
                name: "HrInterviewSessions");
        }
    }
}
