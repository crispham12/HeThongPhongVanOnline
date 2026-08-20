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
using InterviewPro.API.Entities;

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
                // 1. Try parsing as INT (for Practice sessions)
                if (int.TryParse(sessionId, out int intId))
                {
                    // Check CodingPracticeAttempt
                    var codingSession = await _context.CodingPracticeAttempts
                        .Include(c => c.CodingProblem)
                        .AsNoTracking()
                        .FirstOrDefaultAsync(s => s.Id == intId);
                        
                    if (codingSession != null)
                    {
                        if (!isAdmin && codingSession.UserId != userId) throw new UnauthorizedAccessException("Forbidden.");
                        return MapCodingPracticeToDetail(codingSession);
                    }

                    // Check UserQuestionPracticeHistory
                    var questionSession = await _context.UserQuestionPracticeHistories
                        .Include(q => q.Question)
                        .AsNoTracking()
                        .FirstOrDefaultAsync(s => s.Id == intId);

                    if (questionSession != null)
                    {
                        if (!isAdmin && questionSession.UserId != userId) throw new UnauthorizedAccessException("Forbidden.");
                        return MapQuestionPracticeToDetail(questionSession);
                    }
                }
                
                // 2. Try parsing as Guid (for HR and Technical)
                // HR Sessions
                var hrSession = await _context.HrInterviewSessions
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

                if (hrSession != null)
                {
                    if (hrSession.IsDeleted) throw new InterviewArchivedException("This interview has been archived.");
                    if (!isAdmin && hrSession.UserId != userId) throw new UnauthorizedAccessException("Forbidden.");
                    if (hrSession.FinalResult == null) throw new InvalidOperationException("Interview has not been evaluated yet.");
                    return MapHrSessionToDetail(hrSession);
                }

                // Technical Sessions
                var techSession = await _context.TechnicalInterviewSessions
                    .AsNoTracking()
                    .Include(s => s.Questions)
                    .FirstOrDefaultAsync(s => s.SessionGuid == sessionId);

                if (techSession != null)
                {
                    if (!isAdmin && techSession.UserId != userId) throw new UnauthorizedAccessException("Forbidden.");
                    if (techSession.FinalFeedbackJson == null) throw new InvalidOperationException("Interview has not been evaluated yet.");
                    return MapTechnicalSessionToDetail(techSession);
                }

                _logger.LogWarning("Interview session {SessionId} not found.", sessionId);
                throw new KeyNotFoundException("Interview session not found.");
            }
            finally
            {
                sw.Stop();
                _logger.LogInformation("GetInterviewDetailAsync took {Elapsed}ms for session {SessionId}", sw.ElapsedMilliseconds, sessionId);
            }
        }

        private InterviewDetailResponseDto MapHrSessionToDetail(HrInterviewSession session)
        {
            var finalResult = session.FinalResult!;
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

            // Questions mapping
            var questionEvals = new List<InterviewDetailQuestionEvaluationDto>();
            foreach (var q in session.Questions.OrderBy(x => x.QuestionIndex))
            {
                var a = session.Answers.FirstOrDefault(x => x.QuestionId == q.Id);
                var eval = a?.Evaluation;

                if (eval != null)
                {
                    var sList = !string.IsNullOrEmpty(eval.Strengths) ? JsonSerializer.Deserialize<List<string>>(eval.Strengths) : new List<string>();
                    var wList = !string.IsNullOrEmpty(eval.Weaknesses) ? JsonSerializer.Deserialize<List<string>>(eval.Weaknesses) : new List<string>();
                    var suggList = !string.IsNullOrEmpty(eval.Suggestions) ? JsonSerializer.Deserialize<List<string>>(eval.Suggestions) : new List<string>();

                    questionEvals.Add(new InterviewDetailQuestionEvaluationDto
                    {
                        QuestionId = q.Id,
                        Question = q.QuestionText,
                        QuestionScore = Math.Round(eval.QuestionScore, 1),
                        StarScore = Math.Round(eval.StarScore, 1),
                        CommunicationScore = Math.Round(eval.CommunicationScore, 1),
                        ConfidenceScore = Math.Round(eval.ConfidenceScore, 1),
                        Transcript = a?.Transcript ?? "",
                        Duration = a?.DurationSeconds ?? 0,
                        WordCount = a?.WordCount ?? 0,
                        FillerWords = a?.FillerWords ?? 0,
                        CreatedAt = a?.CreatedAt ?? DateTime.UtcNow,
                        Strengths = sList ?? new List<string>(),
                        Weaknesses = wList ?? new List<string>(),
                        Suggestions = suggList ?? new List<string>()
                    });
                }
            }
            response.QuestionEvaluations = questionEvals;

            // Global STAR Analysis mapping
            var evaluatedAnswers = session.Answers.Where(a => a.Evaluation != null).Select(a => a.Evaluation).ToList();
            if (evaluatedAnswers.Any())
            {
                double avgS = evaluatedAnswers.Average(e => e.SituationScore);
                double avgT = evaluatedAnswers.Average(e => e.TaskScore);
                double avgA = evaluatedAnswers.Average(e => e.ActionScore);
                double avgR = evaluatedAnswers.Average(e => e.ResultScore);

                var minS_Eval = evaluatedAnswers.OrderBy(e => e.SituationScore).First();
                var minT_Eval = evaluatedAnswers.OrderBy(e => e.TaskScore).First();
                var minA_Eval = evaluatedAnswers.OrderBy(e => e.ActionScore).First();
                var minR_Eval = evaluatedAnswers.OrderBy(e => e.ResultScore).First();

                response.StarAnalysis = new InterviewDetailStarAnalysisDto
                {
                    Situation = new InterviewDetailStarAnalysisItemDto { Score = Math.Round(avgS, 1), Status = GetStatus(avgS), Feedback = minS_Eval.SituationFeedback },
                    Task = new InterviewDetailStarAnalysisItemDto { Score = Math.Round(avgT, 1), Status = GetStatus(avgT), Feedback = minT_Eval.TaskFeedback },
                    Action = new InterviewDetailStarAnalysisItemDto { Score = Math.Round(avgA, 1), Status = GetStatus(avgA), Feedback = minA_Eval.ActionFeedback },
                    Result = new InterviewDetailStarAnalysisItemDto { Score = Math.Round(avgR, 1), Status = GetStatus(avgR), Feedback = minR_Eval.ResultFeedback }
                };
            }
            else
            {
                response.StarAnalysis = null!;
            }

            return response;
        }

        private InterviewDetailResponseDto MapTechnicalSessionToDetail(TechnicalInterviewSession session)
        {
            double overallScore = Math.Round((double)session.OverallScore, 1);
            string overallStatus = overallScore >= 8.5 ? "Ready" : overallScore >= 7.0 ? "AlmostReady" : "NeedsImprovement";
            string hiringReadiness = overallScore >= 8.5 ? "Ready" : overallScore >= 7.0 ? "Almost Ready" : "Needs Improvement";

            var strengths = new List<InterviewDetailStrengthDto>();
            var improvements = new List<InterviewDetailImprovementDto>();
            string overallObservation = string.Empty;

            if (!string.IsNullOrEmpty(session.FinalFeedbackJson))
            {
                try
                {
                    using var doc = JsonDocument.Parse(session.FinalFeedbackJson);
                    var root = doc.RootElement;
                    if (root.TryGetProperty("strengths", out var strElem) && strElem.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in strElem.EnumerateArray())
                        {
                            strengths.Add(new InterviewDetailStrengthDto { Title = item.GetString() ?? "", Score = overallScore });
                        }
                    }
                    if (root.TryGetProperty("weaknesses", out var weakElem) && weakElem.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in weakElem.EnumerateArray())
                        {
                            improvements.Add(new InterviewDetailImprovementDto { Title = item.GetString() ?? "", Priority = "Medium" });
                        }
                    }
                    if (root.TryGetProperty("summary", out var sumElem))
                    {
                        overallObservation = sumElem.GetString() ?? "";
                    }
                }
                catch { }
            }

            var response = new InterviewDetailResponseDto
            {
                Summary = new InterviewDetailSummaryDto
                {
                    SessionId = session.SessionGuid,
                    InterviewType = "Technical",
                    Role = session.Role,
                    Level = session.Level,
                    InterviewDate = session.CompletedAt ?? session.StartedAt,
                    DurationMinutes = session.Questions.Sum(q => q.DurationSeconds) / 60,
                    QuestionsAnswered = session.Questions.Count(q => q.AnsweredAt != null),
                    TotalQuestions = session.Questions.Count,
                    OverallScore = overallScore,
                    OverallStatus = overallStatus,
                    HiringReadiness = hiringReadiness
                },
                Overall = new InterviewDetailOverallDto
                {
                    OverallScore = overallScore,
                    OverallStatus = overallStatus,
                    HiringReadiness = hiringReadiness,
                    Summary = overallObservation
                },
                ScoreBreakdown = null!,
                Strengths = strengths,
                Improvements = improvements,
                AiSummary = new InterviewDetailAiSummaryDto
                {
                    OverallObservation = overallObservation,
                    HiringRecommendation = hiringReadiness
                },
                StarAnalysis = null!
            };

            var questionEvals = new List<InterviewDetailQuestionEvaluationDto>();
            foreach (var q in session.Questions.OrderBy(x => x.Id))
            {
                if (q.AnsweredAt != null)
                {
                    var sList = new List<string>();
                    var wList = new List<string>();
                    var suggList = new List<string>();

                    if (!string.IsNullOrEmpty(q.FeedbackJson))
                    {
                        try {
                            using var doc = JsonDocument.Parse(q.FeedbackJson);
                            var root = doc.RootElement;
                            if (root.TryGetProperty("strengths", out var s) && s.ValueKind == JsonValueKind.Array)
                                foreach (var item in s.EnumerateArray()) sList.Add(item.GetString() ?? "");
                            if (root.TryGetProperty("weaknesses", out var w) && w.ValueKind == JsonValueKind.Array)
                                foreach (var item in w.EnumerateArray()) wList.Add(item.GetString() ?? "");
                            if (root.TryGetProperty("feedback", out var f))
                                suggList.Add(f.GetString() ?? "");
                        } catch {}
                    }

                    questionEvals.Add(new InterviewDetailQuestionEvaluationDto
                    {
                        QuestionId = q.Id,
                        Question = q.Content,
                        QuestionScore = Math.Round((double)q.Score, 1),
                        Transcript = q.CandidateAnswer ?? "",
                        Duration = q.DurationSeconds,
                        CreatedAt = q.AnsweredAt ?? DateTime.UtcNow,
                        Strengths = sList,
                        Weaknesses = wList,
                        Suggestions = suggList
                    });
                }
            }
            response.QuestionEvaluations = questionEvals;

            return response;
        }

        private InterviewDetailResponseDto MapCodingPracticeToDetail(CodingPracticeAttempt session)
        {
            double overallScore = Math.Round((double)(session.Score ?? 0) / 10.0, 1);
            string overallStatus = overallScore >= 8.5 ? "Ready" : overallScore >= 7.0 ? "AlmostReady" : "NeedsImprovement";
            string hiringReadiness = overallScore >= 8.5 ? "Ready" : overallScore >= 7.0 ? "Almost Ready" : "Needs Improvement";

            return new InterviewDetailResponseDto
            {
                Summary = new InterviewDetailSummaryDto
                {
                    SessionId = session.Id.ToString(),
                    InterviewType = "Coding Practice",
                    Role = "Software Engineer",
                    Level = session.CodingProblem?.Difficulty ?? "Medium",
                    InterviewDate = session.CreatedAt,
                    DurationMinutes = session.RuntimeMs.HasValue ? session.RuntimeMs.Value / 60000 : 0,
                    QuestionsAnswered = 1,
                    TotalQuestions = 1,
                    OverallScore = overallScore,
                    OverallStatus = overallStatus,
                    HiringReadiness = hiringReadiness
                },
                Overall = new InterviewDetailOverallDto
                {
                    OverallScore = overallScore,
                    OverallStatus = overallStatus,
                    HiringReadiness = hiringReadiness,
                    Summary = "Luyện tập lập trình: " + (session.CodingProblem?.Title ?? "")
                },
                ScoreBreakdown = null!,
                StarAnalysis = null!,
                QuestionEvaluations = new List<InterviewDetailQuestionEvaluationDto>
                {
                    new InterviewDetailQuestionEvaluationDto
                    {
                        QuestionId = session.Id,
                        Question = session.CodingProblem?.Title ?? "Coding Problem",
                        QuestionScore = overallScore,
                        Transcript = session.SubmittedCode ?? "",
                        CreatedAt = session.CreatedAt,
                        Suggestions = new List<string>()
                    }
                }
            };
        }

        private InterviewDetailResponseDto MapQuestionPracticeToDetail(UserQuestionPracticeHistory session)
        {
            double overallScore = Math.Round((double)(session.AiScore ?? 0.0f), 1);
            string overallStatus = overallScore >= 8.5 ? "Ready" : overallScore >= 7.0 ? "AlmostReady" : "NeedsImprovement";
            string hiringReadiness = overallScore >= 8.5 ? "Ready" : overallScore >= 7.0 ? "Almost Ready" : "Needs Improvement";

            var strengths = new List<InterviewDetailStrengthDto>();
            if (!string.IsNullOrEmpty(session.StrengthsJson))
            {
                try {
                    var sList = JsonSerializer.Deserialize<List<string>>(session.StrengthsJson);
                    if (sList != null) strengths.AddRange(sList.Select(s => new InterviewDetailStrengthDto { Title = s, Score = overallScore }));
                } catch {}
            }

            var improvements = new List<InterviewDetailImprovementDto>();
            if (!string.IsNullOrEmpty(session.WeaknessesJson))
            {
                try {
                    var wList = JsonSerializer.Deserialize<List<string>>(session.WeaknessesJson);
                    if (wList != null) improvements.AddRange(wList.Select(w => new InterviewDetailImprovementDto { Title = w, Priority = "Medium" }));
                } catch {}
            }

            return new InterviewDetailResponseDto
            {
                Summary = new InterviewDetailSummaryDto
                {
                    SessionId = session.Id.ToString(),
                    InterviewType = session.Question?.Category == "Technical" ? "Technical Practice" : "HR Practice",
                    Role = session.Question?.Role ?? "General",
                    Level = session.Question?.Difficulty ?? "Medium",
                    InterviewDate = session.CreatedAt,
                    DurationMinutes = 0,
                    QuestionsAnswered = 1,
                    TotalQuestions = 1,
                    OverallScore = overallScore,
                    OverallStatus = overallStatus,
                    HiringReadiness = hiringReadiness
                },
                Overall = new InterviewDetailOverallDto
                {
                    OverallScore = overallScore,
                    OverallStatus = overallStatus,
                    HiringReadiness = hiringReadiness,
                    Summary = session.AiFeedback ?? "Không có nhận xét."
                },
                ScoreBreakdown = null!,
                StarAnalysis = null!,
                Strengths = strengths,
                Improvements = improvements,
                AiSummary = new InterviewDetailAiSummaryDto
                {
                    OverallObservation = session.AiFeedback ?? "",
                    HiringRecommendation = hiringReadiness
                },
                QuestionEvaluations = new List<InterviewDetailQuestionEvaluationDto>
                {
                    new InterviewDetailQuestionEvaluationDto
                    {
                        QuestionId = session.Id,
                        Question = session.Question?.Content ?? "Practice Question",
                        QuestionScore = overallScore,
                        Transcript = session.UserAnswer ?? "",
                        CreatedAt = session.CreatedAt,
                        Strengths = strengths.Select(s => s.Title).ToList(),
                        Weaknesses = improvements.Select(i => i.Title).ToList(),
                        Suggestions = new List<string> { session.AiFeedback ?? "" }
                    }
                }
            };
        }

        private string GetStatus(double score)
        {
            if (score >= 8.5) return "Excellent";
            if (score >= 7.0) return "Good";
            if (score >= 5.0) return "Average";
            return "Poor";
        }
    }
}
