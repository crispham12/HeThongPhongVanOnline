using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCvComponents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Height",
                table: "CvTemplateComponents");

            migrationBuilder.DropColumn(
                name: "Rotation",
                table: "CvTemplateComponents");

            migrationBuilder.DropColumn(
                name: "Width",
                table: "CvTemplateComponents");

            migrationBuilder.DropColumn(
                name: "X",
                table: "CvTemplateComponents");

            migrationBuilder.DropColumn(
                name: "Y",
                table: "CvTemplateComponents");

            migrationBuilder.RenameColumn(
                name: "ZIndex",
                table: "CvTemplateComponents",
                newName: "OrderIndex");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "CvTemplateComponents",
                newName: "Variant");

            migrationBuilder.RenameColumn(
                name: "StyleJson",
                table: "CvTemplateComponents",
                newName: "PropertiesJson");

            migrationBuilder.RenameColumn(
                name: "Content",
                table: "CvTemplateComponents",
                newName: "DisplayName");

            migrationBuilder.AddColumn<string>(
                name: "BindingPath",
                table: "CvTemplateComponents",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "ComponentDefinitionId",
                table: "CvTemplateComponents",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "ComponentType",
                table: "CvTemplateComponents",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "CvTemplateComponents",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "CvTemplateComponents",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "CvTemplateComponents",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsHidden",
                table: "CvTemplateComponents",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsLocked",
                table: "CvTemplateComponents",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "ParentComponentId",
                table: "CvTemplateComponents",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RestoredAt",
                table: "CvTemplateComponents",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RestoredBy",
                table: "CvTemplateComponents",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SectionId",
                table: "CvTemplateComponents",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "CvComponentDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ComponentType = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    DefaultBindingPath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DefaultVariant = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SupportedVariantsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompatibleSectionTypesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsRepeatable = table.Column<bool>(type: "bit", nullable: false),
                    IsBindable = table.Column<bool>(type: "bit", nullable: false),
                    IsContainer = table.Column<bool>(type: "bit", nullable: false),
                    IsSingleInstance = table.Column<bool>(type: "bit", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CvComponentDefinitions", x => x.Id);
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

            migrationBuilder.InsertData(
                table: "CvComponentDefinitions",
                columns: new[] { "Id", "Category", "CompatibleSectionTypesJson", "ComponentType", "CreatedAt", "DefaultBindingPath", "DefaultVariant", "Description", "IsActive", "IsBindable", "IsContainer", "IsRepeatable", "IsSingleInstance", "Name", "SortOrder", "SupportedVariantsJson" },
                values: new object[,]
                {
                    { new Guid("20000000-0000-0000-0000-000000000001"), "Personal", "[\"PersonalInfo\", \"Header\"]", "Avatar", new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6401), "Candidate.Avatar", "default", "", true, true, false, false, false, "Avatar", 1, "[\"circle\", \"rounded\", \"square\"]" },
                    { new Guid("20000000-0000-0000-0000-000000000002"), "Personal", "[\"PersonalInfo\", \"Header\"]", "FullName", new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6414), "Candidate.FullName", "default", "", true, true, false, false, false, "Full Name", 2, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000003"), "Personal", "[\"PersonalInfo\", \"Header\"]", "JobTitle", new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6420), "Candidate.JobTitle", "default", "", true, true, false, false, false, "Job Title", 3, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000004"), "Personal", "[\"PersonalInfo\", \"Header\"]", "ContactRow", new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6425), "Candidate.Contact", "default", "", true, true, false, false, false, "Contact Row", 4, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000005"), "Experience", "[\"Experience\"]", "ExperienceCard", new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6440), "Candidate.Experiences", "default", "", true, false, false, true, false, "Experience Card", 5, "[\"compact\", \"timeline\", \"detailed\"]" },
                    { new Guid("20000000-0000-0000-0000-000000000006"), "Experience", "[\"Experience\", \"Education\"]", "Timeline", new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6507), "", "default", "", true, false, false, false, false, "Timeline", 6, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000007"), "Experience", "[\"Experience\", \"Projects\"]", "AchievementList", new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6511), "", "default", "", true, false, false, false, false, "Achievement List", 7, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000008"), "Experience", "[\"Experience\", \"Projects\"]", "TechnologyTags", new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6515), "", "default", "", true, false, false, false, false, "Technology Tags", 8, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000009"), "Education", "[\"Education\"]", "EducationCard", new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6518), "Candidate.Educations", "default", "", true, false, false, true, false, "Education Card", 9, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000010"), "Skills", "[\"Skills\"]", "SkillTags", new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6523), "Candidate.Skills", "default", "", true, false, false, false, false, "Skill Tags", 10, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000011"), "Skills", "[\"Skills\"]", "SkillProgress", new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6527), "Candidate.Skills", "default", "", true, false, false, false, false, "Skill Progress", 11, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000012"), "Projects", "[\"Projects\"]", "ProjectCard", new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6531), "Candidate.Projects", "default", "", true, false, false, false, false, "Project Card", 12, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000013"), "Decoration", "[\"PersonalInfo\", \"Summary\", \"Experience\", \"Education\", \"Skills\", \"Projects\", \"Certificates\", \"Languages\", \"Custom\"]", "Divider", new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6539), "", "default", "", true, false, false, false, false, "Divider", 13, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000014"), "Layout", "[\"PersonalInfo\", \"Summary\", \"Experience\", \"Education\", \"Skills\", \"Projects\", \"Certificates\", \"Languages\", \"Custom\"]", "Container", new DateTime(2026, 6, 27, 9, 27, 22, 425, DateTimeKind.Utc).AddTicks(6542), "", "default", "", true, false, true, false, false, "Container", 14, "[]" }
                });

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
                name: "IX_CvTemplateComponents_ComponentDefinitionId",
                table: "CvTemplateComponents",
                column: "ComponentDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_CvTemplateComponents_OrderIndex",
                table: "CvTemplateComponents",
                column: "OrderIndex");

            migrationBuilder.CreateIndex(
                name: "IX_CvTemplateComponents_ParentComponentId",
                table: "CvTemplateComponents",
                column: "ParentComponentId");

            migrationBuilder.CreateIndex(
                name: "IX_CvTemplateComponents_SectionId",
                table: "CvTemplateComponents",
                column: "SectionId");

            migrationBuilder.CreateIndex(
                name: "IX_CvComponentDefinitions_Category",
                table: "CvComponentDefinitions",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_CvComponentDefinitions_ComponentType",
                table: "CvComponentDefinitions",
                column: "ComponentType");

            migrationBuilder.AddForeignKey(
                name: "FK_CvTemplateComponents_CvComponentDefinitions_ComponentDefinitionId",
                table: "CvTemplateComponents",
                column: "ComponentDefinitionId",
                principalTable: "CvComponentDefinitions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CvTemplateComponents_CvTemplateComponents_ParentComponentId",
                table: "CvTemplateComponents",
                column: "ParentComponentId",
                principalTable: "CvTemplateComponents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CvTemplateComponents_CvTemplateSections_SectionId",
                table: "CvTemplateComponents",
                column: "SectionId",
                principalTable: "CvTemplateSections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CvTemplateComponents_CvComponentDefinitions_ComponentDefinitionId",
                table: "CvTemplateComponents");

            migrationBuilder.DropForeignKey(
                name: "FK_CvTemplateComponents_CvTemplateComponents_ParentComponentId",
                table: "CvTemplateComponents");

            migrationBuilder.DropForeignKey(
                name: "FK_CvTemplateComponents_CvTemplateSections_SectionId",
                table: "CvTemplateComponents");

            migrationBuilder.DropTable(
                name: "CvComponentDefinitions");

            migrationBuilder.DropIndex(
                name: "IX_CvTemplateComponents_ComponentDefinitionId",
                table: "CvTemplateComponents");

            migrationBuilder.DropIndex(
                name: "IX_CvTemplateComponents_OrderIndex",
                table: "CvTemplateComponents");

            migrationBuilder.DropIndex(
                name: "IX_CvTemplateComponents_ParentComponentId",
                table: "CvTemplateComponents");

            migrationBuilder.DropIndex(
                name: "IX_CvTemplateComponents_SectionId",
                table: "CvTemplateComponents");

            migrationBuilder.DropColumn(
                name: "BindingPath",
                table: "CvTemplateComponents");

            migrationBuilder.DropColumn(
                name: "ComponentDefinitionId",
                table: "CvTemplateComponents");

            migrationBuilder.DropColumn(
                name: "ComponentType",
                table: "CvTemplateComponents");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "CvTemplateComponents");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "CvTemplateComponents");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "CvTemplateComponents");

            migrationBuilder.DropColumn(
                name: "IsHidden",
                table: "CvTemplateComponents");

            migrationBuilder.DropColumn(
                name: "IsLocked",
                table: "CvTemplateComponents");

            migrationBuilder.DropColumn(
                name: "ParentComponentId",
                table: "CvTemplateComponents");

            migrationBuilder.DropColumn(
                name: "RestoredAt",
                table: "CvTemplateComponents");

            migrationBuilder.DropColumn(
                name: "RestoredBy",
                table: "CvTemplateComponents");

            migrationBuilder.DropColumn(
                name: "SectionId",
                table: "CvTemplateComponents");

            migrationBuilder.RenameColumn(
                name: "Variant",
                table: "CvTemplateComponents",
                newName: "Type");

            migrationBuilder.RenameColumn(
                name: "PropertiesJson",
                table: "CvTemplateComponents",
                newName: "StyleJson");

            migrationBuilder.RenameColumn(
                name: "OrderIndex",
                table: "CvTemplateComponents",
                newName: "ZIndex");

            migrationBuilder.RenameColumn(
                name: "DisplayName",
                table: "CvTemplateComponents",
                newName: "Content");

            migrationBuilder.AddColumn<int>(
                name: "Height",
                table: "CvTemplateComponents",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Rotation",
                table: "CvTemplateComponents",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Width",
                table: "CvTemplateComponents",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "X",
                table: "CvTemplateComponents",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Y",
                table: "CvTemplateComponents",
                type: "int",
                nullable: false,
                defaultValue: 0);

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
    }
}
