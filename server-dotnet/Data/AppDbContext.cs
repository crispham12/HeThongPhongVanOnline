using Microsoft.EntityFrameworkCore;
using InterviewPro.API.Entities;

namespace InterviewPro.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // ── Existing Tables ──
        public DbSet<User> Users { get; set; }
        public DbSet<InterviewSession> InterviewSessions { get; set; }
        public DbSet<InterviewQuestion> InterviewQuestions { get; set; }
        public DbSet<UserCV> UserCVs { get; set; }
        public DbSet<CvTemplate> CvTemplates { get; set; }
        public DbSet<CvTemplateComponent> CvTemplateComponents { get; set; }
        public DbSet<CvSectionDefinition> CvSectionDefinitions { get; set; }
        public DbSet<CvComponentDefinition> CvComponentDefinitions { get; set; }
        public DbSet<CvTemplateContainer> CvTemplateContainers { get; set; }
        public DbSet<CvTemplateSection> CvTemplateSections { get; set; }
        public DbSet<HrInterviewSession> HrInterviewSessions { get; set; }
        public DbSet<HrInterviewQuestion> HrInterviewQuestions { get; set; }
        public DbSet<HrInterviewAnswer> HrInterviewAnswers { get; set; }
        public DbSet<HrInterviewDraft> HrInterviewDrafts { get; set; }
        public DbSet<HrInterviewEvaluation> HrInterviewEvaluations { get; set; }
        public DbSet<HrInterviewQuestionEvaluation> HrInterviewQuestionEvaluations { get; set; }
        public DbSet<HrInterviewStrength> HrInterviewStrengths { get; set; }
        public DbSet<HrInterviewImprovement> HrInterviewImprovements { get; set; }
        public DbSet<HrInterviewRecommendedPractice> HrInterviewRecommendedPractices { get; set; }
        public DbSet<HrQuestionBank> HrQuestionBanks { get; set; }
        public DbSet<AiRequestLog> AiRequestLogs { get; set; }
        
        public DbSet<InterviewAnalysisJob> InterviewAnalysisJobs { get; set; }
        public DbSet<InterviewAnalysisResult> InterviewAnalysisResults { get; set; }

        // ── Practice Sessions (Interview Data Management) ──
        public DbSet<PracticeSession> PracticeSessions { get; set; }
        public DbSet<PracticeAttempt> PracticeAttempts { get; set; }
        public DbSet<PracticeAttemptQuestion> PracticeAttemptQuestions { get; set; }

        // ── Question Bank ──
        public DbSet<Question> Questions { get; set; }
        public DbSet<CodingProblem> CodingProblems { get; set; }
        public DbSet<UserQuestionPracticeHistory> UserQuestionPracticeHistories { get; set; }
        public DbSet<CodingPracticeAttempt> CodingPracticeAttempts { get; set; }
        public DbSet<UserCodingProblemProgress> UserCodingProblemProgresses { get; set; }
        public DbSet<CodingAssessmentHistory> CodingAssessmentHistories { get; set; }

        // ── Payments & Subscriptions ──
        public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
        public DbSet<UserSubscription> UserSubscriptions { get; set; }
        public DbSet<PaymentTransaction> PaymentTransactions { get; set; }

        // ── Credit & SePay Payment system ──
        public DbSet<CreditPackage> CreditPackages { get; set; }
        public DbSet<CreditWallet> CreditWallets { get; set; }
        public DbSet<CreditPaymentTransaction> CreditPaymentTransactions { get; set; }
        public DbSet<CreditHistory> CreditHistories { get; set; }
        public DbSet<InterviewStrength> InterviewStrengths { get; set; }
        public DbSet<InterviewImprovement> InterviewImprovements { get; set; }
        public DbSet<InterviewStarAnalysis> InterviewStarAnalyses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // AI Analysis Configurations
            modelBuilder.Entity<InterviewStrength>()
                .HasOne(s => s.Result)
                .WithMany(r => r.Strengths)
                .HasForeignKey(s => s.ResultId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InterviewImprovement>()
                .HasOne(i => i.Result)
                .WithMany(r => r.Improvements)
                .HasForeignKey(i => i.ResultId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InterviewStarAnalysis>()
                .HasOne(sa => sa.Result)
                .WithMany(r => r.StarAnalyses)
                .HasForeignKey(sa => sa.ResultId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            // Credit payment configuration
            modelBuilder.Entity<CreditPaymentTransaction>(e =>
            {
                e.Property(t => t.Amount).HasColumnType("decimal(18,2)");
                e.HasIndex(t => t.PaymentCode).IsUnique();
                e.HasIndex(t => t.SePayTransactionId).IsUnique().HasFilter("[SePayTransactionId] IS NOT NULL");
            });

            modelBuilder.Entity<CreditPackage>(e =>
            {
                e.Property(p => p.Price).HasColumnType("decimal(18,2)");
            });

            // Seed CreditPackages
            modelBuilder.Entity<CreditPackage>().HasData(
                new CreditPackage { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Name = "Gói 10 lượt", Price = 35000, Credits = 10, IsActive = true, CreatedAt = DateTime.UtcNow },
                new CreditPackage { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Name = "Gói 25 lượt", Price = 75000, Credits = 25, IsActive = true, CreatedAt = DateTime.UtcNow },
                new CreditPackage { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Name = "Gói 50 lượt", Price = 100000, Credits = 50, IsActive = true, CreatedAt = DateTime.UtcNow }
            );

            modelBuilder.Entity<SubscriptionPlan>(e =>
            {
                e.Property(p => p.Price).HasColumnType("decimal(18,2)");
            });

            modelBuilder.Entity<PaymentTransaction>(e =>
            {
                e.Property(t => t.Amount).HasColumnType("decimal(18,2)");
                e.HasIndex(t => t.CreatedAt);
                e.HasIndex(t => t.Status);
            });

            // Seed Subscription Plans
            modelBuilder.Entity<SubscriptionPlan>().HasData(
                new SubscriptionPlan { Id = 1, Name = "Free", Price = 0, Duration = "Lifetime", FeaturesJson = "[\"1 CV mẫu cơ bản\", \"Xuất file PDF (có watermark)\", \"Lưu trữ 1 bản thảo\"]", IsActive = true },
                new SubscriptionPlan { Id = 2, Name = "Premium Monthly", Price = 199000, Duration = "Monthly", FeaturesJson = "[\"Truy cập toàn bộ 50+ CV mẫu\", \"Phân tích CV bằng AI (20 lần/tháng)\", \"Xuất file chất lượng cao (No watermark)\", \"Ưu tiên hỗ trợ 24/7\"]", IsActive = true },
                new SubscriptionPlan { Id = 3, Name = "Premium Yearly", Price = 1690000, Duration = "Yearly", FeaturesJson = "[\"Toàn bộ tính năng Premium Monthly\", \"Phân tích CV bằng AI (Không giới hạn)\", \"Tặng 1 buổi Review CV cùng chuyên gia\"]", IsActive = true }
            );

            modelBuilder.Entity<InterviewSession>()
                .HasMany(s => s.Questions)
                .WithOne()
                .HasForeignKey(q => q.SessionId);

            modelBuilder.Entity<CvTemplate>()
                .HasMany(t => t.Components)
                .WithOne(c => c.Template)
                .HasForeignKey(c => c.TemplateId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CvTemplate>()
                .HasMany(t => t.Containers)
                .WithOne(c => c.Template)
                .HasForeignKey(c => c.TemplateId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CvTemplateContainer>()
                .HasMany(c => c.Sections)
                .WithOne(s => s.Container)
                .HasForeignKey(s => s.ContainerId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<HrInterviewSession>()
                .HasMany(s => s.Questions)
                .WithOne()
                .HasForeignKey(q => q.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<HrInterviewSession>()
                .HasMany(s => s.Answers)
                .WithOne()
                .HasForeignKey(a => a.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<HrInterviewSession>()
                .HasMany(s => s.Drafts)
                .WithOne()
                .HasForeignKey(d => d.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<HrInterviewSession>()
                .HasOne(s => s.FinalResult)
                .WithOne()
                .HasForeignKey<HrInterviewEvaluation>(r => r.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<HrInterviewAnswer>()
                .HasOne(a => a.Evaluation)
                .WithOne()
                .HasForeignKey<HrInterviewQuestionEvaluation>(e => e.InterviewAnswerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<HrInterviewStrength>()
                .HasOne<HrInterviewEvaluation>()
                .WithMany(e => e.Strengths)
                .HasForeignKey(s => s.EvaluationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<HrInterviewImprovement>()
                .HasOne<HrInterviewEvaluation>()
                .WithMany(e => e.Improvements)
                .HasForeignKey(i => i.EvaluationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<HrInterviewRecommendedPractice>()
                .HasOne<HrInterviewEvaluation>()
                .WithMany(e => e.RecommendedPractices)
                .HasForeignKey(rp => rp.EvaluationId)
                .OnDelete(DeleteBehavior.Cascade);

            // ── Question Bank config ──
            modelBuilder.Entity<Question>(e =>
            {
                e.HasIndex(q => q.Status);
                e.HasIndex(q => q.Category);
                e.HasIndex(q => q.IsClientVisible);
                e.Property(q => q.Content).HasColumnType("nvarchar(max)");
                e.Property(q => q.ExpectedAnswerGuide).HasColumnType("nvarchar(max)");
                e.Property(q => q.ExampleAnswer).HasColumnType("nvarchar(max)");
            });

            modelBuilder.Entity<CodingProblem>(e =>
            {
                e.HasIndex(p => p.Status);
                e.HasIndex(p => p.Difficulty);
                e.HasIndex(p => p.IsClientVisible);
                e.Property(p => p.Description).HasColumnType("nvarchar(max)");
                e.Property(p => p.CategoriesJson).HasColumnType("nvarchar(max)");
                e.Property(p => p.ConstraintsJson).HasColumnType("nvarchar(max)");
                e.Property(p => p.ExamplesJson).HasColumnType("nvarchar(max)");
                e.Property(p => p.PublicTestCasesJson).HasColumnType("nvarchar(max)");
                e.Property(p => p.HiddenTestCasesJson).HasColumnType("nvarchar(max)");
                e.Property(p => p.SupportedLanguagesJson).HasColumnType("nvarchar(max)");
                e.Property(p => p.StarterCodeJson).HasColumnType("nvarchar(max)");
                e.Property(p => p.SolutionJson).HasColumnType("nvarchar(max)");
                e.Property(p => p.TargetSkillsJson).HasColumnType("nvarchar(max)");
            });

            modelBuilder.Entity<UserQuestionPracticeHistory>(e =>
            {
                e.HasIndex(h => new { h.UserId, h.QuestionId });
                e.HasOne(h => h.Question)
                 .WithMany()
                 .HasForeignKey(h => h.QuestionId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<CodingPracticeAttempt>(e =>
            {
                e.HasIndex(h => new { h.UserId, h.CodingProblemId });
                e.HasIndex(h => new { h.UserId, h.CodingProblemId, h.AttemptNumber });
                e.Property(h => h.SubmittedCode).HasColumnType("nvarchar(max)");
                e.Property(h => h.AiFeedbackJson).HasColumnType("nvarchar(max)");
                e.HasOne(h => h.CodingProblem)
                 .WithMany()
                 .HasForeignKey(h => h.CodingProblemId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserCodingProblemProgress>(e =>
            {
                e.HasIndex(h => new { h.UserId, h.CodingProblemId }).IsUnique();
                e.HasOne(h => h.CodingProblem)
                 .WithMany()
                 .HasForeignKey(h => h.CodingProblemId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<CodingAssessmentHistory>(e =>
            {
                e.HasIndex(h => new { h.UserId, h.InterviewSessionId });
                e.HasOne(h => h.CodingProblem)
                 .WithMany()
                 .HasForeignKey(h => h.CodingProblemId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<AiRequestLog>(e =>
            {
                e.Property(l => l.Feature).IsRequired();
                e.Property(l => l.RequestType).IsRequired();
                e.Property(l => l.Status).IsRequired();
                e.Property(l => l.UserName).HasMaxLength(200);
                e.Property(l => l.EstimatedCost).HasColumnType("decimal(18,2)");
                e.Property(l => l.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

                e.HasIndex(l => l.CreatedAt);
                e.HasIndex(l => l.Feature);
                e.HasIndex(l => l.Status);
                e.HasIndex(l => l.UserId);
            });

            // ── PracticeSession config ──
            modelBuilder.Entity<PracticeSession>(e =>
            {
                e.HasIndex(s => s.UserId);
                e.HasIndex(s => s.SkillType);
                e.HasIndex(s => s.CreatedAt);
                e.HasIndex(s => new { s.UserId, s.SkillType }); // Tìm nhanh session theo user + loại kỹ năng
                e.Property(s => s.LatestScore).HasColumnType("float");
                e.Property(s => s.BestScore).HasColumnType("float");
                e.Property(s => s.UserName).HasMaxLength(256);
                e.Property(s => s.Role).HasMaxLength(256);
                e.Property(s => s.SkillType).HasMaxLength(50).IsRequired();
                e.Property(s => s.Status).HasMaxLength(50);

                e.HasMany(s => s.Attempts)
                 .WithOne(a => a.Session)
                 .HasForeignKey(a => a.SessionId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // ── PracticeAttempt config ──
            modelBuilder.Entity<PracticeAttempt>(e =>
            {
                e.HasIndex(a => a.SessionId);
                e.HasIndex(a => a.Score);
                e.HasIndex(a => a.CreatedAt);
                e.Property(a => a.Score).HasColumnType("float");
                e.Property(a => a.Summary).HasColumnType("nvarchar(max)");

                e.HasMany(a => a.Questions)
                 .WithOne(q => q.Attempt)
                 .HasForeignKey(q => q.AttemptId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // ── PracticeAttemptQuestion config ──
            modelBuilder.Entity<PracticeAttemptQuestion>(e =>
            {
                e.HasIndex(q => q.AttemptId);
                e.HasIndex(q => q.Category);
                e.Property(q => q.Score).HasColumnType("float");
                e.Property(q => q.Question).HasColumnType("nvarchar(max)");
                e.Property(q => q.UserAnswer).HasColumnType("nvarchar(max)");
                e.Property(q => q.AiFeedback).HasColumnType("nvarchar(max)");
                e.Property(q => q.Category).HasMaxLength(100);
            });

            // ── CvTemplateSections config ──
            modelBuilder.Entity<CvTemplateSection>(e =>
            {
                e.HasIndex(s => s.TemplateId);
                e.HasIndex(s => s.OrderIndex);
                e.HasIndex(s => s.Status);
                e.HasQueryFilter(s => !s.IsDeleted); // Soft delete filter
                // Removed unique index with filter because IsSingleInstance is not on this table. 
                // Single-instance logic is handled in the Service layer.

                e.HasOne(s => s.Template)
                 .WithMany(t => t.Sections)
                 .HasForeignKey(s => s.TemplateId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(s => s.SectionDefinition)
                 .WithMany()
                 .HasForeignKey(s => s.SectionDefinitionId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ── CvSectionDefinition config and Seed Data ──
            modelBuilder.Entity<CvSectionDefinition>(e =>
            {
                e.HasIndex(d => d.Category);
            });

            var defPersonalId = Guid.Parse("10000000-0000-0000-0000-000000000001");
            var defSummaryId = Guid.Parse("10000000-0000-0000-0000-000000000002");
            var defExperienceId = Guid.Parse("10000000-0000-0000-0000-000000000003");
            var defEducationId = Guid.Parse("10000000-0000-0000-0000-000000000004");
            var defSkillsId = Guid.Parse("10000000-0000-0000-0000-000000000005");
            var defProjectsId = Guid.Parse("10000000-0000-0000-0000-000000000006");
            var defLanguagesId = Guid.Parse("10000000-0000-0000-0000-000000000007");
            var defCertificatesId = Guid.Parse("10000000-0000-0000-0000-000000000008");
            var defAwardsId = Guid.Parse("10000000-0000-0000-0000-000000000009");
            var defActivitiesId = Guid.Parse("10000000-0000-0000-0000-000000000010");
            var defReferencesId = Guid.Parse("10000000-0000-0000-0000-000000000011");
            var defCustomId = Guid.Parse("10000000-0000-0000-0000-000000000012");

            modelBuilder.Entity<CvSectionDefinition>().HasData(
                new CvSectionDefinition { Id = defPersonalId, SectionType = "PersonalInfo", Name = "Personal Information", Category = "Core", IsRequired = true, IsRepeatable = false, IsSingleInstance = true, SortOrder = 1 },
                new CvSectionDefinition { Id = defSummaryId, SectionType = "Summary", Name = "Professional Summary", Category = "Core", IsRequired = true, IsRepeatable = false, IsSingleInstance = true, SortOrder = 2 },
                new CvSectionDefinition { Id = defExperienceId, SectionType = "Experience", Name = "Experience", Category = "Core", IsRequired = true, IsRepeatable = true, IsSingleInstance = false, SortOrder = 3 },
                new CvSectionDefinition { Id = defEducationId, SectionType = "Education", Name = "Education", Category = "Core", IsRequired = true, IsRepeatable = true, IsSingleInstance = false, SortOrder = 4 },
                new CvSectionDefinition { Id = defSkillsId, SectionType = "Skills", Name = "Skills", Category = "Core", IsRequired = true, IsRepeatable = false, IsSingleInstance = true, SortOrder = 5 },
                
                new CvSectionDefinition { Id = defProjectsId, SectionType = "Projects", Name = "Projects", Category = "Optional", IsRequired = false, IsRepeatable = true, IsSingleInstance = false, SortOrder = 6 },
                new CvSectionDefinition { Id = defLanguagesId, SectionType = "Languages", Name = "Languages", Category = "Optional", IsRequired = false, IsRepeatable = true, IsSingleInstance = false, SortOrder = 7 },
                new CvSectionDefinition { Id = defCertificatesId, SectionType = "Certificates", Name = "Certificates", Category = "Optional", IsRequired = false, IsRepeatable = false, IsSingleInstance = true, SortOrder = 8 },
                new CvSectionDefinition { Id = defAwardsId, SectionType = "Awards", Name = "Awards", Category = "Optional", IsRequired = false, IsRepeatable = false, IsSingleInstance = true, SortOrder = 9 },
                new CvSectionDefinition { Id = defActivitiesId, SectionType = "Activities", Name = "Activities", Category = "Optional", IsRequired = false, IsRepeatable = false, IsSingleInstance = true, SortOrder = 10 },
                new CvSectionDefinition { Id = defReferencesId, SectionType = "References", Name = "References", Category = "Optional", IsRequired = false, IsRepeatable = false, IsSingleInstance = true, SortOrder = 11 },
                
                new CvSectionDefinition { Id = defCustomId, SectionType = "Custom", Name = "Custom Section", Category = "Custom", IsRequired = false, IsRepeatable = true, IsSingleInstance = false, SortOrder = 12 }
            );

            // ── CvTemplateComponent config ──
            modelBuilder.Entity<CvTemplateComponent>(e =>
            {
                e.HasIndex(c => c.TemplateId);
                e.HasIndex(c => c.SectionId);
                e.HasIndex(c => c.OrderIndex);
                e.HasQueryFilter(c => !c.IsDeleted);

                e.HasOne(c => c.Template)
                 .WithMany(t => t.Components)
                 .HasForeignKey(c => c.TemplateId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(c => c.Section)
                 .WithMany()
                 .HasForeignKey(c => c.SectionId)
                 .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(c => c.ParentComponent)
                 .WithMany(pc => pc.ChildComponents)
                 .HasForeignKey(c => c.ParentComponentId)
                 .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(c => c.ComponentDefinition)
                 .WithMany()
                 .HasForeignKey(c => c.ComponentDefinitionId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ── CvComponentDefinition config & Seed Data ──
            modelBuilder.Entity<CvComponentDefinition>(e =>
            {
                e.HasIndex(d => d.ComponentType);
                e.HasIndex(d => d.Category);
            });

            var compAvatarId = Guid.Parse("20000000-0000-0000-0000-000000000001");
            var compFullNameId = Guid.Parse("20000000-0000-0000-0000-000000000002");
            var compJobTitleId = Guid.Parse("20000000-0000-0000-0000-000000000003");
            var compContactRowId = Guid.Parse("20000000-0000-0000-0000-000000000004");
            var compExpCardId = Guid.Parse("20000000-0000-0000-0000-000000000005");
            var compTimelineId = Guid.Parse("20000000-0000-0000-0000-000000000006");
            var compAchievementId = Guid.Parse("20000000-0000-0000-0000-000000000007");
            var compTechTagsId = Guid.Parse("20000000-0000-0000-0000-000000000008");
            var compEduCardId = Guid.Parse("20000000-0000-0000-0000-000000000009");
            var compSkillTagsId = Guid.Parse("20000000-0000-0000-0000-000000000010");
            var compSkillProgressId = Guid.Parse("20000000-0000-0000-0000-000000000011");
            var compProjCardId = Guid.Parse("20000000-0000-0000-0000-000000000012");
            var compDividerId = Guid.Parse("20000000-0000-0000-0000-000000000013");
            var compContainerId = Guid.Parse("20000000-0000-0000-0000-000000000014");

            modelBuilder.Entity<CvComponentDefinition>().HasData(
                new CvComponentDefinition { Id = compAvatarId, ComponentType = "Avatar", Name = "Avatar", Category = "Personal", DefaultBindingPath = "Candidate.Avatar", SupportedVariantsJson = "[\"circle\", \"rounded\", \"square\"]", CompatibleSectionTypesJson = "[\"PersonalInfo\", \"Header\"]", IsBindable = true, IsRepeatable = false, SortOrder = 1 },
                new CvComponentDefinition { Id = compFullNameId, ComponentType = "FullName", Name = "Full Name", Category = "Personal", DefaultBindingPath = "Candidate.FullName", CompatibleSectionTypesJson = "[\"PersonalInfo\", \"Header\"]", IsBindable = true, SortOrder = 2 },
                new CvComponentDefinition { Id = compJobTitleId, ComponentType = "JobTitle", Name = "Job Title", Category = "Personal", DefaultBindingPath = "Candidate.JobTitle", CompatibleSectionTypesJson = "[\"PersonalInfo\", \"Header\"]", IsBindable = true, SortOrder = 3 },
                new CvComponentDefinition { Id = compContactRowId, ComponentType = "ContactRow", Name = "Contact Row", Category = "Personal", DefaultBindingPath = "Candidate.Contact", CompatibleSectionTypesJson = "[\"PersonalInfo\", \"Header\"]", IsBindable = true, SortOrder = 4 },
                
                new CvComponentDefinition { Id = compExpCardId, ComponentType = "ExperienceCard", Name = "Experience Card", Category = "Experience", DefaultBindingPath = "Candidate.Experiences", SupportedVariantsJson = "[\"compact\", \"timeline\", \"detailed\"]", CompatibleSectionTypesJson = "[\"Experience\"]", IsRepeatable = true, SortOrder = 5 },
                new CvComponentDefinition { Id = compTimelineId, ComponentType = "Timeline", Name = "Timeline", Category = "Experience", CompatibleSectionTypesJson = "[\"Experience\", \"Education\"]", SortOrder = 6 },
                new CvComponentDefinition { Id = compAchievementId, ComponentType = "AchievementList", Name = "Achievement List", Category = "Experience", CompatibleSectionTypesJson = "[\"Experience\", \"Projects\"]", SortOrder = 7 },
                new CvComponentDefinition { Id = compTechTagsId, ComponentType = "TechnologyTags", Name = "Technology Tags", Category = "Experience", CompatibleSectionTypesJson = "[\"Experience\", \"Projects\"]", SortOrder = 8 },
                
                new CvComponentDefinition { Id = compEduCardId, ComponentType = "EducationCard", Name = "Education Card", Category = "Education", DefaultBindingPath = "Candidate.Educations", CompatibleSectionTypesJson = "[\"Education\"]", IsRepeatable = true, SortOrder = 9 },
                
                new CvComponentDefinition { Id = compSkillTagsId, ComponentType = "SkillTags", Name = "Skill Tags", Category = "Skills", DefaultBindingPath = "Candidate.Skills", CompatibleSectionTypesJson = "[\"Skills\"]", SortOrder = 10 },
                new CvComponentDefinition { Id = compSkillProgressId, ComponentType = "SkillProgress", Name = "Skill Progress", Category = "Skills", DefaultBindingPath = "Candidate.Skills", CompatibleSectionTypesJson = "[\"Skills\"]", SortOrder = 11 },
                
                new CvComponentDefinition { Id = compProjCardId, ComponentType = "ProjectCard", Name = "Project Card", Category = "Projects", DefaultBindingPath = "Candidate.Projects", CompatibleSectionTypesJson = "[\"Projects\"]", SortOrder = 12 },
                
                new CvComponentDefinition { Id = compDividerId, ComponentType = "Divider", Name = "Divider", Category = "Decoration", CompatibleSectionTypesJson = "[\"PersonalInfo\", \"Summary\", \"Experience\", \"Education\", \"Skills\", \"Projects\", \"Certificates\", \"Languages\", \"Custom\"]", SortOrder = 13 },
                new CvComponentDefinition { Id = compContainerId, ComponentType = "Container", Name = "Container", Category = "Layout", CompatibleSectionTypesJson = "[\"PersonalInfo\", \"Summary\", \"Experience\", \"Education\", \"Skills\", \"Projects\", \"Certificates\", \"Languages\", \"Custom\"]", IsContainer = true, SortOrder = 14 }
            );

        }
    }
}
