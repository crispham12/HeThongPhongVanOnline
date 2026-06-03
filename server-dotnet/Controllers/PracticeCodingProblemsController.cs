using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace InterviewPro.API.Controllers
{
    /// <summary>
    /// Client-facing Coding Problems practice API.
    /// Only returns Status=Published AND IsClientVisible=true.
    /// Hidden: TestCasesJson, SolutionJson (not included in client DTOs).
    /// </summary>
    [ApiController]
    [Route("api/practice/coding-problems")]
    [Authorize]
    public class PracticeCodingProblemsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public PracticeCodingProblemsController(AppDbContext db) => _db = db;

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException());

        // ─────────────────────────────────────────────
        // GET /api/practice/coding-problems
        // ─────────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetList(
            [FromQuery] string? difficulty,
            [FromQuery] string? category,
            [FromQuery] string? role,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = GetUserId();

            var query = _db.CodingProblems
                .Where(p => p.Status == "Published" && p.IsClientVisible);

            if (!string.IsNullOrWhiteSpace(difficulty))
                query = query.Where(p => p.Difficulty == difficulty);
            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(p => p.Category == category);
            if (!string.IsNullOrWhiteSpace(role))
                query = query.Where(p => p.Role.Contains(role));
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(p =>
                    p.Title.Contains(search) || p.ShortDescription.Contains(search));

            var total = await query.CountAsync();

            var problemIds = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => p.Id)
                .ToListAsync();

            // Fetch this user's practice history for these problems
            var practiceMap = await _db.UserCodingPracticeHistories
                .Where(h => h.UserId == userId && problemIds.Contains(h.CodingProblemId))
                .GroupBy(h => h.CodingProblemId)
                .Select(g => new { ProblemId = g.Key, Status = g.OrderByDescending(h => h.CreatedAt).First().Status })
                .ToDictionaryAsync(x => x.ProblemId, x => x.Status);

            var items = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new CodingProblemListItemDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    ShortDescription = p.ShortDescription,
                    Difficulty = p.Difficulty,
                    Category = p.Category,
                    Role = p.Role,
                    TagsJson = p.TagsJson
                })
                .ToListAsync();

            foreach (var item in items)
                item.PracticeStatus = practiceMap.TryGetValue(item.Id, out var s) ? s : "NotStarted";

            return Ok(new PagedResult<CodingProblemListItemDto>
            {
                Items = items,
                TotalItems = total,
                Page = page,
                PageSize = pageSize
            });
        }

        // ─────────────────────────────────────────────
        // GET /api/practice/coding-problems/{id}
        // ─────────────────────────────────────────────
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = GetUserId();

            var p = await _db.CodingProblems
                .Where(x => x.Id == id && x.Status == "Published" && x.IsClientVisible)
                .FirstOrDefaultAsync();

            if (p == null) return NotFound(new { message = "Bài coding không tồn tại hoặc chưa được publish." });

            var latestHistory = await _db.UserCodingPracticeHistories
                .Where(h => h.UserId == userId && h.CodingProblemId == id)
                .OrderByDescending(h => h.CreatedAt)
                .FirstOrDefaultAsync();

            return Ok(new CodingProblemDetailDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                ShortDescription = p.ShortDescription,
                Difficulty = p.Difficulty,
                Category = p.Category,
                Role = p.Role,
                InputFormat = p.InputFormat,
                OutputFormat = p.OutputFormat,
                ConstraintsJson = p.ConstraintsJson,
                ExamplesJson = p.ExamplesJson,
                StarterCodeJson = p.StarterCodeJson,
                TagsJson = p.TagsJson,
                // TestCasesJson and SolutionJson intentionally excluded
                PracticeStatus = latestHistory?.Status ?? "NotStarted"
            });
        }

        // ─────────────────────────────────────────────
        // POST /api/practice/coding-problems/{id}/submit
        // ─────────────────────────────────────────────
        [HttpPost("{id}/submit")]
        public async Task<IActionResult> Submit(int id, [FromBody] SubmitCodeRequest req)
        {
            var userId = GetUserId();

            var p = await _db.CodingProblems
                .Where(x => x.Id == id && x.Status == "Published" && x.IsClientVisible)
                .FirstOrDefaultAsync();

            if (p == null) return NotFound(new { message = "Bài coding không tồn tại." });

            if (string.IsNullOrWhiteSpace(req.Code))
                return BadRequest(new { message = "Code không được để trống." });

            // Parse test cases from DB to count total
            int totalTests = 0;
            if (!string.IsNullOrEmpty(p.TestCasesJson))
            {
                try
                {
                    var testCases = System.Text.Json.JsonSerializer.Deserialize<List<object>>(p.TestCasesJson);
                    totalTests = testCases?.Count ?? 0;
                }
                catch { totalTests = 0; }
            }

            // Save submission history (mock runner — real sandbox can be wired later)
            var history = new Entities.UserCodingPracticeHistory
            {
                UserId = userId,
                CodingProblemId = id,
                Language = req.Language,
                SubmittedCode = req.Code,
                PassedTestCases = 0,
                TotalTestCases = totalTests,
                Status = "Failed",
                CreatedAt = DateTime.UtcNow
            };

            _db.UserCodingPracticeHistories.Add(history);
            await _db.SaveChangesAsync();

            return Ok(new SubmitCodeResult
            {
                PracticeId = history.Id,
                Status = history.Status,
                PassedTestCases = history.PassedTestCases,
                TotalTestCases = history.TotalTestCases,
                Score = null,
                AiFeedback = "Code đã được lưu. Kết quả chạy test sẽ được xử lý bởi sandbox.",
                TimeComplexity = null,
                SpaceComplexity = null
            });
        }
    }
}
