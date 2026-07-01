using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteToSections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "CvTemplateSections",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "CvTemplateSections",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "CvTemplateSections",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "RestoredAt",
                table: "CvTemplateSections",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RestoredBy",
                table: "CvTemplateSections",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 8, 45, 8, 162, DateTimeKind.Utc).AddTicks(560));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 8, 45, 8, 162, DateTimeKind.Utc).AddTicks(585));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 8, 45, 8, 162, DateTimeKind.Utc).AddTicks(599));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 8, 45, 8, 176, DateTimeKind.Utc).AddTicks(3599));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 8, 45, 8, 176, DateTimeKind.Utc).AddTicks(3627));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 8, 45, 8, 176, DateTimeKind.Utc).AddTicks(3640));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 8, 45, 8, 176, DateTimeKind.Utc).AddTicks(3650));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 8, 45, 8, 176, DateTimeKind.Utc).AddTicks(3658));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 8, 45, 8, 176, DateTimeKind.Utc).AddTicks(3667));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000007"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 8, 45, 8, 176, DateTimeKind.Utc).AddTicks(3675));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000008"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 8, 45, 8, 176, DateTimeKind.Utc).AddTicks(3682));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000009"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 8, 45, 8, 176, DateTimeKind.Utc).AddTicks(3698));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000010"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 8, 45, 8, 176, DateTimeKind.Utc).AddTicks(3707));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 8, 45, 8, 176, DateTimeKind.Utc).AddTicks(3715));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 27, 8, 45, 8, 176, DateTimeKind.Utc).AddTicks(3723));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "CvTemplateSections");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "CvTemplateSections");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "CvTemplateSections");

            migrationBuilder.DropColumn(
                name: "RestoredAt",
                table: "CvTemplateSections");

            migrationBuilder.DropColumn(
                name: "RestoredBy",
                table: "CvTemplateSections");

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 26, 15, 29, 0, 115, DateTimeKind.Utc).AddTicks(5151));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 26, 15, 29, 0, 115, DateTimeKind.Utc).AddTicks(5154));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 26, 15, 29, 0, 115, DateTimeKind.Utc).AddTicks(5156));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 26, 15, 29, 0, 118, DateTimeKind.Utc).AddTicks(6299));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 26, 15, 29, 0, 118, DateTimeKind.Utc).AddTicks(6305));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 26, 15, 29, 0, 118, DateTimeKind.Utc).AddTicks(6307));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 26, 15, 29, 0, 118, DateTimeKind.Utc).AddTicks(6308));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 26, 15, 29, 0, 118, DateTimeKind.Utc).AddTicks(6310));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 26, 15, 29, 0, 118, DateTimeKind.Utc).AddTicks(6312));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000007"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 26, 15, 29, 0, 118, DateTimeKind.Utc).AddTicks(6313));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000008"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 26, 15, 29, 0, 118, DateTimeKind.Utc).AddTicks(6315));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000009"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 26, 15, 29, 0, 118, DateTimeKind.Utc).AddTicks(6318));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000010"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 26, 15, 29, 0, 118, DateTimeKind.Utc).AddTicks(6320));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 26, 15, 29, 0, 118, DateTimeKind.Utc).AddTicks(6321));

            migrationBuilder.UpdateData(
                table: "CvSectionDefinitions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 26, 15, 29, 0, 118, DateTimeKind.Utc).AddTicks(6323));
        }
    }
}
