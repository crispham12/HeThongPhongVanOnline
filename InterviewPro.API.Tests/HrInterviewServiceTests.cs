using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Microsoft.Extensions.Logging;
using Xunit;
using InterviewPro.API.Data;
using InterviewPro.API.Entities;
using InterviewPro.API.Services;
using InterviewPro.API.Interfaces;
using InterviewPro.API.DTOs;

namespace InterviewPro.API.Tests
{
    public class HrInterviewServiceTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new AppDbContext(options);
        }

        [Fact]
        public async Task SubmitAnswerAsync_OnTenthAnswer_SuccessfullyParsesAndMapsEvaluation()
        {
            // Arrange
            var db = GetDbContext();
            
            var user = new User { Id = 1, Email = "test@test.com", Name = "Test User" };
            db.Users.Add(user);
            
            var session = new HrInterviewSession
            {
                Id = 1,
                SessionGuid = "test-session",
                UserId = 1,
                Role = "Backend Engineer",
                Difficulty = "Junior",
                Status = "InProgress",
                TotalQuestions = 10,
                CreatedAt = DateTime.UtcNow
            };
            db.HrInterviewSessions.Add(session);
            
            // Add 10 questions and 9 answers
            for(int i = 1; i <= 10; i++)
            {
                db.HrInterviewQuestions.Add(new HrInterviewQuestion
                {
                    Id = i,
                    SessionId = 1,
                    QuestionGuid = $"test-question-{i}",
                    QuestionIndex = i,
                    QuestionText = "Describe a challenge",
                    ExpectedAnswerGuide = "STAR method",
                    Category = "Problem Solving"
                });

                if (i < 10) 
                {
                    db.HrInterviewAnswers.Add(new HrInterviewAnswer
                    {
                        Id = i,
                        SessionId = 1,
                        QuestionId = i,
                        AnswerText = "I faced a challenge",
                        Transcript = "I faced a challenge",
                        SubmittedAt = DateTime.UtcNow
                    });
                }
            }
            
            await db.SaveChangesAsync();

            var mockAiClient = new Mock<IHrAiClient>();
            var mockDataService = new Mock<IInterviewDataService>();
            var mockCreditService = new Mock<ICreditService>();
            var mockQuestionBankService = new Mock<IHrQuestionBankService>();
            var mockLogger = new Mock<ILogger<HrInterviewService>>();

            var mockFinalResult = new HrFinalResultResponse
            {
                SessionId = "test-session",
                OverallScore = 8.5,
                CompositeScores = new CompositeScoresDto
                {
                    StarStructureScore = 8.0,
                    CommunicationScore = 9.0
                },
                QuestionEvaluations = new List<HrQuestionEvaluationDto>
                {
                    new HrQuestionEvaluationDto
                    {
                        QuestionIndex = 1,
                        QuestionScore = 8.5,
                        Strengths = new List<string> { "Good structure" }
                    }
                },
                Strengths = new List<HrStrengthDto>
                {
                    new HrStrengthDto { Title = "Communication", Score = 9.0, Description = "Very clear" }
                },
                Improvements = new List<HrImprovementDto>
                {
                    new HrImprovementDto { Title = "STAR method", Priority = "High" }
                },
                OverallObservation = "Good candidate",
                ReadinessLevel = "Ready"
            };

            mockAiClient.Setup(x => x.GenerateHrFinalResultAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<List<AiAnswerSummary>>()))
                .ReturnsAsync(mockFinalResult);

            var service = new HrInterviewService(db, mockAiClient.Object, mockDataService.Object, mockCreditService.Object, mockQuestionBankService.Object, mockLogger.Object);

            var submitReq = new SubmitHrAnswerRequest
            {
                QuestionId = "test-question-10",
                AnswerText = "My final answer is very long and detailed to pass validation minimum length rule 20 characters.",
                DurationSeconds = 60,
                WordCount = 20,
                FillerWords = 0
            };

            // Act
            var result = await service.SubmitAnswerAsync(1, "test-session", submitReq);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.IsCompleted);
            Assert.NotNull(result.FinalResult);
            Assert.Equal(8.5, result.FinalResult.OverallScore);
            
            // Verify DB updates
            var dbSession = await db.HrInterviewSessions.Include(s => s.FinalResult).FirstOrDefaultAsync(s => s.Id == 1);
            Assert.Equal("Completed", dbSession.Status);
            Assert.Equal(8.5, dbSession.FinalScore);
            Assert.NotNull(dbSession.FinalResult);
            Assert.Equal("Good candidate", dbSession.FinalResult.OverallObservation);
            Assert.Equal(8.0, dbSession.FinalResult.StarStructureScore);
            
            var dbQuestionEval = await db.HrInterviewQuestionEvaluations.FirstOrDefaultAsync(q => q.InterviewAnswerId == 10);
            Assert.Null(dbQuestionEval); // The mock doesn't map Question 10, it mapped QuestionIndex = 1, so answer 1 should have it:
            var dbQuestionEval1 = await db.HrInterviewQuestionEvaluations.FirstOrDefaultAsync(q => q.InterviewAnswerId == 1);
            Assert.NotNull(dbQuestionEval1);
            Assert.Equal(8.5, dbQuestionEval1.QuestionScore);
            Assert.Contains("Good structure", dbQuestionEval1.Strengths);
            
            var dbStrength = await db.HrInterviewStrengths.FirstOrDefaultAsync(s => s.EvaluationId == dbSession.FinalResult.Id);
            Assert.NotNull(dbStrength);
            Assert.Equal("Communication", dbStrength.Title);
            Assert.Equal(9.0, dbStrength.Score);
            
            var dbImprovement = await db.HrInterviewImprovements.FirstOrDefaultAsync(i => i.EvaluationId == dbSession.FinalResult.Id);
            Assert.NotNull(dbImprovement);
            Assert.Equal("STAR method", dbImprovement.Title);
        }
    }
}
