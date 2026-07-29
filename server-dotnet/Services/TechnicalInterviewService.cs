using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InterviewPro.API.Services
{
    public class TechnicalInterviewService : ITechnicalInterviewService
    {
        private readonly AppDbContext _db;
        private readonly ITechnicalAiClient _aiClient;

        public TechnicalInterviewService(AppDbContext db, ITechnicalAiClient aiClient)
        {
            _db = db;
            _aiClient = aiClient;
        }

        private string GetStage(int questionIndex)
        {
            if (questionIndex == 1) return "Warm-up";
            if (questionIndex <= 4) return "Core Knowledge";
            if (questionIndex <= 6) return "Applied Knowledge";
            if (questionIndex <= 9) return "Project Deep Dive";
            return "System Thinking";
        }

        public async Task<TechnicalInterviewSessionResponse> StartInterviewAsync(int userId, StartTechnicalInterviewRequest request)
        {
            // 1. Create Session
            var session = new TechnicalInterviewSession
            {
                UserId = userId,
                Role = request.Role,
                Level = request.Level,
                TechStack = request.TechStack,
                Status = "InProgress"
            };

            _db.TechnicalInterviewSessions.Add(session);
            await _db.SaveChangesAsync();

            // 2. Generate 1st Question (Warm-up)
            var aiReq = new AiGenerateQuestionRequest
            {
                role = request.Role,
                difficulty = request.Level,
                tech_stack = request.TechStack,
                stage = "Warm-up",
                question_index = 1,
                context = ""
            };

            var aiRes = await _aiClient.GenerateQuestionAsync(aiReq);
            if (aiRes == null) throw new Exception("Failed to generate the first question.");

            var question = new TechnicalInterviewQuestion
            {
                SessionId = session.Id,
                QuestionIndex = 1,
                Stage = "Warm-up",
                Content = aiRes.questionText,
                ExpectedAnswer = aiRes.expectedAnswerGuide
            };

            _db.TechnicalInterviewQuestions.Add(question);
            await _db.SaveChangesAsync();

            return new TechnicalInterviewSessionResponse
            {
                SessionId = session.SessionGuid,
                Status = session.Status,
                CurrentQuestion = new TechnicalQuestionDto
                {
                    QuestionIndex = 1,
                    Stage = "Warm-up",
                    Content = question.Content
                }
            };
        }

        public async Task<TechnicalInterviewSessionResponse> GetSessionAsync(int userId, string sessionId)
        {
            var session = await _db.TechnicalInterviewSessions
                .Include(s => s.Questions)
                .FirstOrDefaultAsync(s => s.UserId == userId && s.SessionGuid == sessionId);

            if (session == null) throw new KeyNotFoundException("Session not found");

            var response = new TechnicalInterviewSessionResponse
            {
                SessionId = session.SessionGuid,
                Status = session.Status,
                CompletedQuestions = session.Questions
                    .Where(q => q.AnsweredAt != null)
                    .OrderBy(q => q.QuestionIndex)
                    .Select(q => new TechnicalQuestionDto
                    {
                        QuestionIndex = q.QuestionIndex,
                        Stage = q.Stage,
                        Content = q.Content,
                        CandidateAnswer = q.CandidateAnswer
                    }).ToList()
            };

            var current = session.Questions.FirstOrDefault(q => q.AnsweredAt == null);
            if (current != null)
            {
                response.CurrentQuestion = new TechnicalQuestionDto
                {
                    QuestionIndex = current.QuestionIndex,
                    Stage = current.Stage,
                    Content = current.Content
                };
            }

            return response;
        }

        public async Task<TechnicalQuestionDto> SubmitAnswerAsync(int userId, string sessionId, SubmitTechnicalAnswerRequest request)
        {
            var session = await _db.TechnicalInterviewSessions
                .Include(s => s.Questions)
                .FirstOrDefaultAsync(s => s.UserId == userId && s.SessionGuid == sessionId);

            if (session == null) throw new KeyNotFoundException("Session not found");
            if (session.Status == "Completed") throw new InvalidOperationException("Session is already completed");

            var currentQuestion = session.Questions.FirstOrDefault(q => q.AnsweredAt == null);
            if (currentQuestion == null) throw new InvalidOperationException("No active question to answer");

            // 1. Evaluate Current Answer
            var evalReq = new AiEvaluateAnswerRequest
            {
                role = session.Role,
                difficulty = session.Level,
                tech_stack = session.TechStack,
                stage = currentQuestion.Stage,
                question = currentQuestion.Content,
                answer = request.Answer
            };

            var evalRes = await _aiClient.EvaluateAnswerAsync(evalReq);
            if (evalRes != null)
            {
                currentQuestion.Score = evalRes.scores.technicalKnowledge + evalRes.scores.problemSolving + 
                    evalRes.scores.practicalExperience + evalRes.scores.systemDesign + 
                    evalRes.scores.communication + evalRes.scores.bestPractices;
                currentQuestion.FeedbackJson = JsonSerializer.Serialize(evalRes);
            }

            currentQuestion.CandidateAnswer = request.Answer;
            currentQuestion.DurationSeconds = request.DurationSeconds;
            currentQuestion.AnsweredAt = DateTime.UtcNow;
            
            await _db.SaveChangesAsync();

            // 2. Determine Next Step
            if (currentQuestion.QuestionIndex < 10)
            {
                int nextIndex = currentQuestion.QuestionIndex + 1;
                string nextStage = GetStage(nextIndex);

                // Build context from previous answers
                var contextBuilder = new System.Text.StringBuilder();
                var answeredQs = session.Questions.Where(q => q.AnsweredAt != null).OrderBy(q => q.QuestionIndex);
                foreach(var q in answeredQs)
                {
                    contextBuilder.AppendLine($"Q{q.QuestionIndex} ({q.Stage}): {q.Content}");
                    contextBuilder.AppendLine($"A: {q.CandidateAnswer}");
                    contextBuilder.AppendLine("---");
                }

                var aiReq = new AiGenerateQuestionRequest
                {
                    role = session.Role,
                    difficulty = session.Level,
                    tech_stack = session.TechStack,
                    stage = nextStage,
                    question_index = nextIndex,
                    context = contextBuilder.ToString()
                };

                var nextQRes = await _aiClient.GenerateQuestionAsync(aiReq);
                var nextQ = new TechnicalInterviewQuestion
                {
                    SessionId = session.Id,
                    QuestionIndex = nextIndex,
                    Stage = nextStage,
                    Content = nextQRes?.questionText ?? "Please provide more details on your experience.",
                    ExpectedAnswer = nextQRes?.expectedAnswerGuide
                };

                _db.TechnicalInterviewQuestions.Add(nextQ);
                await _db.SaveChangesAsync();

                return new TechnicalQuestionDto
                {
                    QuestionIndex = nextQ.QuestionIndex,
                    Stage = nextQ.Stage,
                    Content = nextQ.Content
                };
            }
            else
            {
                session.Status = "Completed";
                session.CompletedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
                
                // Return a dummy object or null since no more questions
                return new TechnicalQuestionDto
                {
                    QuestionIndex = 11,
                    Stage = "Completed",
                    Content = "Interview Completed"
                };
            }
        }

        public async Task<AiFinalEvaluationResponse> GetResultAsync(int userId, string sessionId)
        {
            var session = await _db.TechnicalInterviewSessions
                .Include(s => s.Questions)
                .FirstOrDefaultAsync(s => s.UserId == userId && s.SessionGuid == sessionId);

            if (session == null) throw new KeyNotFoundException("Session not found");
            if (session.Status != "Completed") throw new InvalidOperationException("Session not completed yet");

            if (!string.IsNullOrEmpty(session.FinalFeedbackJson))
            {
                return JsonSerializer.Deserialize<AiFinalEvaluationResponse>(session.FinalFeedbackJson)!;
            }

            // Generate Final Report
            var transcriptBuilder = new System.Text.StringBuilder();
            var answeredQs = session.Questions.Where(q => q.AnsweredAt != null).OrderBy(q => q.QuestionIndex);
            foreach (var q in answeredQs)
            {
                transcriptBuilder.AppendLine($"Q{q.QuestionIndex} ({q.Stage}): {q.Content}");
                transcriptBuilder.AppendLine($"A: {q.CandidateAnswer}");
                if (!string.IsNullOrEmpty(q.FeedbackJson))
                {
                    var fb = JsonSerializer.Deserialize<AiEvaluateAnswerResponse>(q.FeedbackJson);
                    transcriptBuilder.AppendLine($"AI Feedback: {fb?.feedback}");
                }
                transcriptBuilder.AppendLine("---");
            }

            var aiReq = new AiFinalEvaluationRequest
            {
                role = session.Role,
                difficulty = session.Level,
                transcript = transcriptBuilder.ToString()
            };

            var finalRes = await _aiClient.FinalEvaluationAsync(aiReq);
            if (finalRes != null)
            {
                session.OverallScore = finalRes.overallScore;
                session.FinalFeedbackJson = JsonSerializer.Serialize(finalRes);
                await _db.SaveChangesAsync();
                return finalRes;
            }

            throw new Exception("Failed to generate final report");
        }
    }
}
