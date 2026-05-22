using Microsoft.EntityFrameworkCore;
using InterviewPro.API.Entities;

namespace InterviewPro.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<InterviewSession> InterviewSessions { get; set; }
        public DbSet<InterviewQuestion> InterviewQuestions { get; set; }
        public DbSet<UserCV> UserCVs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            
            modelBuilder.Entity<InterviewSession>()
                .HasMany(s => s.Questions)
                .WithOne()
                .HasForeignKey(q => q.SessionId);
        }
    }
}
