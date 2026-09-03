using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/user-dashboard")]
    [Authorize]
    public class UserDashboardController : ControllerBase
    {
        private readonly AppDbContext _db;

        public UserDashboardController(AppDbContext db) => _db = db;

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException());

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                var userId = GetUserId();

                // Get HR sessions with results
                var hrSessions = await _db.HrInterviewSessions
                    .Include(s => s.FinalResult)
                    .Where(s => s.UserId == userId && s.FinalResult != null)
                    .Select(s => new {
                        Id = s.SessionGuid,
                        Role = s.Role,
                        Type = "HR Behavioral",
                        Level = s.Difficulty,
                        Score = (double)s.FinalResult.OverallScore,
                        CreatedAt = s.CreatedAt
                    })
                    .ToListAsync();

                // Get FullMock sessions
                var fmReports = await _db.CandidateReports
                    .Include(r => r.HrReport)
                    .Include(r => r.TechnicalReport)
                    .Include(r => r.CodingReport)
                    .Where(r => r.UserId == userId)
                    .ToListAsync();
                
                var fmSessionIds = fmReports.Select(r => r.SessionGuid).ToList();
                var fmSessions = await _db.FullMockSessions
                    .Where(s => fmSessionIds.Contains(s.SessionGuid))
                    .Select(s => new {
                        Id = s.SessionGuid,
                        Role = s.Role,
                        Type = "Full Mock",
                        Level = s.Difficulty,
                        Score = 0.0,
                        CreatedAt = s.CreatedAt
                    })
                    .ToListAsync();

                var fmList = fmSessions.Select(s => new {
                    Id = s.Id,
                    Role = s.Role,
                    Type = s.Type,
                    Level = s.Level,
                    Score = (double)(fmReports.FirstOrDefault(r => r.SessionGuid == s.Id)?.OverallScore ?? 0),
                    CreatedAt = s.CreatedAt
                });

                var combined = hrSessions.Concat(fmList)
                    .OrderByDescending(s => s.CreatedAt)
                    .ToList();

                int totalInterviews = combined.Count;
                double avgScore = totalInterviews > 0 ? combined.Average(s => s.Score) : 0;
                
                var recentHistory = combined.Take(5).Select(s => new InterviewDto(
                    Guid.Parse(s.Id), 
                    s.Role, 
                    s.Type, 
                    s.Level, 
                    "Completed", 
                    (int)Math.Round(s.Score * 10), // Convert from 10 to 100 scale for UI
                    s.CreatedAt
                )).ToList();

                // Calculate Streak
                var allDates = await _db.UserQuestionPracticeHistories
                    .Where(h => h.UserId == userId)
                    .Select(h => h.CreatedAt.Date)
                    .Union(_db.CodingPracticeAttempts
                        .Where(h => h.UserId == userId)
                        .Select(h => h.CreatedAt.Date))
                    .Union(_db.HrInterviewSessions
                        .Where(s => s.UserId == userId)
                        .Select(s => s.CreatedAt.Date))
                    .Distinct()
                    .OrderByDescending(d => d)
                    .ToListAsync();

                int streak = 0;
                var today = DateTime.UtcNow.Date;
                for (int i = 0; i < allDates.Count; i++)
                {
                    if (allDates[i] == today.AddDays(-i))
                    {
                        streak++;
                    }
                    else if (i == 0 && allDates[i] == today.AddDays(-1))
                    {
                        // User practiced yesterday but not today yet, streak continues
                        streak++;
                        today = today.AddDays(-1);
                    }
                    else
                    {
                        break;
                    }
                }

                // AverageScore is calculated out of 100%
                var finalAvgScore = Math.Round(avgScore * 10, 1);
                
                // Calculate SkillProgress and RadarData
                double avgHrScore = hrSessions.Any() ? hrSessions.Average(s => s.Score) : 0;
                
                // Aggregate from fmReports
                double techKnowledge = fmReports.Any(r => r.TechnicalReport != null) ? fmReports.Average(r => r.TechnicalReport.TechnicalKnowledgeScore) : 0;
                double problemSolving = fmReports.Any(r => r.TechnicalReport != null) ? fmReports.Average(r => r.TechnicalReport.ProblemSolvingScore) : 0;
                double systemThinking = fmReports.Any(r => r.TechnicalReport != null) ? fmReports.Average(r => r.TechnicalReport.SystemThinkingScore) : 0;
                double bestPractices = fmReports.Any(r => r.TechnicalReport != null) ? fmReports.Average(r => r.TechnicalReport.BestPracticesScore) : 0;
                double hrCommunication = fmReports.Any(r => r.HrReport != null) ? fmReports.Average(r => r.HrReport.CommunicationScore) : 0;
                double codingScore = fmReports.Any(r => r.CodingReport != null) ? fmReports.Average(r => r.CodingReport.OverallCodingScore) : 0;
                double motivationScore = fmReports.Any(r => r.HrReport != null) ? fmReports.Average(r => r.HrReport.MotivationScore) : 0;

                // Fallbacks if user hasn't done FullMock but has done HR
                if (hrCommunication == 0 && hrSessions.Any()) hrCommunication = avgHrScore;
                if (motivationScore == 0 && hrSessions.Any()) motivationScore = avgHrScore;

                var skillProgress = new List<ChartDataDto>
                {
                    new("Thái độ", (int)Math.Round((motivationScore > 0 ? motivationScore : 0) * 10)),
                    new("Kỹ thuật", (int)Math.Round((techKnowledge > 0 ? techKnowledge : 0) * 10)),
                    new("Tư duy", (int)Math.Round((problemSolving > 0 ? problemSolving : 0) * 10)),
                    new("Giao tiếp", (int)Math.Round((hrCommunication > 0 ? hrCommunication : 0) * 10)),
                    new("Code", (int)Math.Round((codingScore > 0 ? codingScore : 0) * 10))
                };

                var radarData = new List<RadarDataDto>
                {
                    new("Kỹ thuật", (int)Math.Round((techKnowledge > 0 ? techKnowledge : 0) * 10), 100),
                    new("Giải thuật", (int)Math.Round((problemSolving > 0 ? problemSolving : 0) * 10), 100),
                    new("Hệ thống", (int)Math.Round((systemThinking > 0 ? systemThinking : 0) * 10), 100),
                    new("Clean Code", (int)Math.Round((bestPractices > 0 ? bestPractices : 0) * 10), 100),
                    new("Soft Skills", (int)Math.Round((hrCommunication > 0 ? hrCommunication : 0) * 10), 100)
                };
                
                return Ok(new DashboardStatsDto(totalInterviews, finalAvgScore, streak, recentHistory, skillProgress, radarData));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
