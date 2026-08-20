using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs.InterviewCompare;
using InterviewPro.API.Interfaces;
using Microsoft.Extensions.Logging;
using InterviewPro.API.Entities;

namespace InterviewPro.API.Services
{
    public class InterviewCompareService : IInterviewCompareService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<InterviewCompareService> _logger;

        public InterviewCompareService(AppDbContext context, ILogger<InterviewCompareService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<CompareInterviewResponseDto> CompareAsync(CompareInterviewRequestDto request, int currentUserId, bool isAdmin)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();

            if (request.InterviewAId == request.InterviewBId)
            {
                throw new ArgumentException("Cannot compare the same interview.");
            }

            // Try parsing as int for practice sessions
            if (int.TryParse(request.InterviewAId, out int intIdA) && int.TryParse(request.InterviewBId, out int intIdB))
            {
                var codingA = await _context.CodingPracticeAttempts.Include(c => c.CodingProblem).AsNoTracking().FirstOrDefaultAsync(c => c.Id == intIdA);
                if (codingA != null)
                {
                    var codingB = await _context.CodingPracticeAttempts.Include(c => c.CodingProblem).AsNoTracking().FirstOrDefaultAsync(c => c.Id == intIdB);
                    if (codingB == null) throw new KeyNotFoundException("Session B is not a Coding Practice session like Session A.");
                    
                    if (!isAdmin && (codingA.UserId != currentUserId || codingB.UserId != currentUserId))
                        throw new UnauthorizedAccessException("Forbidden to compare these sessions.");

                    return CompareCodingPractice(codingA, codingB);
                }

                var practiceA = await _context.UserQuestionPracticeHistories.Include(p => p.Question).AsNoTracking().FirstOrDefaultAsync(p => p.Id == intIdA);
                if (practiceA != null)
                {
                    var practiceB = await _context.UserQuestionPracticeHistories.Include(p => p.Question).AsNoTracking().FirstOrDefaultAsync(p => p.Id == intIdB);
                    if (practiceB == null) throw new KeyNotFoundException("Session B is not a Question Practice session like Session A.");

                    if (!isAdmin && (practiceA.UserId != currentUserId || practiceB.UserId != currentUserId))
                        throw new UnauthorizedAccessException("Forbidden to compare these sessions.");

                    return CompareQuestionPractice(practiceA, practiceB);
                }
            }
            else 
            {
                // Guid based sessions
                var hrA = await _context.HrInterviewSessions.Include(s => s.FinalResult!).ThenInclude(f => f.Strengths).Include(s => s.FinalResult!).ThenInclude(f => f.Improvements).AsNoTracking().FirstOrDefaultAsync(s => s.SessionGuid == request.InterviewAId && !s.IsDeleted);
                if (hrA != null)
                {
                    var hrB = await _context.HrInterviewSessions.Include(s => s.FinalResult!).ThenInclude(f => f.Strengths).Include(s => s.FinalResult!).ThenInclude(f => f.Improvements).AsNoTracking().FirstOrDefaultAsync(s => s.SessionGuid == request.InterviewBId && !s.IsDeleted);
                    if (hrB == null) throw new KeyNotFoundException("Session B is not an HR session like Session A.");
                    
                    if (!isAdmin && (hrA.UserId != currentUserId || hrB.UserId != currentUserId))
                        throw new UnauthorizedAccessException("Forbidden to compare these sessions.");

                    if (hrA.FinalResult == null || hrB.FinalResult == null)
                        throw new InvalidOperationException("Interview has not been evaluated yet.");

                    return CompareHrInterview(hrA, hrB);
                }

                var techA = await _context.TechnicalInterviewSessions.AsNoTracking().FirstOrDefaultAsync(s => s.SessionGuid == request.InterviewAId);
                if (techA != null)
                {
                    var techB = await _context.TechnicalInterviewSessions.AsNoTracking().FirstOrDefaultAsync(s => s.SessionGuid == request.InterviewBId);
                    if (techB == null) throw new KeyNotFoundException("Session B is not a Technical session like Session A.");
                    
                    if (!isAdmin && (techA.UserId != currentUserId || techB.UserId != currentUserId))
                        throw new UnauthorizedAccessException("Forbidden to compare these sessions.");

                    if (techA.FinalFeedbackJson == null || techB.FinalFeedbackJson == null)
                        throw new InvalidOperationException("Interview has not been evaluated yet.");

                    return CompareTechnicalInterview(techA, techB);
                }

                var fmQA = await _context.FullMockSessions.AsNoTracking().FirstOrDefaultAsync(s => s.SessionGuid == request.InterviewAId);
                if (fmQA != null)
                {
                    var fmQB = await _context.FullMockSessions.AsNoTracking().FirstOrDefaultAsync(s => s.SessionGuid == request.InterviewBId);
                    if (fmQB == null) throw new KeyNotFoundException("Session B is not a Full Mock session like Session A.");
                    
                    if (!isAdmin && (fmQA.UserId != currentUserId || fmQB.UserId != currentUserId))
                        throw new UnauthorizedAccessException("Forbidden to compare these sessions.");

                    var repA = await _context.CandidateReports.Include(r => r.HrReport).Include(r => r.TechnicalReport).Include(r => r.CodingReport).AsNoTracking().FirstOrDefaultAsync(r => r.SessionGuid == request.InterviewAId);
                    var repB = await _context.CandidateReports.Include(r => r.HrReport).Include(r => r.TechnicalReport).Include(r => r.CodingReport).AsNoTracking().FirstOrDefaultAsync(r => r.SessionGuid == request.InterviewBId);

                    if (repA == null || repB == null)
                        throw new InvalidOperationException("Interview has not been evaluated yet.");

                    return CompareFullMock(fmQA, fmQB, repA, repB);
                }
            }

            throw new KeyNotFoundException("Interview A not found or unsupported format.");
        }

