using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDeletedByToHrInterviewSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "HrInterviewSessions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 898, DateTimeKind.Utc).AddTicks(2313));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 898, DateTimeKind.Utc).AddTicks(2318));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 898, DateTimeKind.Utc).AddTicks(2320));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(7711));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(7721));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(7723));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000004"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(7725));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000005"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(7727));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000006"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(7729));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000007"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(7730));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000008"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(7732));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000009"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(7733));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000010"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(7736));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000011"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(7738));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000012"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(7739));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000013"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(7741));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000014"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(7742));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(3599));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(3608));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(3610));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(3612));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(3614));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(3622));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000007"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(3624));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000008"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(3625));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000009"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(3627));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000010"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(3629));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(3630));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 19, 2, 37, 904, DateTimeKind.Utc).AddTicks(3670));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "HrInterviewSessions");

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 297, DateTimeKind.Utc).AddTicks(7836));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 297, DateTimeKind.Utc).AddTicks(7843));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 297, DateTimeKind.Utc).AddTicks(7848));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 309, DateTimeKind.Utc).AddTicks(1368));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 309, DateTimeKind.Utc).AddTicks(1397));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 309, DateTimeKind.Utc).AddTicks(1400));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000004"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 309, DateTimeKind.Utc).AddTicks(1405));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000005"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 309, DateTimeKind.Utc).AddTicks(1419));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000006"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 309, DateTimeKind.Utc).AddTicks(1421));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000007"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 309, DateTimeKind.Utc).AddTicks(1427));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000008"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 309, DateTimeKind.Utc).AddTicks(1429));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000009"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 309, DateTimeKind.Utc).AddTicks(1431));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000010"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 309, DateTimeKind.Utc).AddTicks(1435));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000011"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 309, DateTimeKind.Utc).AddTicks(1437));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000012"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 309, DateTimeKind.Utc).AddTicks(1440));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000013"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 309, DateTimeKind.Utc).AddTicks(1445));

            migrationBuilder.UpdateData(
                table: "CvComponentDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000014"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 309, DateTimeKind.Utc).AddTicks(1447));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 308, DateTimeKind.Utc).AddTicks(4163));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 308, DateTimeKind.Utc).AddTicks(4186));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 308, DateTimeKind.Utc).AddTicks(4189));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 308, DateTimeKind.Utc).AddTicks(4192));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 308, DateTimeKind.Utc).AddTicks(4194));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 308, DateTimeKind.Utc).AddTicks(4196));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000007"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 308, DateTimeKind.Utc).AddTicks(4198));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000008"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 308, DateTimeKind.Utc).AddTicks(4201));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000009"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 308, DateTimeKind.Utc).AddTicks(4206));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000010"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 308, DateTimeKind.Utc).AddTicks(4207));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 308, DateTimeKind.Utc).AddTicks(4214));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 2, 18, 41, 53, 308, DateTimeKind.Utc).AddTicks(4217));
        }
    }
}
