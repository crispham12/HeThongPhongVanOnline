using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class AddHrQuestionBank : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "QuestionBankId",
                table: "HrInterviewQuestions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Source",
                table: "HrInterviewQuestions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TargetSkill",
                table: "HrInterviewQuestions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "HrQuestionBanks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuestionText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpectedAnswerGuide = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TargetSkill = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SuggestedMethod = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MaxAnswerTime = table.Column<int>(type: "int", nullable: false),
                    Source = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    RoleContext = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LevelContext = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UsageCount = table.Column<int>(type: "int", nullable: false),
                    LastUsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HrQuestionBanks", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 945, DateTimeKind.Utc).AddTicks(597));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 945, DateTimeKind.Utc).AddTicks(600));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 945, DateTimeKind.Utc).AddTicks(612));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 950, DateTimeKind.Utc).AddTicks(1715));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 950, DateTimeKind.Utc).AddTicks(1722));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 950, DateTimeKind.Utc).AddTicks(1724));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000004"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 950, DateTimeKind.Utc).AddTicks(1726));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000005"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 950, DateTimeKind.Utc).AddTicks(1734));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000006"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 950, DateTimeKind.Utc).AddTicks(1736));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000007"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 950, DateTimeKind.Utc).AddTicks(1738));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000008"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 950, DateTimeKind.Utc).AddTicks(1740));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000009"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 950, DateTimeKind.Utc).AddTicks(1741));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000010"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 950, DateTimeKind.Utc).AddTicks(1743));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000011"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 950, DateTimeKind.Utc).AddTicks(1745));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000012"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 950, DateTimeKind.Utc).AddTicks(1746));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000013"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 950, DateTimeKind.Utc).AddTicks(1749));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000014"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 950, DateTimeKind.Utc).AddTicks(1751));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 949, DateTimeKind.Utc).AddTicks(7619));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 949, DateTimeKind.Utc).AddTicks(7632));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 949, DateTimeKind.Utc).AddTicks(7634));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 949, DateTimeKind.Utc).AddTicks(7636));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 949, DateTimeKind.Utc).AddTicks(7637));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 949, DateTimeKind.Utc).AddTicks(7639));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000007"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 949, DateTimeKind.Utc).AddTicks(7641));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000008"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 949, DateTimeKind.Utc).AddTicks(7643));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000009"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 949, DateTimeKind.Utc).AddTicks(7646));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000010"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 949, DateTimeKind.Utc).AddTicks(7648));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 949, DateTimeKind.Utc).AddTicks(7650));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 1, 15, 10, 54, 949, DateTimeKind.Utc).AddTicks(7651));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HrQuestionBanks");

            migrationBuilder.DropColumn(
                name: "QuestionBankId",
                table: "HrInterviewQuestions");

            migrationBuilder.DropColumn(
                name: "Source",
                table: "HrInterviewQuestions");

            migrationBuilder.DropColumn(
                name: "TargetSkill",
                table: "HrInterviewQuestions");

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
        }
    }
}
