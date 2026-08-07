using Microsoft.EntityFrameworkCore;
using InterviewPro.API.Entities;

namespace InterviewPro.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // ── Existing Tables ──
        public DbSet<User> Users { get; set; }
        public DbSet<PaymentOrder> PaymentOrders { get; set; }
        public DbSet<InterviewSession> InterviewSessions { get; set; }
        public DbSet<InterviewQuestion> InterviewQuestions { get; set; }

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
        
        // ── Technical Interviews ──
        public DbSet<TechnicalInterviewSession> TechnicalInterviewSessions { get; set; }
        public DbSet<TechnicalInterviewQuestion> TechnicalInterviewQuestions { get; set; }

        // ── Coding Interviews ──
        public DbSet<CodingInterviewSession> CodingInterviewSessions { get; set; }
        public DbSet<CodingInterviewProblem> CodingInterviewProblems { get; set; }
        public DbSet<CodingInterviewStageLog> CodingInterviewStageLogs { get; set; }

        // ── Candidate Reports ──
        public DbSet<CandidateReport> CandidateReports { get; set; }
        public DbSet<HRReport> HRReports { get; set; }
        public DbSet<TechnicalReport> TechnicalReports { get; set; }
        public DbSet<CodingReport> CodingReports { get; set; }

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


        public DbSet<InterviewStrength> InterviewStrengths { get; set; }
        public DbSet<InterviewImprovement> InterviewImprovements { get; set; }
        public DbSet<InterviewStarAnalysis> InterviewStarAnalyses { get; set; }
        public DbSet<FullMockSession> FullMockSessions { get; set; }

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



            modelBuilder.Entity<InterviewSession>()
                .HasMany(s => s.Questions)
                .WithOne()
                .HasForeignKey(q => q.SessionId);


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
                
            modelBuilder.Entity<TechnicalInterviewSession>()
                .HasMany(s => s.Questions)
                .WithOne(q => q.Session)
                .HasForeignKey(q => q.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CodingInterviewSession>()
                .HasMany(s => s.Problems)
                .WithOne(p => p.Session)
                .HasForeignKey(p => p.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CodingInterviewProblem>()
                .HasMany(p => p.StageLogs)
                .WithOne(l => l.Problem)
                .HasForeignKey(l => l.ProblemId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CandidateReport>()
                .HasOne(r => r.HrReport)
                .WithOne(h => h.CandidateReport)
                .HasForeignKey<HRReport>(h => h.CandidateReportId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CandidateReport>()
                .HasOne(r => r.TechnicalReport)
                .WithOne(t => t.CandidateReport)
                .HasForeignKey<TechnicalReport>(t => t.CandidateReportId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CandidateReport>()
                .HasOne(r => r.CodingReport)
                .WithOne(c => c.CandidateReport)
                .HasForeignKey<CodingReport>(c => c.CandidateReportId)
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
                e.HasIndex(q => q.CreatedAt);
                e.Property(q => q.Content).HasColumnType("nvarchar(max)");
                e.Property(q => q.ExpectedAnswerGuide).HasColumnType("nvarchar(max)");
                e.Property(q => q.ExampleAnswer).HasColumnType("nvarchar(max)");
            });

            modelBuilder.Entity<CodingProblem>(e =>
            {
                e.HasIndex(p => p.Status);
                e.HasIndex(p => p.Difficulty);
                e.HasIndex(p => p.IsClientVisible);
                e.HasIndex(p => p.CreatedAt);
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
