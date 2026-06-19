using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class RedesignCodingPractice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserCodingPracticeHistories");

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
                name: "CodingProblemProgresses",
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
                    table.PrimaryKey("PK_CodingProblemProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodingProblemProgresses_CodingProblems_CodingProblemId",
                        column: x => x.CodingProblemId,
                        principalTable: "CodingProblems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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
                name: "IX_CodingProblemProgresses_CodingProblemId",
                table: "CodingProblemProgresses",
                column: "CodingProblemId");

            migrationBuilder.CreateIndex(
                name: "IX_CodingProblemProgresses_UserId_CodingProblemId",
                table: "CodingProblemProgresses",
                columns: new[] { "UserId", "CodingProblemId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CodingPracticeAttempts");

            migrationBuilder.DropTable(
                name: "CodingProblemProgresses");

            migrationBuilder.CreateTable(
                name: "UserCodingPracticeHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CodingProblemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AiFeedback = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AiScore = table.Column<float>(type: "real", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Language = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PassedTestCases = table.Column<int>(type: "int", nullable: false),
                    SpaceComplexity = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SubmittedCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TimeComplexity = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalTestCases = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false)
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

            migrationBuilder.CreateIndex(
                name: "IX_UserCodingPracticeHistories_CodingProblemId",
                table: "UserCodingPracticeHistories",
                column: "CodingProblemId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCodingPracticeHistories_UserId_CodingProblemId",
                table: "UserCodingPracticeHistories",
                columns: new[] { "UserId", "CodingProblemId" });
        }
    }
}