        private CompareInterviewResponseDto CompareHrInterview(HrInterviewSession sessionA, HrInterviewSession sessionB)
        {
            var evalA = sessionA.FinalResult!;
            var evalB = sessionB.FinalResult!;

            var scoreA = Math.Round(evalA.OverallScore, 1);
            var scoreB = Math.Round(evalB.OverallScore, 1);
            var diff = Math.Round(scoreA - scoreB, 1);

            var response = new CompareInterviewResponseDto
            {
                InterviewA = new CompareInterviewSummaryDto
                {
                    SessionId = sessionA.SessionGuid,
                    Title = $"HR Interview · {sessionA.Role} · {(sessionA.CompletedAt ?? sessionA.CreatedAt).ToString("MMM dd, yyyy")}",
                    Type = "HR",
                    Role = sessionA.Role,
                    Level = sessionA.Difficulty,
                    Date = (sessionA.CompletedAt ?? sessionA.CreatedAt).ToString("yyyy-MM-dd"),
                    OverallScore = scoreA
                },
                InterviewB = new CompareInterviewSummaryDto
                {
                    SessionId = sessionB.SessionGuid,
                    Title = $"HR Interview · {sessionB.Role} · {(sessionB.CompletedAt ?? sessionB.CreatedAt).ToString("MMM dd, yyyy")}",
                    Type = "HR",
                    Role = sessionB.Role,
                    Level = sessionB.Difficulty,
                    Date = (sessionB.CompletedAt ?? sessionB.CreatedAt).ToString("yyyy-MM-dd"),
                    OverallScore = scoreB
                },
                OverallDifference = diff,
                BetterInterview = diff > 0 ? "A" : (diff < 0 ? "B" : "Equal")
            };

            var metrics = new List<CompareMetricDto>();
            AddMetric(metrics, "STAR", evalA.StarStructureScore, evalB.StarStructureScore);
            AddMetric(metrics, "Communication", evalA.CommunicationScore, evalB.CommunicationScore);
            AddMetric(metrics, "Professionalism", evalA.ProfessionalismScore, evalB.ProfessionalismScore);
            AddMetric(metrics, "Confidence", evalA.ConfidenceScore, evalB.ConfidenceScore);
            AddMetric(metrics, "Logic", evalA.LogicScore, evalB.LogicScore);
            AddMetric(metrics, "Completeness", evalA.CompletenessScore, evalB.CompletenessScore);
            AddMetric(metrics, "Clarity", evalA.ClarityScore, evalB.ClarityScore);

            response.Metrics = metrics;
            response.PracticeFocus = DeterminePracticeFocus(metrics);
            response.StrengthsComparison = BuildComparisonStrings(evalA.Strengths, evalB.Strengths, "stronger", "better");
            response.WeaknessesComparison = BuildWeaknessesComparison(evalA.Improvements, evalB.Improvements);

            return response;
        }

