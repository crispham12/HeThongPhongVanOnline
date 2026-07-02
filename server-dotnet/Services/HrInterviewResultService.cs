using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;

namespace InterviewPro.API.Services
{
    public interface IHRInterviewResultService
    {
        Task<HrInterviewResultResponseDto> GetResultAsync(string sessionGuid, int currentUserId, bool isAdmin);
    }

    public class HRInterviewResultService : IHRInterviewResultService
    {
        private readonly AppDbContext _context;

        public HRInterviewResultService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<HrInterviewResultResponseDto> GetResultAsync(string sessionGuid, int currentUserId, bool isAdmin)
        {
            // 1. Find Session
            var session = await _context.HrInterviewSessions
                .Include(s => s.Answers)
                .FirstOrDefaultAsync(s => s.SessionGuid == sessionGuid);

            if (session == null)
            {
                return null; // Will be handled as 404 in controller
            }

            // 2. Validate Ownership
            if (session.UserId != currentUserId && !isAdmin)
            {
                throw new UnauthorizedAccessException("You do not have permission to view this result.");
            }

            // 3. Check Session Status (Relaxed to avoid 409 Conflict)
            // Even if session is not "Completed", if the result exists we should return it,
            // or if it doesn't exist, we return IsReady = false.
            
            // 4. Find InterviewAnalysisResult
            var result = await _context.InterviewAnalysisResults
                .Include(r => r.Strengths)
                .Include(r => r.Improvements)
                .Include(r => r.StarAnalyses)
                .FirstOrDefaultAsync(r => r.SessionId == session.Id);

            if (result == null)
            {
                return new HrInterviewResultResponseDto
                {
                    SessionId = sessionGuid,
                    IsReady = false,
                    Message = "AI report is not ready yet."
                };
            }

            // 5. Build DTO
            var durationMinutes = session.CompletedAt.HasValue && session.CreatedAt != default
                ? (int)(session.CompletedAt.Value - session.CreatedAt).TotalMinutes
                : 0;

            var dto = new HrInterviewResultResponseDto
            {
                SessionId = sessionGuid,
                IsReady = true,
                Summary = new HrInterviewSummaryDto
                {
                    Role = session.Role,
                    InterviewType = "HR Interview", // Hardcoded per requirements
                    Level = session.Difficulty, // Mapping Difficulty to Level
                    DurationMinutes = durationMinutes > 0 ? durationMinutes : 15, // fallback
                    QuestionsAnswered = session.Answers.Count,
                    TotalQuestions = session.TotalQuestions,
                    InterviewDate = session.CompletedAt?.ToString("MMMM d, yyyy") ?? DateTime.UtcNow.ToString("MMMM d, yyyy"),
                    OverallStatus = result.OverallStatus
                },
                Overall = new HrInterviewOverallDto
                {
                    Score = result.OverallScore,
                    Status = GetScoreStatus(result.OverallScore),
                    SummaryText = result.SummaryText,
                    TopPercentile = result.TopPercentile,
                    HiringReadiness = GetHiringReadiness(result.OverallScore)
                },
                ScoreBreakdown = new System.Collections.Generic.List<HrInterviewScoreMetricDto>
                {
                    new HrInterviewScoreMetricDto { Name = "STAR Structure", Score = result.STARScore, Status = GetScoreStatus(result.STARScore) },
                    new HrInterviewScoreMetricDto { Name = "Communication", Score = result.CommunicationScore, Status = GetScoreStatus(result.CommunicationScore) },
                    new HrInterviewScoreMetricDto { Name = "Professionalism", Score = result.ProfessionalismScore, Status = GetScoreStatus(result.ProfessionalismScore) },
                    new HrInterviewScoreMetricDto { Name = "Confidence", Score = result.ConfidenceScore, Status = GetScoreStatus(result.ConfidenceScore) },
                    new HrInterviewScoreMetricDto { Name = "Logic", Score = result.LogicScore, Status = GetScoreStatus(result.LogicScore) },
                    new HrInterviewScoreMetricDto { Name = "Completeness", Score = result.CompletenessScore, Status = GetScoreStatus(result.CompletenessScore) },
                    new HrInterviewScoreMetricDto { Name = "Clarity", Score = result.ClarityScore, Status = GetScoreStatus(result.ClarityScore) }
                },
                Strengths = result.Strengths.OrderBy(s => s.OrderIndex).Select(s => new HrInterviewStrengthDto
                {
                    Title = s.Title,
                    Score = s.Score,
                    Status = GetScoreStatus(s.Score),
                    Description = s.Description
                }).ToList(),
                Improvements = result.Improvements.OrderBy(i => i.OrderIndex).Select(i => new HrInterviewImprovementDto
                {
                    Title = i.Title,
                    Score = i.Score,
                    Status = GetScoreStatus(i.Score),
                    Description = i.Description
                }).ToList(),
                StarAnalysis = result.StarAnalyses.OrderBy(sa => sa.OrderIndex).Select(sa => new HrInterviewStarAnalysisDto
                {
                    Name = sa.Name,
                    Score = sa.Score,
                    Status = GetScoreStatus(sa.Score),
                    Feedback = sa.Feedback
                }).ToList()
            };

            return dto;
        }

        private string GetScoreStatus(double score)
        {
            if (score >= 90) return "Strong";
            if (score >= 80) return "Good";
            if (score >= 70) return "Average";
            if (score >= 60) return "Weak";
            return "Critical";
        }

        private string GetHiringReadiness(double score)
        {
            if (score >= 85) return "Ready";
            if (score >= 70) return "Almost Ready";
            return "Needs Improvement";
        }
    }
}
