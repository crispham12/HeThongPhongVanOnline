using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCvTemplateSections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "CvTemplates",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "CvTemplates",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Thumbnail",
                table: "CvTemplates",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Version",
                table: "CvTemplates",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "CvSectionDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SectionType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    DefaultBindingPath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    IsRepeatable = table.Column<bool>(type: "bit", nullable: false),
                    IsSingleInstance = table.Column<bool>(type: "bit", nullable: false),
                    IsATSFriendly = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CvSectionDefinitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CvTemplateSections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SectionDefinitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BindingPath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    IsRepeatable = table.Column<bool>(type: "bit", nullable: false),
                    IsHidden = table.Column<bool>(type: "bit", nullable: false),
                    IsLocked = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CvTemplateSections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CvTemplateSections_CvSectionDefinitions_SectionDefinitionId",
                        column: x => x.SectionDefinitionId,
                        principalTable: "CvSectionDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CvTemplateSections_CvTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "CvTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 26, 14, 50, 32, 235, DateTimeKind.Utc).AddTicks(5037));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 26, 14, 50, 32, 235, DateTimeKind.Utc).AddTicks(5039));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 26, 14, 50, 32, 235, DateTimeKind.Utc).AddTicks(5041));

            migrationBuilder.InsertData(
                table: "CvSectionDefinitions",
                columns: new[] { "Id", "Category", "CreatedAt", "DefaultBindingPath", "Description", "Icon", "IsATSFriendly", "IsActive", "IsRepeatable", "IsRequired", "IsSingleInstance", "Name", "SectionType", "SortOrder" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), "Core", new DateTime(2026, 6, 26, 14, 50, 32, 238, DateTimeKind.Utc).AddTicks(4840), "", "", "", false, true, false, true, true, "Personal Information", "PersonalInfo", 1 },
                    { new Guid("10000000-0000-0000-0000-000000000002"), "Core", new DateTime(2026, 6, 26, 14, 50, 32, 238, DateTimeKind.Utc).AddTicks(4845), "", "", "", false, true, false, true, true, "Professional Summary", "Summary", 2 },
                    { new Guid("10000000-0000-0000-0000-000000000003"), "Core", new DateTime(2026, 6, 26, 14, 50, 32, 238, DateTimeKind.Utc).AddTicks(4856), "", "", "", false, true, true, true, false, "Experience", "Experience", 3 },
                    { new Guid("10000000-0000-0000-0000-000000000004"), "Core", new DateTime(2026, 6, 26, 14, 50, 32, 238, DateTimeKind.Utc).AddTicks(4858), "", "", "", false, true, true, true, false, "Education", "Education", 4 },
                    { new Guid("10000000-0000-0000-0000-000000000005"), "Core", new DateTime(2026, 6, 26, 14, 50, 32, 238, DateTimeKind.Utc).AddTicks(4859), "", "", "", false, true, false, true, true, "Skills", "Skills", 5 },
                    { new Guid("10000000-0000-0000-0000-000000000006"), "Optional", new DateTime(2026, 6, 26, 14, 50, 32, 238, DateTimeKind.Utc).AddTicks(4861), "", "", "", false, true, true, false, false, "Projects", "Projects", 6 },
                    { new Guid("10000000-0000-0000-0000-000000000007"), "Optional", new DateTime(2026, 6, 26, 14, 50, 32, 238, DateTimeKind.Utc).AddTicks(4862), "", "", "", false, true, true, false, false, "Languages", "Languages", 7 },
                    { new Guid("10000000-0000-0000-0000-000000000008"), "Optional", new DateTime(2026, 6, 26, 14, 50, 32, 238, DateTimeKind.Utc).AddTicks(4864), "", "", "", false, true, false, false, true, "Certificates", "Certificates", 8 },
                    { new Guid("10000000-0000-0000-0000-000000000009"), "Optional", new DateTime(2026, 6, 26, 14, 50, 32, 238, DateTimeKind.Utc).AddTicks(4865), "", "", "", false, true, false, false, true, "Awards", "Awards", 9 },
                    { new Guid("10000000-0000-0000-0000-000000000010"), "Optional", new DateTime(2026, 6, 26, 14, 50, 32, 238, DateTimeKind.Utc).AddTicks(4867), "", "", "", false, true, false, false, true, "Activities", "Activities", 10 },
                    { new Guid("10000000-0000-0000-0000-000000000011"), "Optional", new DateTime(2026, 6, 26, 14, 50, 32, 238, DateTimeKind.Utc).AddTicks(4870), "", "", "", false, true, false, false, true, "References", "References", 11 },
                    { new Guid("10000000-0000-0000-0000-000000000012"), "Custom", new DateTime(2026, 6, 26, 14, 50, 32, 238, DateTimeKind.Utc).AddTicks(4871), "", "", "", false, true, true, false, false, "Custom Section", "Custom", 12 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CvSectionDefinitions_Category",
                table: "CvSectionDefinitions",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_CvTemplateSections_OrderIndex",
                table: "CvTemplateSections",
                column: "OrderIndex");

            migrationBuilder.CreateIndex(
                name: "IX_CvTemplateSections_SectionDefinitionId",
                table: "CvTemplateSections",
                column: "SectionDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_CvTemplateSections_Status",
                table: "CvTemplateSections",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CvTemplateSections_TemplateId",
                table: "CvTemplateSections",
                column: "TemplateId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CvTemplateSections");

            migrationBuilder.DropTable(
                name: "CvSectionDefinitions");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "CvTemplates");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "CvTemplates");

            migrationBuilder.DropColumn(
                name: "Thumbnail",
                table: "CvTemplates");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "CvTemplates");

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 25, 9, 24, 29, 392, DateTimeKind.Utc).AddTicks(1286));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 25, 9, 24, 29, 392, DateTimeKind.Utc).AddTicks(1302));

            migrationBuilder.UpdateData(
                table: "CreditPackages",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 6, 25, 9, 24, 29, 392, DateTimeKind.Utc).AddTicks(1305));
        }
    }
}