        private CompareInterviewResponseDto CompareTechnicalInterview(TechnicalInterviewSession sessionA, TechnicalInterviewSession sessionB)
        {
            var scoreA = Math.Round(sessionA.OverallScore, 1);
            var scoreB = Math.Round(sessionB.OverallScore, 1);
            var diff = Math.Round(scoreA - scoreB, 1);

            return new CompareInterviewResponseDto
            {
                InterviewA = new CompareInterviewSummaryDto
                {
                    SessionId = sessionA.SessionGuid,
                    Title = $"Technical · {sessionA.Role} · {(sessionA.CompletedAt ?? sessionA.StartedAt).ToString("MMM dd, yyyy")}",
                    Type = "Technical",
                    Role = sessionA.Role,
                    Level = sessionA.Level,
                    Date = (sessionA.CompletedAt ?? sessionA.StartedAt).ToString("yyyy-MM-dd"),
                    OverallScore = scoreA
                },
                InterviewB = new CompareInterviewSummaryDto
                {
                    SessionId = sessionB.SessionGuid,
                    Title = $"Technical · {sessionB.Role} · {(sessionB.CompletedAt ?? sessionB.StartedAt).ToString("MMM dd, yyyy")}",
                    Type = "Technical",
                    Role = sessionB.Role,
                    Level = sessionB.Level,
                    Date = (sessionB.CompletedAt ?? sessionB.StartedAt).ToString("yyyy-MM-dd"),
                    OverallScore = scoreB
                },
                OverallDifference = diff,
                BetterInterview = diff > 0 ? "A" : (diff < 0 ? "B" : "Equal"),
                Metrics = new List<CompareMetricDto>() // No fake metrics
            };
        }

        private CompareInterviewResponseDto CompareFullMock(FullMockSession sessionA, FullMockSession sessionB, CandidateReport repA, CandidateReport repB)
        {
            var scoreA = Math.Round(repA.OverallScore, 1);
            var scoreB = Math.Round(repB.OverallScore, 1);
            var diff = Math.Round(scoreA - scoreB, 1);

            var response = new CompareInterviewResponseDto
            {
                InterviewA = new CompareInterviewSummaryDto
                {
                    SessionId = sessionA.SessionGuid,
                    Title = $"Full Mock · {sessionA.Role} · {(sessionA.CompletedAt ?? sessionA.CreatedAt).ToString("MMM dd, yyyy")}",
                    Type = "FullMock",
                    Role = sessionA.Role,
                    Level = sessionA.Difficulty,
                    Date = (sessionA.CompletedAt ?? sessionA.CreatedAt).ToString("yyyy-MM-dd"),
                    OverallScore = scoreA
                },
                InterviewB = new CompareInterviewSummaryDto
                {
                    SessionId = sessionB.SessionGuid,
                    Title = $"Full Mock · {sessionB.Role} · {(sessionB.CompletedAt ?? sessionB.CreatedAt).ToString("MMM dd, yyyy")}",
                    Type = "FullMock",
                    Role = sessionB.Role,
                    Level = sessionB.Difficulty,
                    Date = (sessionB.CompletedAt ?? sessionB.CreatedAt).ToString("yyyy-MM-dd"),
                    OverallScore = scoreB
                },
                OverallDifference = diff,
                BetterInterview = diff > 0 ? "A" : (diff < 0 ? "B" : "Equal")
            };

            var metrics = new List<CompareMetricDto>();
            AddMetric(metrics, "HR Score", repA.HrReport?.OverallHrScore, repB.HrReport?.OverallHrScore);
            AddMetric(metrics, "Technical Score", repA.TechnicalReport?.OverallTechnicalScore, repB.TechnicalReport?.OverallTechnicalScore);
            AddMetric(metrics, "Coding Score", repA.CodingReport?.OverallCodingScore, repB.CodingReport?.OverallCodingScore);

            response.Metrics = metrics;
            return response;
        }

