using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateHrEvaluationSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HrInterviewQuestionEvaluations_HrInterviewAnswers_AnswerId",
                table: "HrInterviewQuestionEvaluations");

            migrationBuilder.RenameColumn(
                name: "Weakness",
                table: "HrInterviewQuestionEvaluations",
                newName: "Weaknesses");

            migrationBuilder.RenameColumn(
                name: "SuggestedAnswer",
                table: "HrInterviewQuestionEvaluations",
                newName: "TaskStatus");

            migrationBuilder.RenameColumn(
                name: "Strength",
                table: "HrInterviewQuestionEvaluations",
                newName: "TaskFeedback");

            migrationBuilder.RenameColumn(
                name: "Score",
                table: "HrInterviewQuestionEvaluations",
                newName: "TaskScore");

            migrationBuilder.RenameColumn(
                name: "MissingStar",
                table: "HrInterviewQuestionEvaluations",
                newName: "Suggestions");

            migrationBuilder.RenameColumn(
                name: "AnswerId",
                table: "HrInterviewQuestionEvaluations",
                newName: "InterviewAnswerId");

            migrationBuilder.RenameIndex(
                name: "IX_HrInterviewQuestionEvaluations_AnswerId",
                table: "HrInterviewQuestionEvaluations",
                newName: "IX_HrInterviewQuestionEvaluations_InterviewAnswerId");

            migrationBuilder.RenameColumn(
                name: "Summary",
                table: "HrInterviewEvaluations",
                newName: "WeaknessSummary");

            migrationBuilder.RenameColumn(
                name: "StarScore",
                table: "HrInterviewEvaluations",
                newName: "StarStructureScore");

            migrationBuilder.RenameColumn(
                name: "ReadinessLevel",
                table: "HrInterviewEvaluations",
                newName: "StrengthSummary");

            migrationBuilder.RenameColumn(
                name: "OverallWeaknessesJson",
                table: "HrInterviewEvaluations",
                newName: "PromptVersion");

            migrationBuilder.RenameColumn(
                name: "OverallStrengthsJson",
                table: "HrInterviewEvaluations",
                newName: "OverallStatus");

            migrationBuilder.RenameColumn(
                name: "Level",
                table: "HrInterviewEvaluations",
                newName: "OverallObservation");

            migrationBuilder.RenameColumn(
                name: "ImprovementRoadmapJson",
                table: "HrInterviewEvaluations",
                newName: "HiringRecommendation");

            migrationBuilder.RenameColumn(
                name: "HrFinalScore",
                table: "HrInterviewEvaluations",
                newName: "OverallScore");

            migrationBuilder.RenameColumn(
                name: "GrowthMindsetScore",
                table: "HrInterviewEvaluations",
                newName: "LogicScore");

            migrationBuilder.RenameColumn(
                name: "CultureFitScore",
                table: "HrInterviewEvaluations",
                newName: "CompletenessScore");

            migrationBuilder.AddColumn<string>(
                name: "ActionFeedback",
                table: "HrInterviewQuestionEvaluations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "ActionScore",
                table: "HrInterviewQuestionEvaluations",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "ActionStatus",
                table: "HrInterviewQuestionEvaluations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "CommunicationScore",
                table: "HrInterviewQuestionEvaluations",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "ConfidenceScore",
                table: "HrInterviewQuestionEvaluations",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "HrInterviewQuestionEvaluations",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<double>(
                name: "QuestionScore",
                table: "HrInterviewQuestionEvaluations",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "ResultFeedback",
                table: "HrInterviewQuestionEvaluations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "ResultScore",
                table: "HrInterviewQuestionEvaluations",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "ResultStatus",
                table: "HrInterviewQuestionEvaluations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SituationFeedback",
                table: "HrInterviewQuestionEvaluations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "SituationScore",
                table: "HrInterviewQuestionEvaluations",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "SituationStatus",
                table: "HrInterviewQuestionEvaluations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "StarScore",
                table: "HrInterviewQuestionEvaluations",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "Strengths",
                table: "HrInterviewQuestionEvaluations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "ClarityScore",
                table: "HrInterviewEvaluations",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "EvaluationModel",
                table: "HrInterviewEvaluations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "HiringReadiness",
                table: "HrInterviewEvaluations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "EvaluationTime",
                table: "AiRequestLogs",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "PromptVersion",
                table: "AiRequestLogs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "Temperature",
                table: "AiRequestLogs",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

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

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 300, DateTimeKind.Utc).AddTicks(8599));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 300, DateTimeKind.Utc).AddTicks(8606));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 300, DateTimeKind.Utc).AddTicks(8611));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 329, DateTimeKind.Utc).AddTicks(6762));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 329, DateTimeKind.Utc).AddTicks(6781));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 329, DateTimeKind.Utc).AddTicks(6784));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000004"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 329, DateTimeKind.Utc).AddTicks(6787));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000005"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 329, DateTimeKind.Utc).AddTicks(6789));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000006"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 329, DateTimeKind.Utc).AddTicks(6791));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000007"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 329, DateTimeKind.Utc).AddTicks(6793));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000008"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 329, DateTimeKind.Utc).AddTicks(6795));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000009"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 329, DateTimeKind.Utc).AddTicks(6796));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000010"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 329, DateTimeKind.Utc).AddTicks(6800));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000011"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 329, DateTimeKind.Utc).AddTicks(6802));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000012"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 329, DateTimeKind.Utc).AddTicks(6804));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000013"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 329, DateTimeKind.Utc).AddTicks(6806));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000014"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 329, DateTimeKind.Utc).AddTicks(6808));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 328, DateTimeKind.Utc).AddTicks(9521));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 328, DateTimeKind.Utc).AddTicks(9536));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 328, DateTimeKind.Utc).AddTicks(9539));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 328, DateTimeKind.Utc).AddTicks(9541));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 328, DateTimeKind.Utc).AddTicks(9544));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 328, DateTimeKind.Utc).AddTicks(9558));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000007"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 328, DateTimeKind.Utc).AddTicks(9560));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000008"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 328, DateTimeKind.Utc).AddTicks(9563));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000009"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 328, DateTimeKind.Utc).AddTicks(9565));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000010"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 328, DateTimeKind.Utc).AddTicks(9567));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 328, DateTimeKind.Utc).AddTicks(9569));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 14, 58, 4, 328, DateTimeKind.Utc).AddTicks(9571));

            migrationBuilder.CreateIndex(
                name: "IX_HrInterviewImprovements_EvaluationId",
                table: "HrInterviewImprovements",
                column: "EvaluationId");

            migrationBuilder.CreateIndex(
                name: "IX_HrInterviewRecommendedPractices_EvaluationId",
                table: "HrInterviewRecommendedPractices",
                column: "EvaluationId");

            migrationBuilder.CreateIndex(
                name: "IX_HrInterviewStrengths_EvaluationId",
                table: "HrInterviewStrengths",
                column: "EvaluationId");

            migrationBuilder.AddForeignKey(
                name: "FK_HrInterviewQuestionEvaluations_HrInterviewAnswers_InterviewAnswerId",
                table: "HrInterviewQuestionEvaluations",
                column: "InterviewAnswerId",
                principalTable: "HrInterviewAnswers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HrInterviewQuestionEvaluations_HrInterviewAnswers_InterviewAnswerId",
                table: "HrInterviewQuestionEvaluations");

            migrationBuilder.DropTable(
                name: "HrInterviewImprovements");

            migrationBuilder.DropTable(
                name: "HrInterviewRecommendedPractices");

            migrationBuilder.DropTable(
                name: "HrInterviewStrengths");

            migrationBuilder.DropColumn(
                name: "ActionFeedback",
                table: "HrInterviewQuestionEvaluations");

            migrationBuilder.DropColumn(
                name: "ActionScore",
                table: "HrInterviewQuestionEvaluations");

            migrationBuilder.DropColumn(
                name: "ActionStatus",
                table: "HrInterviewQuestionEvaluations");

            migrationBuilder.DropColumn(
                name: "CommunicationScore",
                table: "HrInterviewQuestionEvaluations");

            migrationBuilder.DropColumn(
                name: "ConfidenceScore",
                table: "HrInterviewQuestionEvaluations");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "HrInterviewQuestionEvaluations");

            migrationBuilder.DropColumn(
                name: "QuestionScore",
                table: "HrInterviewQuestionEvaluations");

            migrationBuilder.DropColumn(
                name: "ResultFeedback",
                table: "HrInterviewQuestionEvaluations");

            migrationBuilder.DropColumn(
                name: "ResultScore",
                table: "HrInterviewQuestionEvaluations");

            migrationBuilder.DropColumn(
                name: "ResultStatus",
                table: "HrInterviewQuestionEvaluations");

            migrationBuilder.DropColumn(
                name: "SituationFeedback",
                table: "HrInterviewQuestionEvaluations");

            migrationBuilder.DropColumn(
                name: "SituationScore",
                table: "HrInterviewQuestionEvaluations");

            migrationBuilder.DropColumn(
                name: "SituationStatus",
                table: "HrInterviewQuestionEvaluations");

            migrationBuilder.DropColumn(
                name: "StarScore",
                table: "HrInterviewQuestionEvaluations");

            migrationBuilder.DropColumn(
                name: "Strengths",
                table: "HrInterviewQuestionEvaluations");

            migrationBuilder.DropColumn(
                name: "ClarityScore",
                table: "HrInterviewEvaluations");

            migrationBuilder.DropColumn(
                name: "EvaluationModel",
                table: "HrInterviewEvaluations");

            migrationBuilder.DropColumn(
                name: "HiringReadiness",
                table: "HrInterviewEvaluations");

            migrationBuilder.DropColumn(
                name: "EvaluationTime",
                table: "AiRequestLogs");

            migrationBuilder.DropColumn(
                name: "PromptVersion",
                table: "AiRequestLogs");

            migrationBuilder.DropColumn(
                name: "Temperature",
                table: "AiRequestLogs");

            migrationBuilder.RenameColumn(
                name: "Weaknesses",
                table: "HrInterviewQuestionEvaluations",
                newName: "Weakness");

            migrationBuilder.RenameColumn(
                name: "TaskStatus",
                table: "HrInterviewQuestionEvaluations",
                newName: "SuggestedAnswer");

            migrationBuilder.RenameColumn(
                name: "TaskScore",
                table: "HrInterviewQuestionEvaluations",
                newName: "Score");

            migrationBuilder.RenameColumn(
                name: "TaskFeedback",
                table: "HrInterviewQuestionEvaluations",
                newName: "Strength");

            migrationBuilder.RenameColumn(
                name: "Suggestions",
                table: "HrInterviewQuestionEvaluations",
                newName: "MissingStar");

            migrationBuilder.RenameColumn(
                name: "InterviewAnswerId",
                table: "HrInterviewQuestionEvaluations",
                newName: "AnswerId");

            migrationBuilder.RenameIndex(
                name: "IX_HrInterviewQuestionEvaluations_InterviewAnswerId",
                table: "HrInterviewQuestionEvaluations",
                newName: "IX_HrInterviewQuestionEvaluations_AnswerId");

            migrationBuilder.RenameColumn(
                name: "WeaknessSummary",
                table: "HrInterviewEvaluations",
                newName: "Summary");

            migrationBuilder.RenameColumn(
                name: "StrengthSummary",
                table: "HrInterviewEvaluations",
                newName: "ReadinessLevel");

            migrationBuilder.RenameColumn(
                name: "StarStructureScore",
                table: "HrInterviewEvaluations",
                newName: "StarScore");

            migrationBuilder.RenameColumn(
                name: "PromptVersion",
                table: "HrInterviewEvaluations",
                newName: "OverallWeaknessesJson");

            migrationBuilder.RenameColumn(
                name: "OverallStatus",
                table: "HrInterviewEvaluations",
                newName: "OverallStrengthsJson");

            migrationBuilder.RenameColumn(
                name: "OverallScore",
                table: "HrInterviewEvaluations",
                newName: "HrFinalScore");

            migrationBuilder.RenameColumn(
                name: "OverallObservation",
                table: "HrInterviewEvaluations",
                newName: "Level");

            migrationBuilder.RenameColumn(
                name: "LogicScore",
                table: "HrInterviewEvaluations",
                newName: "GrowthMindsetScore");

            migrationBuilder.RenameColumn(
                name: "HiringRecommendation",
                table: "HrInterviewEvaluations",
                newName: "ImprovementRoadmapJson");

            migrationBuilder.RenameColumn(
                name: "CompletenessScore",
                table: "HrInterviewEvaluations",
                newName: "CultureFitScore");

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 264, DateTimeKind.Utc).AddTicks(4301));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 264, DateTimeKind.Utc).AddTicks(4305));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 264, DateTimeKind.Utc).AddTicks(4308));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 270, DateTimeKind.Utc).AddTicks(681));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 270, DateTimeKind.Utc).AddTicks(694));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 270, DateTimeKind.Utc).AddTicks(696));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000004"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 270, DateTimeKind.Utc).AddTicks(698));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000005"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 270, DateTimeKind.Utc).AddTicks(700));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000006"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 270, DateTimeKind.Utc).AddTicks(702));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000007"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 270, DateTimeKind.Utc).AddTicks(704));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000008"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 270, DateTimeKind.Utc).AddTicks(705));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000009"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 270, DateTimeKind.Utc).AddTicks(707));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000010"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 270, DateTimeKind.Utc).AddTicks(710));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000011"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 270, DateTimeKind.Utc).AddTicks(712));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000012"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 270, DateTimeKind.Utc).AddTicks(713));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000013"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 270, DateTimeKind.Utc).AddTicks(714));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000014"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 270, DateTimeKind.Utc).AddTicks(716));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 269, DateTimeKind.Utc).AddTicks(6413));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 269, DateTimeKind.Utc).AddTicks(6421));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 269, DateTimeKind.Utc).AddTicks(6423));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 269, DateTimeKind.Utc).AddTicks(6425));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 269, DateTimeKind.Utc).AddTicks(6427));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 269, DateTimeKind.Utc).AddTicks(6443));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000007"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 269, DateTimeKind.Utc).AddTicks(6445));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000008"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 269, DateTimeKind.Utc).AddTicks(6447));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000009"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 269, DateTimeKind.Utc).AddTicks(6448));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000010"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 269, DateTimeKind.Utc).AddTicks(6450));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 269, DateTimeKind.Utc).AddTicks(6452));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 16, 48, 15, 269, DateTimeKind.Utc).AddTicks(6453));

            migrationBuilder.AddForeignKey(
                name: "FK_HrInterviewQuestionEvaluations_HrInterviewAnswers_AnswerId",
                table: "HrInterviewQuestionEvaluations",
                column: "AnswerId",
                principalTable: "HrInterviewAnswers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
