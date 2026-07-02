using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs.InterviewDetail;
using InterviewPro.API.Interfaces;
using InterviewPro.API.Exceptions;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace InterviewPro.API.Services
{
    public class InterviewDetailService : IInterviewDetailService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<InterviewDetailService> _logger;

        public InterviewDetailService(AppDbContext context, ILogger<InterviewDetailService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<InterviewDetailResponseDto> GetInterviewDetailAsync(string sessionId, int userId, bool isAdmin)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();

            try
            {
                // Find Session using SessionGuid — query WITHOUT IsDeleted filter to distinguish archived vs truly not found
                var session = await _context.HrInterviewSessions
                    .AsNoTracking()
                    .Include(s => s.FinalResult!)
                        .ThenInclude(f => f.Strengths)
                    .Include(s => s.FinalResult!)
                        .ThenInclude(f => f.Improvements)
                    .Include(s => s.FinalResult!)
                        .ThenInclude(f => f.RecommendedPractices)
                    .Include(s => s.Questions)
                    .Include(s => s.Answers)
                        .ThenInclude(a => a.Evaluation)
                    .FirstOrDefaultAsync(s => s.SessionGuid == sessionId);

                if (session == null)
                {
                    _logger.LogWarning("Interview session {SessionId} not found.", sessionId);
                    throw new KeyNotFoundException("Interview session not found.");
                }

                // 410 Gone: session exists but is archived
                if (session.IsDeleted)
                {
                    _logger.LogWarning("Interview session {SessionId} is archived.", sessionId);
                    throw new InterviewArchivedException("This interview has been archived.");
                }

                if (!isAdmin && session.UserId != userId)
                {
                    _logger.LogWarning("User {UserId} unauthorized to access session {SessionId}", userId, sessionId);
                    throw new UnauthorizedAccessException("Forbidden.");
                }

                if (session.FinalResult == null)
                {
                    _logger.LogWarning("Interview session {SessionId} has not been evaluated yet.", sessionId);
                    throw new InvalidOperationException("Interview has not been evaluated yet.");
                }

                // Map to DTOs
                var finalResult = session.FinalResult;
                double overallScore = Math.Round(finalResult.OverallScore, 1);
                
                string hiringReadiness = finalResult.HiringReadiness;
                string overallStatus = finalResult.OverallStatus;
                
                if (string.IsNullOrEmpty(hiringReadiness) || string.IsNullOrEmpty(overallStatus))
                {
                    if (overallScore >= 8.5) { hiringReadiness = "Ready"; overallStatus = "Ready"; }
                    else if (overallScore >= 7.0) { hiringReadiness = "Almost Ready"; overallStatus = "AlmostReady"; }
                    else { hiringReadiness = "Needs Improvement"; overallStatus = "NeedsImprovement"; }
                }

                var response = new InterviewDetailResponseDto
                {
                    Summary = new InterviewDetailSummaryDto
                    {
                        SessionId = session.SessionGuid,
                        InterviewType = "HR",
                        Role = session.Role,
                        Level = session.Difficulty,
                        InterviewDate = session.CompletedAt ?? session.CreatedAt,
                        DurationMinutes = session.DurationMinutes,
                        QuestionsAnswered = session.AnsweredQuestions,
                        TotalQuestions = session.TotalQuestions,
                        OverallScore = overallScore,
                        OverallStatus = overallStatus,
                        HiringReadiness = hiringReadiness
                    },
                    Overall = new InterviewDetailOverallDto
                    {
                        OverallScore = overallScore,
                        OverallStatus = overallStatus,
                        HiringReadiness = hiringReadiness,
                        Summary = finalResult.OverallObservation
                    },
                    ScoreBreakdown = new InterviewDetailScoreBreakdownDto
                    {
                        StarStructure = Math.Round(finalResult.StarStructureScore, 1),
                        Communication = Math.Round(finalResult.CommunicationScore, 1),
                        Professionalism = Math.Round(finalResult.ProfessionalismScore, 1),
                        Confidence = Math.Round(finalResult.ConfidenceScore, 1),
                        Logic = Math.Round(finalResult.LogicScore, 1),
                        Completeness = Math.Round(finalResult.CompletenessScore, 1),
                        Clarity = Math.Round(finalResult.ClarityScore, 1)
                    },
                    Strengths = finalResult.Strengths.OrderByDescending(s => s.Score).Select(s => new InterviewDetailStrengthDto
                    {
                        Title = s.Title,
                        Score = Math.Round(s.Score, 1),
                        Status = s.Status,
                        Description = s.Description
                    }).ToList(),
                    Improvements = finalResult.Improvements
                        .OrderBy(i => i.Priority == "High" ? 1 : i.Priority == "Medium" ? 2 : 3)
                        .Select(i => new InterviewDetailImprovementDto
                        {
                            Title = i.Title,
                            Priority = i.Priority,
                            Description = i.Description
                        }).ToList(),
                    AiSummary = new InterviewDetailAiSummaryDto
                    {
                        OverallObservation = finalResult.OverallObservation,
                        StrengthsSummary = finalResult.StrengthSummary,
                        WeaknessesSummary = finalResult.WeaknessSummary,
                        HiringRecommendation = finalResult.HiringRecommendation
                    },
                    RecommendedPractices = finalResult.RecommendedPractices.Select(r => new InterviewDetailRecommendedPracticeDto
                    {
                        Title = r.Title,
                        EstimatedTime = r.EstimatedTime,
                        Difficulty = r.Difficulty,
                        RecommendedLevel = r.RecommendedLevel
                    }).ToList()
                };

                // Questions & Answers Mapping
                var questionEvals = new List<InterviewDetailQuestionEvaluationDto>();
                
                var orderedQuestions = session.Questions.OrderBy(q => q.QuestionIndex).ToList();
                foreach (var q in orderedQuestions)
                {
                    var ans = session.Answers.FirstOrDefault(a => a.QuestionId == q.Id);
                    var eval = ans?.Evaluation;

                    var qEvalDto = new InterviewDetailQuestionEvaluationDto
                    {
                        QuestionId = q.Id,
                        Question = q.QuestionText,
                        CreatedAt = q.CreatedAt
                    };

                    if (ans != null && eval != null)
                    {
                        qEvalDto.Transcript = ans.Transcript;
                        qEvalDto.Duration = ans.DurationSeconds;
                        qEvalDto.WordCount = ans.WordCount;
                        qEvalDto.FillerWords = ans.FillerWords;

                        qEvalDto.QuestionScore = Math.Round(eval.QuestionScore, 1);
                        qEvalDto.StarScore = Math.Round(eval.StarScore, 1);
                        qEvalDto.CommunicationScore = Math.Round(eval.CommunicationScore, 1);
                        qEvalDto.ConfidenceScore = Math.Round(eval.ConfidenceScore, 1);

                        qEvalDto.Strengths = SafeDeserializeList(eval.Strengths);
                        qEvalDto.Weaknesses = SafeDeserializeList(eval.Weaknesses);
                        qEvalDto.Suggestions = SafeDeserializeList(eval.Suggestions);
                    }

                    questionEvals.Add(qEvalDto);
                }

                response.QuestionEvaluations = questionEvals;

                // STAR Analysis computation
                // We'll average the S, T, A, R components across all evaluated questions
                var evaluatedAnswers = session.Answers.Where(a => a.Evaluation != null).Select(a => a.Evaluation!).ToList();
                if (evaluatedAnswers.Any())
                {
                    double avgS = evaluatedAnswers.Average(e => e.SituationScore);
                    double avgT = evaluatedAnswers.Average(e => e.TaskScore);
                    double avgA = evaluatedAnswers.Average(e => e.ActionScore);
                    double avgR = evaluatedAnswers.Average(e => e.ResultScore);

                    // Pick the feedback from the question that scored lowest on each to give constructive advice
                    var minS_Eval = evaluatedAnswers.OrderBy(e => e.SituationScore).First();
                    var minT_Eval = evaluatedAnswers.OrderBy(e => e.TaskScore).First();
                    var minA_Eval = evaluatedAnswers.OrderBy(e => e.ActionScore).First();
                    var minR_Eval = evaluatedAnswers.OrderBy(e => e.ResultScore).First();

                    response.StarAnalysis = new InterviewDetailStarAnalysisDto
                    {
                        Situation = new InterviewDetailStarAnalysisItemDto { Score = Math.Round(avgS, 1), Status = GetStatusFromScore(avgS), Feedback = minS_Eval.SituationFeedback },
                        Task = new InterviewDetailStarAnalysisItemDto { Score = Math.Round(avgT, 1), Status = GetStatusFromScore(avgT), Feedback = minT_Eval.TaskFeedback },
                        Action = new InterviewDetailStarAnalysisItemDto { Score = Math.Round(avgA, 1), Status = GetStatusFromScore(avgA), Feedback = minA_Eval.ActionFeedback },
                        Result = new InterviewDetailStarAnalysisItemDto { Score = Math.Round(avgR, 1), Status = GetStatusFromScore(avgR), Feedback = minR_Eval.ResultFeedback }
                    };
                }
                else
                {
                    // Fallback empty analysis
                    response.StarAnalysis = new InterviewDetailStarAnalysisDto();
                }

                sw.Stop();
                _logger.LogInformation("Fetched Interview Detail. UserId={UserId}, SessionId={SessionId}, ElapsedTime={Elapsed}ms", userId, sessionId, sw.ElapsedMilliseconds);

                return response;
            }
            catch (Exception ex) when (!(ex is UnauthorizedAccessException || ex is KeyNotFoundException || ex is InvalidOperationException || ex is InterviewArchivedException))
            {
                _logger.LogError(ex, "Unexpected error fetching Interview Detail for SessionId={SessionId}, UserId={UserId}", sessionId, userId);
                throw;
            }
        }

        private List<string> SafeDeserializeList(string json)
        {
            if (string.IsNullOrWhiteSpace(json) || json == "[]") return new List<string>();
            try
            {
                return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        private string GetStatusFromScore(double score)
        {
            if (score >= 8.5) return "Excellent";
            if (score >= 7.0) return "Good";
            if (score >= 5.0) return "Average";
            return "Needs Improvement";
        }
    }
}