        private CompareInterviewResponseDto CompareCodingPractice(CodingPracticeAttempt sessionA, CodingPracticeAttempt sessionB)
        {
            var scoreA = Math.Round((double)(sessionA.Score ?? 0) / 10.0, 1);
            var scoreB = Math.Round((double)(sessionB.Score ?? 0) / 10.0, 1);
            var diff = Math.Round(scoreA - scoreB, 1);

            return new CompareInterviewResponseDto
            {
                InterviewA = new CompareInterviewSummaryDto
                {
                    SessionId = sessionA.Id.ToString(),
                    Title = $"Coding · {sessionA.CodingProblem?.Title ?? "Problem"} · {sessionA.CreatedAt.ToString("MMM dd, yyyy")}",
                    Type = "CodingPractice",
                    Role = "Coding",
                    Level = sessionA.CodingProblem?.Difficulty ?? "Medium",
                    Date = sessionA.CreatedAt.ToString("yyyy-MM-dd"),
                    OverallScore = scoreA
                },
                InterviewB = new CompareInterviewSummaryDto
                {
                    SessionId = sessionB.Id.ToString(),
                    Title = $"Coding · {sessionB.CodingProblem?.Title ?? "Problem"} · {sessionB.CreatedAt.ToString("MMM dd, yyyy")}",
                    Type = "CodingPractice",
                    Role = "Coding",
                    Level = sessionB.CodingProblem?.Difficulty ?? "Medium",
                    Date = sessionB.CreatedAt.ToString("yyyy-MM-dd"),
                    OverallScore = scoreB
                },
                OverallDifference = diff,
                BetterInterview = diff > 0 ? "A" : (diff < 0 ? "B" : "Equal"),
                Metrics = new List<CompareMetricDto>() // No fake metrics
            };
        }

        private CompareInterviewResponseDto CompareQuestionPractice(UserQuestionPracticeHistory sessionA, UserQuestionPracticeHistory sessionB)
        {
            var scoreA = Math.Round((double)(sessionA.AiScore ?? 0.0f), 1);
            var scoreB = Math.Round((double)(sessionB.AiScore ?? 0.0f), 1);
            var diff = Math.Round(scoreA - scoreB, 1);

            return new CompareInterviewResponseDto
            {
                InterviewA = new CompareInterviewSummaryDto
                {
                    SessionId = sessionA.Id.ToString(),
                    Title = $"Practice · {sessionA.Question?.Category ?? "Question"} · {sessionA.CreatedAt.ToString("MMM dd, yyyy")}",
                    Type = "QuestionPractice",
                    Role = "Practice",
                    Level = "Any",
                    Date = sessionA.CreatedAt.ToString("yyyy-MM-dd"),
                    OverallScore = scoreA
                },
                InterviewB = new CompareInterviewSummaryDto
                {
                    SessionId = sessionB.Id.ToString(),
                    Title = $"Practice · {sessionB.Question?.Category ?? "Question"} · {sessionB.CreatedAt.ToString("MMM dd, yyyy")}",
                    Type = "QuestionPractice",
                    Role = "Practice",
                    Level = "Any",
                    Date = sessionB.CreatedAt.ToString("yyyy-MM-dd"),
                    OverallScore = scoreB
                },
                OverallDifference = diff,
                BetterInterview = diff > 0 ? "A" : (diff < 0 ? "B" : "Equal"),
                Metrics = new List<CompareMetricDto>() // No fake metrics
            };
        }


