using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class FixCodingProblemsColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Check and add missing columns to CodingProblems table
            // These columns were defined in the UpdateCodingProblemGuidId migration
            // but may not have been applied properly due to the DROP/CREATE issue

            // Add ProblemCode if missing
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CodingProblems') AND name = 'ProblemCode')
                BEGIN
                    ALTER TABLE [CodingProblems] ADD [ProblemCode] nvarchar(max) NOT NULL DEFAULT ''
                END
            ");

            // Add CategoriesJson if missing
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CodingProblems') AND name = 'CategoriesJson')
                BEGIN
                    ALTER TABLE [CodingProblems] ADD [CategoriesJson] nvarchar(max) NOT NULL DEFAULT '[]'
                END
            ");

            // Add CreatedByAdminName if missing
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CodingProblems') AND name = 'CreatedByAdminName')
                BEGIN
                    ALTER TABLE [CodingProblems] ADD [CreatedByAdminName] nvarchar(max) NOT NULL DEFAULT ''
                END
            ");

            // Add HiddenTestCasesJson if missing
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CodingProblems') AND name = 'HiddenTestCasesJson')
                BEGIN
                    ALTER TABLE [CodingProblems] ADD [HiddenTestCasesJson] nvarchar(max) NOT NULL DEFAULT '[]'
                END
            ");

            // Add PublicTestCasesJson if missing
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CodingProblems') AND name = 'PublicTestCasesJson')
                BEGIN
                    ALTER TABLE [CodingProblems] ADD [PublicTestCasesJson] nvarchar(max) NOT NULL DEFAULT '[]'
                END
            ");

            // Add SupportedLanguagesJson if missing
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CodingProblems') AND name = 'SupportedLanguagesJson')
                BEGIN
                    ALTER TABLE [CodingProblems] ADD [SupportedLanguagesJson] nvarchar(max) NOT NULL DEFAULT '[]'
                END
            ");

            // Fix ConstraintsJson nullability (was nullable in old schema)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CodingProblems') AND name = 'ConstraintsJson' AND is_nullable = 1)
                BEGIN
                    UPDATE [CodingProblems] SET [ConstraintsJson] = '[]' WHERE [ConstraintsJson] IS NULL
                    ALTER TABLE [CodingProblems] ALTER COLUMN [ConstraintsJson] nvarchar(max) NOT NULL
                END
            ");

            // Fix ExamplesJson nullability (was nullable in old schema)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CodingProblems') AND name = 'ExamplesJson' AND is_nullable = 1)
                BEGIN
                    UPDATE [CodingProblems] SET [ExamplesJson] = '[]' WHERE [ExamplesJson] IS NULL
                    ALTER TABLE [CodingProblems] ALTER COLUMN [ExamplesJson] nvarchar(max) NOT NULL
                END
            ");

            // Fix StarterCodeJson nullability (was nullable in old schema)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CodingProblems') AND name = 'StarterCodeJson' AND is_nullable = 1)
                BEGIN
                    UPDATE [CodingProblems] SET [StarterCodeJson] = '{}' WHERE [StarterCodeJson] IS NULL
                    ALTER TABLE [CodingProblems] ALTER COLUMN [StarterCodeJson] nvarchar(max) NOT NULL
                END
            ");

            // Fix SolutionJson nullability (was nullable in old schema)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CodingProblems') AND name = 'SolutionJson' AND is_nullable = 1)
                BEGIN
                    UPDATE [CodingProblems] SET [SolutionJson] = '{}' WHERE [SolutionJson] IS NULL
                    ALTER TABLE [CodingProblems] ALTER COLUMN [SolutionJson] nvarchar(max) NOT NULL
                END
            ");

            // Fix UpdatedAt nullability (entity allows null but old schema didn't)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CodingProblems') AND name = 'UpdatedAt' AND is_nullable = 0)
                BEGIN
                    ALTER TABLE [CodingProblems] ALTER COLUMN [UpdatedAt] datetime2 NULL
                END
            ");

            // Fix ShortDescription not null if missing
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CodingProblems') AND name = 'ShortDescription')
                BEGIN
                    ALTER TABLE [CodingProblems] ADD [ShortDescription] nvarchar(max) NOT NULL DEFAULT ''
                END
            ");

            // Handle CreatedByAdminId type change (int -> uniqueidentifier)
            // Only if it's still int type
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.columns c 
                           JOIN sys.types t ON c.user_type_id = t.user_type_id
                           WHERE c.object_id = OBJECT_ID('CodingProblems') 
                           AND c.name = 'CreatedByAdminId' 
                           AND t.name = 'int')
                BEGIN
                    -- Add temp column
                    ALTER TABLE [CodingProblems] ADD [CreatedByAdminIdGuid] uniqueidentifier NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'
                    -- Drop old int column
                    ALTER TABLE [CodingProblems] DROP COLUMN [CreatedByAdminId]
                    -- Rename new column
                    EXEC sp_rename 'CodingProblems.CreatedByAdminIdGuid', 'CreatedByAdminId', 'COLUMN'
                END
            ");

            // Handle Id type change (int -> uniqueidentifier) for CodingProblems
            // Check if Id is still int type and UserCodingPracticeHistories.CodingProblemId is still int
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.columns c 
                           JOIN sys.types t ON c.user_type_id = t.user_type_id
                           WHERE c.object_id = OBJECT_ID('CodingProblems') 
                           AND c.name = 'Id' 
                           AND t.name = 'int')
                BEGIN
                    -- Remove FK first
                    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_UserCodingPracticeHistories_CodingProblems_CodingProblemId')
                    BEGIN
                        ALTER TABLE [UserCodingPracticeHistories] DROP CONSTRAINT [FK_UserCodingPracticeHistories_CodingProblems_CodingProblemId]
                    END
                    -- Drop indices on CodingProblems.Id
                    IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('CodingProblems') AND name = 'PK_CodingProblems')
                    BEGIN
                        ALTER TABLE [CodingProblems] DROP CONSTRAINT [PK_CodingProblems]
                    END
                    -- Drop IX_UserCodingPracticeHistories_CodingProblemId if it exists
                    IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('UserCodingPracticeHistories') AND name = 'IX_UserCodingPracticeHistories_CodingProblemId')
                    BEGIN
                        DROP INDEX [IX_UserCodingPracticeHistories_CodingProblemId] ON [UserCodingPracticeHistories]
                    END
                    IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('UserCodingPracticeHistories') AND name = 'IX_UserCodingPracticeHistories_UserId_CodingProblemId')
                    BEGIN
                        DROP INDEX [IX_UserCodingPracticeHistories_UserId_CodingProblemId] ON [UserCodingPracticeHistories]
                    END
                    -- Add new Guid Id column
                    ALTER TABLE [CodingProblems] ADD [NewId] uniqueidentifier NOT NULL DEFAULT NEWID()
                    -- Drop old Id
                    ALTER TABLE [CodingProblems] DROP COLUMN [Id]
                    -- Rename
                    EXEC sp_rename 'CodingProblems.NewId', 'Id', 'COLUMN'
                    -- Add primary key
                    ALTER TABLE [CodingProblems] ADD CONSTRAINT [PK_CodingProblems] PRIMARY KEY ([Id])
                    -- Fix UserCodingPracticeHistories.CodingProblemId
                    ALTER TABLE [UserCodingPracticeHistories] DROP COLUMN [CodingProblemId]
                    ALTER TABLE [UserCodingPracticeHistories] ADD [CodingProblemId] uniqueidentifier NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'
                    -- Recreate FK and indices
                    ALTER TABLE [UserCodingPracticeHistories] ADD CONSTRAINT [FK_UserCodingPracticeHistories_CodingProblems_CodingProblemId]
                        FOREIGN KEY ([CodingProblemId]) REFERENCES [CodingProblems] ([Id]) ON DELETE CASCADE
                    CREATE INDEX [IX_UserCodingPracticeHistories_CodingProblemId] ON [UserCodingPracticeHistories] ([CodingProblemId])
                    CREATE INDEX [IX_UserCodingPracticeHistories_UserId_CodingProblemId] ON [UserCodingPracticeHistories] ([UserId], [CodingProblemId])
                END
            ");

            // Remove old columns that no longer exist in entity (Category, TagsJson, TestCasesJson)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CodingProblems') AND name = 'TestCasesJson')
                BEGIN
                    ALTER TABLE [CodingProblems] DROP COLUMN [TestCasesJson]
                END
            ");

            // Note: Category and TagsJson are kept as they may exist in old data
            // The entity no longer has them but they won't cause errors if extra columns exist
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Rollback is complex due to type changes; 
            // For safety, this migration is not fully reversible
        }
    }
}
