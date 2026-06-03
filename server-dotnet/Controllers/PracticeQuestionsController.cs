using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace InterviewPro.API.Controllers
{
    /// <summary>
    /// Client-facing Practice Questions API.
    /// Only returns Status=Published AND IsClientVisible=true questions.
    /// </summary>
    [ApiController]
    [Route("api/practice/questions")]
    [Authorize]
    public class PracticeQuestionsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public PracticeQuestionsController(AppDbContext db) => _db = db;

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException());

        // ─────────────────────────────────────────────
        // GET /api/practice/questions
        // Filter: category, role, difficulty, search, page, pageSize
        // ─────────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetList(
            [FromQuery] string? category,
            [FromQuery] string? role,
            [FromQuery] string? difficulty,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = GetUserId();

            // Base query: ONLY published + client-visible
            var query = _db.Questions
                .Where(q => q.Status == "Published" && q.IsClientVisible);

            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(q => q.Category == category);
            if (!string.IsNullOrWhiteSpace(role))
                query = query.Where(q => q.Role.Contains(role));
            if (!string.IsNullOrWhiteSpace(difficulty))
                query = query.Where(q => q.Difficulty == difficulty);
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(q =>
                    q.Title.Contains(search) || q.Content.Contains(search));

            var total = await query.CountAsync();

            var questionIds = await query
                .OrderByDescending(q => q.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(q => q.Id)
                .ToListAsync();

            // Get this user's practice history for these questions
            var practiceMap = await _db.UserQuestionPracticeHistories
                .Where(h => h.UserId == userId && questionIds.Contains(h.QuestionId))
                .GroupBy(h => h.QuestionId)
                .Select(g => new { QuestionId = g.Key, Status = g.OrderByDescending(h => h.CreatedAt).First().PracticeStatus })
                .ToDictionaryAsync(x => x.QuestionId, x => x.Status);

            var questions = await query
                .OrderByDescending(q => q.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(q => new QuestionListItemDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Content = q.Content,
                    Category = q.Category,
                    Role = q.Role,
                    Difficulty = q.Difficulty,
                    TagsJson = q.TagsJson,
                    TechStackJson = q.TechStackJson
                })
                .ToListAsync();

            // Enrich with practice status
            foreach (var item in questions)
                item.PracticeStatus = practiceMap.TryGetValue(item.Id, out var s) ? s : "NotStarted";

            return Ok(new PagedResult<QuestionListItemDto>
            {
                Items = questions,
                TotalItems = total,
                Page = page,
                PageSize = pageSize
            });
        }

        // ─────────────────────────────────────────────
        // GET /api/practice/questions/{id}
        // ─────────────────────────────────────────────
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = GetUserId();

            var q = await _db.Questions
                .Where(x => x.Id == id && x.Status == "Published" && x.IsClientVisible)
                .FirstOrDefaultAsync();

            if (q == null) return NotFound(new { message = "Câu hỏi không tồn tại hoặc chưa được publish." });

            var latestHistory = await _db.UserQuestionPracticeHistories
                .Where(h => h.UserId == userId && h.QuestionId == id)
                .OrderByDescending(h => h.CreatedAt)
                .FirstOrDefaultAsync();

            return Ok(new QuestionDetailDto
            {
                Id = q.Id,
                Title = q.Title,
                Content = q.Content,
                ExpectedAnswerGuide = q.ExpectedAnswerGuide,
                ExampleAnswer = q.ExampleAnswer,
                Category = q.Category,
                Role = q.Role,
                Difficulty = q.Difficulty,
                TechStackJson = q.TechStackJson,
                TagsJson = q.TagsJson,
                PracticeStatus = latestHistory?.PracticeStatus ?? "NotStarted"
            });
        }

        // ─────────────────────────────────────────────
        // POST /api/practice/questions/{id}/submit
        // ─────────────────────────────────────────────
        [HttpPost("{id}/submit")]
        public async Task<IActionResult> Submit(int id, [FromBody] SubmitQuestionAnswerRequest req)
        {
            var userId = GetUserId();

            var q = await _db.Questions
                .Where(x => x.Id == id && x.Status == "Published" && x.IsClientVisible)
                .FirstOrDefaultAsync();

            if (q == null) return NotFound(new { message = "Câu hỏi không tồn tại." });

            if (string.IsNullOrWhiteSpace(req.Answer))
                return BadRequest(new { message = "Câu trả lời không được để trống." });

            // Save practice history (AI evaluation can be added here later)
            var history = new Entities.UserQuestionPracticeHistory
            {
                UserId = userId,
                QuestionId = id,
                UserAnswer = req.Answer,
                PracticeStatus = "Practiced",
                CreatedAt = DateTime.UtcNow
            };

            _db.UserQuestionPracticeHistories.Add(history);
            await _db.SaveChangesAsync();

            return Ok(new SubmitQuestionAnswerResult
            {
                PracticeId = history.Id,
                Score = null,
                Feedback = "Câu trả lời đã được lưu. AI đánh giá sẽ được cập nhật sau.",
                StrengthsJson = "[]",
                WeaknessesJson = "[]",
                ImprovementSuggestionsJson = "[]"
            });
        }
    }
}
