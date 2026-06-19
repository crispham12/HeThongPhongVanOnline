using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRecommendedLevelColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CodingProblemProgresses");

            migrationBuilder.RenameColumn(
                name: "Role",
                table: "CodingProblems",
                newName: "RecommendedLevel");

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

            migrationBuilder.CreateIndex(
                name: "IX_CodingAssessmentHistories_CodingProblemId",
                table: "CodingAssessmentHistories",
                column: "CodingProblemId");

            migrationBuilder.CreateIndex(
                name: "IX_CodingAssessmentHistories_UserId_InterviewSessionId",
                table: "CodingAssessmentHistories",
                columns: new[] { "UserId", "InterviewSessionId" });

            migrationBuilder.CreateIndex(
                name: "IX_UserCodingProblemProgresses_CodingProblemId",
                table: "UserCodingProblemProgresses",
                column: "CodingProblemId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCodingProblemProgresses_UserId_CodingProblemId",
                table: "UserCodingProblemProgresses",
                columns: new[] { "UserId", "CodingProblemId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CodingAssessmentHistories");

            migrationBuilder.DropTable(
                name: "UserCodingProblemProgresses");

            migrationBuilder.RenameColumn(
                name: "RecommendedLevel",
                table: "CodingProblems",
                newName: "Role");

            migrationBuilder.CreateTable(
                name: "CodingProblemProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CodingProblemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AttemptCount = table.Column<int>(type: "int", nullable: false),
                    BestScore = table.Column<float>(type: "real", nullable: true),
                    IsSolved = table.Column<bool>(type: "bit", nullable: false),
                    LastAttemptAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LatestScore = table.Column<float>(type: "real", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false)
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
                name: "IX_CodingProblemProgresses_CodingProblemId",
                table: "CodingProblemProgresses",
                column: "CodingProblemId");

            migrationBuilder.CreateIndex(
                name: "IX_CodingProblemProgresses_UserId_CodingProblemId",
                table: "CodingProblemProgresses",
                columns: new[] { "UserId", "CodingProblemId" },
                unique: true);
        }
    }
}
