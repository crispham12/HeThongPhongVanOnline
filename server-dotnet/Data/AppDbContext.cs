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

        // ── Question Bank ──
        public DbSet<Question> Questions { get; set; }
        public DbSet<CodingProblem> CodingProblems { get; set; }
        public DbSet<UserQuestionPracticeHistory> UserQuestionPracticeHistories { get; set; }
        public DbSet<UserCodingPracticeHistory> UserCodingPracticeHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

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
                e.Property(p => p.TestCasesJson).HasColumnType("nvarchar(max)");
                e.Property(p => p.SolutionJson).HasColumnType("nvarchar(max)");
            });

            modelBuilder.Entity<UserQuestionPracticeHistory>(e =>
            {
                e.HasIndex(h => new { h.UserId, h.QuestionId });
                e.HasOne(h => h.Question)
                 .WithMany()
                 .HasForeignKey(h => h.QuestionId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserCodingPracticeHistory>(e =>
            {
                e.HasIndex(h => new { h.UserId, h.CodingProblemId });
                e.HasOne(h => h.CodingProblem)
                 .WithMany()
                 .HasForeignKey(h => h.CodingProblemId)
                 .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
