using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace InterviewPro.API.Controllers
{
    /// <summary>
    /// Client-facing practice progress aggregation.
    /// </summary>
    [ApiController]
    [Route("api/practice/progress")]
    [Authorize]
    public class PracticeProgressController : ControllerBase
    {
        private readonly AppDbContext _db;

        public PracticeProgressController(AppDbContext db) => _db = db;

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException());

        // ─────────────────────────────────────────────
        // GET /api/practice/progress
        // ─────────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetProgress()
        {
            var userId = GetUserId();

            // Totals available to client
            var hrTotal = await _db.Questions
                .CountAsync(q => q.Status == "Published" && q.IsClientVisible && q.Category == "HR");
            var techTotal = await _db.Questions
                .CountAsync(q => q.Status == "Published" && q.IsClientVisible && q.Category == "Technical");
            var codingTotal = await _db.CodingProblems
                .CountAsync(p => p.Status == "Published" && p.IsClientVisible);

            // User's practiced counts (distinct questions)
            var practicedQuestionIds = await _db.UserQuestionPracticeHistories
                .Where(h => h.UserId == userId)
                .Select(h => h.QuestionId)
                .Distinct()
                .ToListAsync();

            var practicedHrCount = await _db.Questions
                .CountAsync(q => q.Category == "HR" && practicedQuestionIds.Contains(q.Id));
            var practicedTechCount = await _db.Questions
                .CountAsync(q => q.Category == "Technical" && practicedQuestionIds.Contains(q.Id));

            var practicedCodingCount = await _db.UserCodingPracticeHistories
                .Where(h => h.UserId == userId)
                .Select(h => h.CodingProblemId)
                .Distinct()
                .CountAsync();

            // Daily streak: count consecutive days with at least 1 practice activity
            var allDates = await _db.UserQuestionPracticeHistories
                .Where(h => h.UserId == userId)
                .Select(h => h.CreatedAt.Date)
                .Union(_db.UserCodingPracticeHistories
                    .Where(h => h.UserId == userId)
                    .Select(h => h.CreatedAt.Date))
                .Distinct()
                .OrderByDescending(d => d)
                .ToListAsync();

            int streak = 0;
            var today = DateTime.UtcNow.Date;
            for (int i = 0; i < allDates.Count; i++)
            {
                var expected = today.AddDays(-i);
                if (allDates.Count > i && allDates[i] == expected)
                    streak++;
                else
                    break;
            }

            return Ok(new PracticeProgressDto
            {
                TotalPracticed = practicedQuestionIds.Count + practicedCodingCount,
                HrPracticed = practicedHrCount,
                HrTotal = hrTotal,
                TechnicalPracticed = practicedTechCount,
                TechnicalTotal = techTotal,
                CodingPracticed = practicedCodingCount,
                CodingTotal = codingTotal,
                DailyStreak = streak
            });
        }
    }
}
