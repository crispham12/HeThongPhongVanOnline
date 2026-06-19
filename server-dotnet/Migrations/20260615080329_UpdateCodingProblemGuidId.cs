using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCodingProblemGuidId : Migration
    {
        /// <inheritdoc />
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop foreign keys, indices, and tables to recreate them with Guid primary key
            migrationBuilder.DropForeignKey(
                name: "FK_UserCodingPracticeHistories_CodingProblems_CodingProblemId",
                table: "UserCodingPracticeHistories");

            migrationBuilder.DropTable(name: "UserCodingPracticeHistories");
            migrationBuilder.DropTable(name: "CodingProblems");

            // Recreate CodingProblems with Guid PK
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
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    CreatedByAdminId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByAdminName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodingProblems", x => x.Id);
                });

            // Recreate UserCodingPracticeHistories referencing Guid CodingProblemId
            migrationBuilder.CreateTable(
                name: "UserCodingPracticeHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CodingProblemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
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

            // Recreate indices
            migrationBuilder.CreateIndex(
                name: "IX_CodingProblems_Status",
                table: "CodingProblems",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CodingProblems_Difficulty",
                table: "CodingProblems",
                column: "Difficulty");

            migrationBuilder.CreateIndex(
                name: "IX_CodingProblems_IsClientVisible",
                table: "CodingProblems",
                column: "IsClientVisible");

            migrationBuilder.CreateIndex(
                name: "IX_UserCodingPracticeHistories_UserId_CodingProblemId",
                table: "UserCodingPracticeHistories",
                columns: new[] { "UserId", "CodingProblemId" });

            migrationBuilder.CreateIndex(
                name: "IX_UserCodingPracticeHistories_CodingProblemId",
                table: "UserCodingPracticeHistories",
                column: "CodingProblemId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "UserCodingPracticeHistories");
            migrationBuilder.DropTable(name: "CodingProblems");
        }
    }
}
