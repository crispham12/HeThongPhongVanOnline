using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateHrInterviewQuestionProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HrInterviewFinalResults");

            migrationBuilder.DropColumn(
                name: "ClarityScore",
                table: "HrInterviewAnswers");

            migrationBuilder.DropColumn(
                name: "CommunicationScore",
                table: "HrInterviewAnswers");

            migrationBuilder.DropColumn(
                name: "Feedback",
                table: "HrInterviewAnswers");

            migrationBuilder.DropColumn(
                name: "ImprovementSuggestionsJson",
                table: "HrInterviewAnswers");

            migrationBuilder.DropColumn(
                name: "Level",
                table: "HrInterviewAnswers");

            migrationBuilder.DropColumn(
                name: "ProfessionalMindsetScore",
                table: "HrInterviewAnswers");

            migrationBuilder.DropColumn(
                name: "QuestionScore",
                table: "HrInterviewAnswers");

            migrationBuilder.DropColumn(
                name: "RelevanceScore",
                table: "HrInterviewAnswers");

            migrationBuilder.DropColumn(
                name: "StarScore",
                table: "HrInterviewAnswers");

            migrationBuilder.DropColumn(
                name: "StrengthsJson",
                table: "HrInterviewAnswers");

            migrationBuilder.RenameColumn(
                name: "WeaknessesJson",
                table: "HrInterviewAnswers",
                newName: "Transcript");

            migrationBuilder.AddColumn<string>(
                name: "Difficulty",
                table: "HrInterviewQuestions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "MaxAnswerTime",
                table: "HrInterviewQuestions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "SuggestedMethod",
                table: "HrInterviewQuestions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "DurationSeconds",
                table: "HrInterviewAnswers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FillerWords",
                table: "HrInterviewAnswers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubmittedAt",
                table: "HrInterviewAnswers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "WordCount",
                table: "HrInterviewAnswers",
                type: "int",
                nullable: false,
                defaultValue: 0);

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
                    HrFinalScore = table.Column<double>(type: "float", nullable: false),
                    CommunicationScore = table.Column<double>(type: "float", nullable: false),
                    StarScore = table.Column<double>(type: "float", nullable: false),
                    ConfidenceScore = table.Column<double>(type: "float", nullable: false),
                    ProfessionalismScore = table.Column<double>(type: "float", nullable: false),
                    GrowthMindsetScore = table.Column<double>(type: "float", nullable: false),
                    CultureFitScore = table.Column<double>(type: "float", nullable: false),
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
                    table.PrimaryKey("PK_HrInterviewEvaluations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HrInterviewEvaluations_HrInterviewSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "HrInterviewSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HrInterviewQuestionEvaluations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AnswerId = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<double>(type: "float", nullable: false),
                    Strength = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Weakness = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MissingStar = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SuggestedAnswer = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HrInterviewQuestionEvaluations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HrInterviewQuestionEvaluations_HrInterviewAnswers_AnswerId",
                        column: x => x.AnswerId,
                        principalTable: "HrInterviewAnswers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 136, DateTimeKind.Utc).AddTicks(7865));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 136, DateTimeKind.Utc).AddTicks(7869));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 136, DateTimeKind.Utc).AddTicks(7871));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(7065));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(7081));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(7083));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000004"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(7085));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000005"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(7118));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000006"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(7120));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000007"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(7122));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000008"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(7123));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000009"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(7125));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000010"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(7128));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000011"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(7130));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000012"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(7132));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000013"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(7133));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000014"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(7135));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(2979));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(2990));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(2992));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(2993));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(2995));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(3005));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000007"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(3007));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000008"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(3008));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000009"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(3010));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000010"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(3011));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(3013));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 14, 56, 25, 141, DateTimeKind.Utc).AddTicks(3014));

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
                name: "IX_HrInterviewQuestionEvaluations_AnswerId",
                table: "HrInterviewQuestionEvaluations",
                column: "AnswerId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HrInterviewDrafts");

            migrationBuilder.DropTable(
                name: "HrInterviewEvaluations");

            migrationBuilder.DropTable(
                name: "HrInterviewQuestionEvaluations");

            migrationBuilder.DropColumn(
                name: "Difficulty",
                table: "HrInterviewQuestions");

            migrationBuilder.DropColumn(
                name: "MaxAnswerTime",
                table: "HrInterviewQuestions");

            migrationBuilder.DropColumn(
                name: "SuggestedMethod",
                table: "HrInterviewQuestions");

            migrationBuilder.DropColumn(
                name: "DurationSeconds",
                table: "HrInterviewAnswers");

            migrationBuilder.DropColumn(
                name: "FillerWords",
                table: "HrInterviewAnswers");

            migrationBuilder.DropColumn(
                name: "SubmittedAt",
                table: "HrInterviewAnswers");

            migrationBuilder.DropColumn(
                name: "WordCount",
                table: "HrInterviewAnswers");

            migrationBuilder.RenameColumn(
                name: "Transcript",
                table: "HrInterviewAnswers",
                newName: "WeaknessesJson");

            migrationBuilder.AddColumn<double>(
                name: "ClarityScore",
                table: "HrInterviewAnswers",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "CommunicationScore",
                table: "HrInterviewAnswers",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "Feedback",
                table: "HrInterviewAnswers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImprovementSuggestionsJson",
                table: "HrInterviewAnswers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Level",
                table: "HrInterviewAnswers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "ProfessionalMindsetScore",
                table: "HrInterviewAnswers",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "QuestionScore",
                table: "HrInterviewAnswers",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "RelevanceScore",
                table: "HrInterviewAnswers",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "StarScore",
                table: "HrInterviewAnswers",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "StrengthsJson",
                table: "HrInterviewAnswers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "HrInterviewFinalResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    HrFinalScore = table.Column<double>(type: "float", nullable: false),
                    ImprovementRoadmapJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Level = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OverallStrengthsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OverallWeaknessesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReadinessLevel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(max)", nullable: false)
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

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 415, DateTimeKind.Utc).AddTicks(3041));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 415, DateTimeKind.Utc).AddTicks(3048));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 415, DateTimeKind.Utc).AddTicks(3053));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6401));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6414));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6420));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000004"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6425));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000005"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6440));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000006"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6507));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000007"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6511));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000008"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6515));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000009"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6518));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000010"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6523));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000011"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6527));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000012"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6531));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000013"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6539));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000014"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6542));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 424, DateTimeKind.Utc).AddTicks(5649));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 424, DateTimeKind.Utc).AddTicks(5670));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 424, DateTimeKind.Utc).AddTicks(5676));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 424, DateTimeKind.Utc).AddTicks(5682));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 424, DateTimeKind.Utc).AddTicks(5687));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 424, DateTimeKind.Utc).AddTicks(5692));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000007"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 424, DateTimeKind.Utc).AddTicks(5696));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000008"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 424, DateTimeKind.Utc).AddTicks(5702));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000009"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 424, DateTimeKind.Utc).AddTicks(5711));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000010"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 424, DateTimeKind.Utc).AddTicks(5715));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 424, DateTimeKind.Utc).AddTicks(5720));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 9, 27, 22, 424, DateTimeKind.Utc).AddTicks(5724));

            migrationBuilder.CreateIndex(
                name: "IX_HrInterviewFinalResults_SessionId",
                table: "HrInterviewFinalResults",
                column: "SessionId",
                unique: true);
        }
    }
}
