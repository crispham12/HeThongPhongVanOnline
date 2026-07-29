using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCandidateReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.CreateIndex(
                name: "IX_CandidateReports_UserId",
                table: "CandidateReports",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CodingReports_CandidateReportId",
                table: "CodingReports",
                column: "CandidateReportId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HRReports_CandidateReportId",
                table: "HRReports",
                column: "CandidateReportId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TechnicalReports_CandidateReportId",
                table: "TechnicalReports",
                column: "CandidateReportId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CodingReports");

            migrationBuilder.DropTable(
                name: "HRReports");

            migrationBuilder.DropTable(
                name: "TechnicalReports");

            migrationBuilder.DropTable(
                name: "CandidateReports");
        }
    }
}
