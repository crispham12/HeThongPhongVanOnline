using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class AddQuestionBankFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CodingProblems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ShortDescription = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TagsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InputFormat = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OutputFormat = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConstraintsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExamplesJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TestCasesJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StarterCodeJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SolutionJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AllowRandomSelection = table.Column<bool>(type: "bit", nullable: false),
                    IsClientVisible = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByAdminId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodingProblems", x => x.Id);
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
                name: "UserCodingPracticeHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CodingProblemId = table.Column<int>(type: "int", nullable: false),
                    Language = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SubmittedCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PassedTestCases = table.Column<int>(type: "int", nullable: false),
                    TotalTestCases = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AiScore = table.Column<float>(type: "real", nullable: true),
                    AiFeedback = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TimeComplexity = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SpaceComplexity = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCodingPracticeHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCodingPracticeHistories_CodingProblems_CodingProblemId",
                        column: x => x.CodingProblemId,
                        principalTable: "CodingProblems",
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
                name: "IX_Questions_Category",
                table: "Questions",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_IsClientVisible",
                table: "Questions",
                column: "IsClientVisible");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_Status",
                table: "Questions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_UserCodingPracticeHistories_CodingProblemId",
                table: "UserCodingPracticeHistories",
                column: "CodingProblemId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCodingPracticeHistories_UserId_CodingProblemId",
                table: "UserCodingPracticeHistories",
                columns: new[] { "UserId", "CodingProblemId" });

            migrationBuilder.CreateIndex(
                name: "IX_UserQuestionPracticeHistories_QuestionId",
                table: "UserQuestionPracticeHistories",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_UserQuestionPracticeHistories_UserId_QuestionId",
                table: "UserQuestionPracticeHistories",
                columns: new[] { "UserId", "QuestionId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserCodingPracticeHistories");

            migrationBuilder.DropTable(
                name: "UserQuestionPracticeHistories");

            migrationBuilder.DropTable(
                name: "CodingProblems");

            migrationBuilder.DropTable(
                name: "Questions");
        }
    }
}
