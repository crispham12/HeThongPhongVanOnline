using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using InterviewPro.API.Data;
using InterviewPro.API.Entities;
using InterviewPro.API.Services;

namespace InterviewPro.API.Tests
{
    public class HRInterviewResultServiceTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new AppDbContext(options);
        }

        private async Task SeedData(AppDbContext context, string sessionId, int userId, string status, bool withResult = true)
        {
            var session = new HrInterviewSession
            {
                SessionGuid = sessionId,
                UserId = userId,
                Status = status,
                Role = "Backend Developer",
                Difficulty = "Fresher",
                TotalQuestions = 10,
                CreatedAt = DateTime.UtcNow.AddMinutes(-30),
                CompletedAt = status == "Completed" ? DateTime.UtcNow : null
            };
            
            // Add a mock answer
            session.Answers.Add(new HrInterviewAnswer { Transcript = "Test" });

            context.HrInterviewSessions.Add(session);
            await context.SaveChangesAsync();

            if (withResult)
            {
                var result = new InterviewAnalysisResult
                {
                    SessionId = session.Id,
                    OverallScore = 85,
                    STARScore = 80,
                    CommunicationScore = 90,
                    ProfessionalismScore = 88,
                    ConfidenceScore = 82,
                    LogicScore = 85,
                    CompletenessScore = 75,
                    ClarityScore = 88,
                    OverallStatus = "Ready",
                    SummaryText = "Good job",
                    Strengths = new List<InterviewStrength>
                    {
                        new InterviewStrength { Title = "Strength 2", Score = 90, OrderIndex = 2 },
                        new InterviewStrength { Title = "Strength 1", Score = 95, OrderIndex = 1 }
                    },
                    Improvements = new List<InterviewImprovement>
                    {
                        new InterviewImprovement { Title = "Imp 2", Score = 60, OrderIndex = 2 },
                        new InterviewImprovement { Title = "Imp 1", Score = 50, OrderIndex = 1 }
                    },
                    StarAnalyses = new List<InterviewStarAnalysis>
                    {
                        new InterviewStarAnalysis { Name = "Task", OrderIndex = 2 },
                        new InterviewStarAnalysis { Name = "Action", OrderIndex = 3 },
                        new InterviewStarAnalysis { Name = "Situation", OrderIndex = 1 },
                        new InterviewStarAnalysis { Name = "Result", OrderIndex = 4 }
                    }
                };
                context.InterviewAnalysisResults.Add(result);
                await context.SaveChangesAsync();
            }
        }

        [Fact]
        public async Task GetResultAsync_OwnerCanViewResult()
        {
            var db = GetDbContext();
            await SeedData(db, "session1", 1, "Completed");
            var service = new HRInterviewResultService(db);

            var result = await service.GetResultAsync("session1", 1, false);

            Assert.NotNull(result);
            Assert.True(result.IsReady);
            Assert.Equal("session1", result.SessionId);
        }

        [Fact]
        public async Task GetResultAsync_OtherUserCannotViewResult()
        {
            var db = GetDbContext();
            await SeedData(db, "session2", 1, "Completed");
            var service = new HRInterviewResultService(db);

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.GetResultAsync("session2", 2, false));
        }

        [Fact]
        public async Task GetResultAsync_AdminCanViewResult()
        {
            var db = GetDbContext();
            await SeedData(db, "session3", 1, "Completed");
            var service = new HRInterviewResultService(db);

            var result = await service.GetResultAsync("session3", 2, true);

            Assert.NotNull(result);
            Assert.True(result.IsReady);
        }

        [Fact]
        public async Task GetResultAsync_SessionNotFound_ReturnsNull()
        {
            var db = GetDbContext();
            var service = new HRInterviewResultService(db);

            var result = await service.GetResultAsync("non_existent", 1, false);

            Assert.Null(result);
        }

        [Fact]
        public async Task GetResultAsync_SessionNotCompleted_ReturnsIsReadyFalse()
        {
            var db = GetDbContext();
            await SeedData(db, "session4", 1, "InProgress", withResult: false);
            var service = new HRInterviewResultService(db);

            var result = await service.GetResultAsync("session4", 1, false);

            Assert.NotNull(result);
            Assert.False(result.IsReady);
            Assert.Equal("AI report is not ready yet.", result.Message);
        }

        [Fact]
        public async Task GetResultAsync_ResultNotReady_ReturnsIsReadyFalse()
        {
            var db = GetDbContext();
            await SeedData(db, "session5", 1, "Completed", withResult: false);
            var service = new HRInterviewResultService(db);

            var result = await service.GetResultAsync("session5", 1, false);

            Assert.NotNull(result);
            Assert.False(result.IsReady);
            Assert.Equal("AI report is not ready yet.", result.Message);
        }

        [Fact]
        public async Task GetResultAsync_ScoreBreakdownMapsCorrectly()
        {
            var db = GetDbContext();
            await SeedData(db, "session6", 1, "Completed");
            var service = new HRInterviewResultService(db);

            var result = await service.GetResultAsync("session6", 1, false);

            Assert.NotNull(result.ScoreBreakdown);
            Assert.Equal(7, result.ScoreBreakdown.Count);
            Assert.Contains(result.ScoreBreakdown, s => s.Name == "Communication" && s.Score == 90 && s.Status == "Strong");
            Assert.Contains(result.ScoreBreakdown, s => s.Name == "Completeness" && s.Score == 75 && s.Status == "Average");
        }

        [Fact]
        public async Task GetResultAsync_StrengthsOrderedByOrderIndex()
        {
            var db = GetDbContext();
            await SeedData(db, "session7", 1, "Completed");
            var service = new HRInterviewResultService(db);

            var result = await service.GetResultAsync("session7", 1, false);

            Assert.Equal("Strength 1", result.Strengths[0].Title);
            Assert.Equal("Strength 2", result.Strengths[1].Title);
        }

        [Fact]
        public async Task GetResultAsync_ImprovementsOrderedByOrderIndex()
        {
            var db = GetDbContext();
            await SeedData(db, "session8", 1, "Completed");
            var service = new HRInterviewResultService(db);

            var result = await service.GetResultAsync("session8", 1, false);

            Assert.Equal("Imp 1", result.Improvements[0].Title);
            Assert.Equal("Imp 2", result.Improvements[1].Title);
        }

        [Fact]
        public async Task GetResultAsync_StarAnalysisOrderedByOrderIndex()
        {
            var db = GetDbContext();
            await SeedData(db, "session9", 1, "Completed");
            var service = new HRInterviewResultService(db);

            var result = await service.GetResultAsync("session9", 1, false);

            Assert.Equal("Situation", result.StarAnalysis[0].Name);
            Assert.Equal("Task", result.StarAnalysis[1].Name);
            Assert.Equal("Action", result.StarAnalysis[2].Name);
            Assert.Equal("Result", result.StarAnalysis[3].Name);
        }
    }
}
