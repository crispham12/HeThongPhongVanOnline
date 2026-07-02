using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAnalysisResultEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FinalFeedback",
                table: "InterviewAnalysisResults");

            migrationBuilder.RenameColumn(
                name: "Weaknesses",
                table: "InterviewAnalysisResults",
                newName: "TopPercentile");

            migrationBuilder.RenameColumn(
                name: "TranscriptAnalysis",
                table: "InterviewAnalysisResults",
                newName: "SummaryText");

            migrationBuilder.RenameColumn(
                name: "Strengths",
                table: "InterviewAnalysisResults",
                newName: "OverallStatus");

            migrationBuilder.RenameColumn(
                name: "ImprovementSuggestions",
                table: "InterviewAnalysisResults",
                newName: "HiringReadiness");

            migrationBuilder.AddColumn<double>(
                name: "ClarityScore",
                table: "InterviewAnalysisResults",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "CompletenessScore",
                table: "InterviewAnalysisResults",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "InterviewAnalysisResults",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<double>(
                name: "LogicScore",
                table: "InterviewAnalysisResults",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

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

            migrationBuilder.CreateIndex(
                name: "IX_InterviewImprovements_ResultId",
                table: "InterviewImprovements",
                column: "ResultId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewStarAnalyses_ResultId",
                table: "InterviewStarAnalyses",
                column: "ResultId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewStrengths_ResultId",
                table: "InterviewStrengths",
                column: "ResultId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InterviewImprovements");

            migrationBuilder.DropTable(
                name: "InterviewStarAnalyses");

            migrationBuilder.DropTable(
                name: "InterviewStrengths");

            migrationBuilder.DropColumn(
                name: "ClarityScore",
                table: "InterviewAnalysisResults");

            migrationBuilder.DropColumn(
                name: "CompletenessScore",
                table: "InterviewAnalysisResults");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "InterviewAnalysisResults");

            migrationBuilder.DropColumn(
                name: "LogicScore",
                table: "InterviewAnalysisResults");

            migrationBuilder.RenameColumn(
                name: "TopPercentile",
                table: "InterviewAnalysisResults",
                newName: "Weaknesses");

            migrationBuilder.RenameColumn(
                name: "SummaryText",
                table: "InterviewAnalysisResults",
                newName: "TranscriptAnalysis");

            migrationBuilder.RenameColumn(
                name: "OverallStatus",
                table: "InterviewAnalysisResults",
                newName: "Strengths");

            migrationBuilder.RenameColumn(
                name: "HiringReadiness",
                table: "InterviewAnalysisResults",
                newName: "ImprovementSuggestions");

            migrationBuilder.AddColumn<string>(
                name: "FinalFeedback",
                table: "InterviewAnalysisResults",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 779, DateTimeKind.Utc).AddTicks(3337));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 779, DateTimeKind.Utc).AddTicks(3341));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 779, DateTimeKind.Utc).AddTicks(3344));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 784, DateTimeKind.Utc).AddTicks(3522));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 784, DateTimeKind.Utc).AddTicks(3534));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 784, DateTimeKind.Utc).AddTicks(3537));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000004"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 784, DateTimeKind.Utc).AddTicks(3539));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000005"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 784, DateTimeKind.Utc).AddTicks(3540));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000006"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 784, DateTimeKind.Utc).AddTicks(3542));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000007"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 784, DateTimeKind.Utc).AddTicks(3544));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000008"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 784, DateTimeKind.Utc).AddTicks(3545));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000009"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 784, DateTimeKind.Utc).AddTicks(3547));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000010"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 784, DateTimeKind.Utc).AddTicks(3550));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000011"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 784, DateTimeKind.Utc).AddTicks(3552));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000012"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 784, DateTimeKind.Utc).AddTicks(3553));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000013"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 784, DateTimeKind.Utc).AddTicks(3555));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000014"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 784, DateTimeKind.Utc).AddTicks(3557));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 783, DateTimeKind.Utc).AddTicks(9361));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 783, DateTimeKind.Utc).AddTicks(9368));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 783, DateTimeKind.Utc).AddTicks(9370));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 783, DateTimeKind.Utc).AddTicks(9371));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 783, DateTimeKind.Utc).AddTicks(9373));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 783, DateTimeKind.Utc).AddTicks(9382));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000007"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 783, DateTimeKind.Utc).AddTicks(9384));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000008"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 783, DateTimeKind.Utc).AddTicks(9386));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000009"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 783, DateTimeKind.Utc).AddTicks(9387));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000010"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 783, DateTimeKind.Utc).AddTicks(9389));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 783, DateTimeKind.Utc).AddTicks(9391));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 51, 26, 783, DateTimeKind.Utc).AddTicks(9392));
        }
    }
}
