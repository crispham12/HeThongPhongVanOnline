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

            var sessions = await _context.HrInterviewSessions
                .AsNoTracking()
                .Include(s => s.FinalResult!)
                    .ThenInclude(f => f.Strengths)
                .Include(s => s.FinalResult!)
                    .ThenInclude(f => f.Improvements)
                .Where(s => (s.SessionGuid == request.InterviewAId || s.SessionGuid == request.InterviewBId) && !s.IsDeleted)
                .ToListAsync();

            var sessionA = sessions.FirstOrDefault(s => s.SessionGuid == request.InterviewAId);
            var sessionB = sessions.FirstOrDefault(s => s.SessionGuid == request.InterviewBId);

            if (sessionA == null || sessionB == null)
            {
                throw new KeyNotFoundException("One or both interviews not found.");
            }

            if (!isAdmin && (sessionA.UserId != currentUserId || sessionB.UserId != currentUserId))
            {
                throw new UnauthorizedAccessException("Forbidden to compare these interviews.");
            }

            if (sessionA.FinalResult == null || sessionB.FinalResult == null)
            {
                throw new InvalidOperationException("Interview has not been evaluated yet.");
            }

            var evalA = sessionA.FinalResult;
            var evalB = sessionB.FinalResult;

            var scoreA = Math.Round(evalA.OverallScore, 1);
            var scoreB = Math.Round(evalB.OverallScore, 1);
            var diff = Math.Round(scoreA - scoreB, 1);

            string betterInterview = diff > 0 ? "A" : (diff < 0 ? "B" : "Equal");

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
                BetterInterview = betterInterview
            };

            // Metrics
            var metrics = new List<CompareMetricDto>();

            AddMetric(metrics, "STAR", evalA.StarStructureScore, evalB.StarStructureScore);
            AddMetric(metrics, "Communication", evalA.CommunicationScore, evalB.CommunicationScore);
            AddMetric(metrics, "Professionalism", evalA.ProfessionalismScore, evalB.ProfessionalismScore);
            AddMetric(metrics, "Confidence", evalA.ConfidenceScore, evalB.ConfidenceScore);
            AddMetric(metrics, "Logic", evalA.LogicScore, evalB.LogicScore);
            AddMetric(metrics, "Completeness", evalA.CompletenessScore, evalB.CompletenessScore);
            AddMetric(metrics, "Clarity", evalA.ClarityScore, evalB.ClarityScore);

            response.Metrics = metrics;

            // Practice Focus
            response.PracticeFocus = DeterminePracticeFocus(metrics);

            // Strengths Comparison
            response.StrengthsComparison = BuildComparisonStrings(evalA.Strengths, evalB.Strengths, "stronger", "better");

            // Weaknesses Comparison
            response.WeaknessesComparison = BuildWeaknessesComparison(evalA.Improvements, evalB.Improvements);

            sw.Stop();
            _logger.LogInformation("Compared interviews {A} and {B} for user {UserId}. Elapsed={Elapsed}ms", request.InterviewAId, request.InterviewBId, currentUserId, sw.ElapsedMilliseconds);

            return response;
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
