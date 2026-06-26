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
        public DbSet<HrInterviewSession> HrInterviewSessions { get; set; }
        public DbSet<HrInterviewQuestion> HrInterviewQuestions { get; set; }
        public DbSet<HrInterviewAnswer> HrInterviewAnswers { get; set; }
        public DbSet<HrInterviewFinalResult> HrInterviewFinalResults { get; set; }
        public DbSet<AiRequestLog> AiRequestLogs { get; set; }

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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

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
                .HasOne(s => s.FinalResult)
                .WithOne()
                .HasForeignKey<HrInterviewFinalResult>(r => r.SessionId)
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

        }
    }
}