        private void AddMetric(List<CompareMetricDto> metrics, string name, double? scoreA, double? scoreB)
        {
            var metric = new CompareMetricDto { Name = name, InterviewAScore = scoreA, InterviewBScore = scoreB };
            if (scoreA.HasValue && scoreB.HasValue)
            {
                metric.InterviewAScore = Math.Round(scoreA.Value, 1);
                metric.InterviewBScore = Math.Round(scoreB.Value, 1);
                metric.Difference = Math.Round(metric.InterviewAScore.Value - metric.InterviewBScore.Value, 1);
                
                if (metric.Difference > 0) metric.Trend = "up";
                else if (metric.Difference < 0) metric.Trend = "down";
                else metric.Trend = "same";
            }
            metrics.Add(metric);
        }

        private string DeterminePracticeFocus(List<CompareMetricDto> metrics)
        {
            var validMetrics = metrics.Where(m => m.InterviewAScore.HasValue && m.InterviewBScore.HasValue).ToList();
            if (!validMetrics.Any()) return "Maintain consistency";

            // 1. Lowest in A < 7.0
            var lowestA = validMetrics.OrderBy(m => m.InterviewAScore).First();
            if (lowestA.InterviewAScore < 7.0)
            {
                return lowestA.Name;
            }

            // 2. Biggest negative gap (A much worse than B)
            var biggestGap = validMetrics.OrderBy(m => m.Difference).First();
            if (biggestGap.Difference < 0)
            {
                return biggestGap.Name;
            }

            return "Maintain consistency";
        }

        private List<string> BuildComparisonStrings(IEnumerable<HrInterviewStrength> aStrengths, IEnumerable<HrInterviewStrength> bStrengths, string aAdj, string bAdj)
        {
            string strA = "Interview A: no recorded strengths.";
            if (aStrengths.Any())
            {
                var top = aStrengths.OrderByDescending(s => s.Score).Take(2).Select(s => s.Title.ToLower()).ToList();
                strA = $"Interview A: {aAdj} {string.Join(" and ", top)}.";
            }

            string strB = "Interview B: no recorded strengths.";
            if (bStrengths.Any())
            {
                var top = bStrengths.OrderByDescending(s => s.Score).Take(2).Select(s => s.Title.ToLower()).ToList();
                strB = $"Interview B: {bAdj} {string.Join(" and ", top)}.";
            }
            
            return new List<string> { strA, strB };
        }

        private List<string> BuildWeaknessesComparison(IEnumerable<HrInterviewImprovement> aImps, IEnumerable<HrInterviewImprovement> bImps)
        {
            string strA = "Interview A: no recorded weaknesses.";
            if (aImps.Any())
            {
                var top = aImps.OrderBy(i => i.Priority == "High" ? 1 : i.Priority == "Medium" ? 2 : 3).Take(2).Select(s => s.Title.ToLower()).ToList();
                strA = $"Interview A: needs better {string.Join(" and ", top)}.";
            }

            string strB = "Interview B: no recorded weaknesses.";
            if (bImps.Any())
            {
                var top = bImps.OrderBy(i => i.Priority == "High" ? 1 : i.Priority == "Medium" ? 2 : 3).Take(2).Select(s => s.Title.ToLower()).ToList();
                strB = $"Interview B: needs better {string.Join(" and ", top)}.";
            }
            
            return new List<string> { strA, strB };
        }
    }
}
