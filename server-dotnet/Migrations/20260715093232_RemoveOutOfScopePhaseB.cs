using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class RemoveOutOfScopePhaseB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CvTemplateComponents");

            migrationBuilder.DropTable(
                name: "UserCVs");

            migrationBuilder.DropTable(
                name: "CvComponentDefinitions");

            migrationBuilder.DropTable(
                name: "CvTemplateSections");

            migrationBuilder.DropTable(
                name: "CvSectionDefinitions");

            migrationBuilder.DropTable(
                name: "CvTemplateContainers");

            migrationBuilder.DropTable(
                name: "CvTemplates");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CvComponentDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CompatibleSectionTypesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ComponentType = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DefaultBindingPath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DefaultVariant = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsBindable = table.Column<bool>(type: "bit", nullable: false),
                    IsContainer = table.Column<bool>(type: "bit", nullable: false),
                    IsRepeatable = table.Column<bool>(type: "bit", nullable: false),
                    IsSingleInstance = table.Column<bool>(type: "bit", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    SupportedVariantsJson = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CvComponentDefinitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CvSectionDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DefaultBindingPath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsATSFriendly = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsRepeatable = table.Column<bool>(type: "bit", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    IsSingleInstance = table.Column<bool>(type: "bit", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SectionType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CvSectionDefinitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CvTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BackgroundColor = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByAdminId = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Height = table.Column<int>(type: "int", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Thumbnail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Version = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Width = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CvTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserCVs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AiFeedback = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AiScore = table.Column<int>(type: "int", nullable: false),
                    CoreStack = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Education = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Experience = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Languages = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PersonalInfo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Proficiencies = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Skills = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TemplateId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCVs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CvTemplateContainers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConfigJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LayoutType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CvTemplateContainers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CvTemplateContainers_CvTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "CvTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CvTemplateSections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContainerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SectionDefinitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BindingPath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ColumnIndex = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsHidden = table.Column<bool>(type: "bit", nullable: false),
                    IsLocked = table.Column<bool>(type: "bit", nullable: false),
                    IsRepeatable = table.Column<bool>(type: "bit", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    LayoutConfigJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    RestoredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RestoredBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
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
                        name: "FK_CvTemplateSections_CvTemplateContainers_ContainerId",
                        column: x => x.ContainerId,
                        principalTable: "CvTemplateContainers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CvTemplateSections_CvTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "CvTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CvTemplateComponents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ComponentDefinitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParentComponentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SectionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BindingPath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ComponentType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DisplayName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsHidden = table.Column<bool>(type: "bit", nullable: false),
                    IsLocked = table.Column<bool>(type: "bit", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    PropertiesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RestoredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RestoredBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Variant = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CvTemplateComponents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CvTemplateComponents_CvComponentDefinitions_ComponentDefinitionId",
                        column: x => x.ComponentDefinitionId,
                        principalTable: "CvComponentDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CvTemplateComponents_CvTemplateComponents_ParentComponentId",
                        column: x => x.ParentComponentId,
                        principalTable: "CvTemplateComponents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CvTemplateComponents_CvTemplateSections_SectionId",
                        column: x => x.SectionId,
                        principalTable: "CvTemplateSections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CvTemplateComponents_CvTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "CvTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "CvComponentDefinitions",
                columns: new[] { "Id", "Category", "CompatibleSectionTypesJson", "ComponentType", "CreatedAt", "DefaultBindingPath", "DefaultVariant", "Description", "IsActive", "IsBindable", "IsContainer", "IsRepeatable", "IsSingleInstance", "Name", "SortOrder", "SupportedVariantsJson" },
                values: new object[,]
                {
                    { new Guid("20000000-0000-0000-0000-000000000001"), "Personal", "[\"PersonalInfo\", \"Header\"]", "Avatar", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(4669), "Candidate.Avatar", "default", "", true, true, false, false, false, "Avatar", 1, "[\"circle\", \"rounded\", \"square\"]" },
                    { new Guid("20000000-0000-0000-0000-000000000002"), "Personal", "[\"PersonalInfo\", \"Header\"]", "FullName", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(4683), "Candidate.FullName", "default", "", true, true, false, false, false, "Full Name", 2, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000003"), "Personal", "[\"PersonalInfo\", \"Header\"]", "JobTitle", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(4685), "Candidate.JobTitle", "default", "", true, true, false, false, false, "Job Title", 3, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000004"), "Personal", "[\"PersonalInfo\", \"Header\"]", "ContactRow", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(4687), "Candidate.Contact", "default", "", true, true, false, false, false, "Contact Row", 4, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000005"), "Experience", "[\"Experience\"]", "ExperienceCard", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(4689), "Candidate.Experiences", "default", "", true, false, false, true, false, "Experience Card", 5, "[\"compact\", \"timeline\", \"detailed\"]" },
                    { new Guid("20000000-0000-0000-0000-000000000006"), "Experience", "[\"Experience\", \"Education\"]", "Timeline", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(4691), "", "default", "", true, false, false, false, false, "Timeline", 6, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000007"), "Experience", "[\"Experience\", \"Projects\"]", "AchievementList", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(4693), "", "default", "", true, false, false, false, false, "Achievement List", 7, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000008"), "Experience", "[\"Experience\", \"Projects\"]", "TechnologyTags", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(4694), "", "default", "", true, false, false, false, false, "Technology Tags", 8, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000009"), "Education", "[\"Education\"]", "EducationCard", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(4696), "Candidate.Educations", "default", "", true, false, false, true, false, "Education Card", 9, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000010"), "Skills", "[\"Skills\"]", "SkillTags", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(4699), "Candidate.Skills", "default", "", true, false, false, false, false, "Skill Tags", 10, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000011"), "Skills", "[\"Skills\"]", "SkillProgress", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(4701), "Candidate.Skills", "default", "", true, false, false, false, false, "Skill Progress", 11, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000012"), "Projects", "[\"Projects\"]", "ProjectCard", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(4702), "Candidate.Projects", "default", "", true, false, false, false, false, "Project Card", 12, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000013"), "Decoration", "[\"PersonalInfo\", \"Summary\", \"Experience\", \"Education\", \"Skills\", \"Projects\", \"Certificates\", \"Languages\", \"Custom\"]", "Divider", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(4704), "", "default", "", true, false, false, false, false, "Divider", 13, "[]" },
                    { new Guid("20000000-0000-0000-0000-000000000014"), "Layout", "[\"PersonalInfo\", \"Summary\", \"Experience\", \"Education\", \"Skills\", \"Projects\", \"Certificates\", \"Languages\", \"Custom\"]", "Container", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(4706), "", "default", "", true, false, true, false, false, "Container", 14, "[]" }
                });

            migrationBuilder.InsertData(
                table: "CvSectionDefinitions",
                columns: new[] { "Id", "Category", "CreatedAt", "DefaultBindingPath", "Description", "Icon", "IsATSFriendly", "IsActive", "IsRepeatable", "IsRequired", "IsSingleInstance", "Name", "SectionType", "SortOrder" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), "Core", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(462), "", "", "", false, true, false, true, true, "Personal Information", "PersonalInfo", 1 },
                    { new Guid("10000000-0000-0000-0000-000000000002"), "Core", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(466), "", "", "", false, true, false, true, true, "Professional Summary", "Summary", 2 },
                    { new Guid("10000000-0000-0000-0000-000000000003"), "Core", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(469), "", "", "", false, true, true, true, false, "Experience", "Experience", 3 },
                    { new Guid("10000000-0000-0000-0000-000000000004"), "Core", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(470), "", "", "", false, true, true, true, false, "Education", "Education", 4 },
                    { new Guid("10000000-0000-0000-0000-000000000005"), "Core", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(472), "", "", "", false, true, false, true, true, "Skills", "Skills", 5 },
                    { new Guid("10000000-0000-0000-0000-000000000006"), "Optional", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(485), "", "", "", false, true, true, false, false, "Projects", "Projects", 6 },
                    { new Guid("10000000-0000-0000-0000-000000000007"), "Optional", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(486), "", "", "", false, true, true, false, false, "Languages", "Languages", 7 },
                    { new Guid("10000000-0000-0000-0000-000000000008"), "Optional", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(489), "", "", "", false, true, false, false, true, "Certificates", "Certificates", 8 },
                    { new Guid("10000000-0000-0000-0000-000000000009"), "Optional", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(491), "", "", "", false, true, false, false, true, "Awards", "Awards", 9 },
                    { new Guid("10000000-0000-0000-0000-000000000010"), "Optional", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(492), "", "", "", false, true, false, false, true, "Activities", "Activities", 10 },
                    { new Guid("10000000-0000-0000-0000-000000000011"), "Optional", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(494), "", "", "", false, true, false, false, true, "References", "References", 11 },
                    { new Guid("10000000-0000-0000-0000-000000000012"), "Custom", new DateTime(2026, 7, 15, 9, 13, 33, 589, DateTimeKind.Utc).AddTicks(496), "", "", "", false, true, true, false, false, "Custom Section", "Custom", 12 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CvComponentDefinitions_Category",
                table: "CvComponentDefinitions",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_CvComponentDefinitions_ComponentType",
                table: "CvComponentDefinitions",
                column: "ComponentType");

            migrationBuilder.CreateIndex(
                name: "IX_CvSectionDefinitions_Category",
                table: "CvSectionDefinitions",
                column: "Category");

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
                name: "IX_CvTemplateComponents_TemplateId",
                table: "CvTemplateComponents",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_CvTemplateContainers_TemplateId",
                table: "CvTemplateContainers",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_CvTemplateSections_ContainerId",
                table: "CvTemplateSections",
                column: "ContainerId");

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
    }
}
