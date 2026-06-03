using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace InterviewPro.API.Controllers
{
    /// <summary>
    /// Admin-only CRUD for the Question Bank (HR + Technical).
    /// Requires Role = 1 (Admin) via JWT claim.
    /// </summary>
    [ApiController]
    [Route("api/admin/questions")]
    [Authorize]
    public class AdminQuestionsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AdminQuestionsController(AppDbContext db) => _db = db;

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException());

        private bool IsAdmin() =>
            User.FindFirstValue(ClaimTypes.Role) == "1" ||
            User.FindAll(ClaimTypes.Role).Any(c => c.Value == "1") ||
            User.HasClaim("role", "1") ||
            User.HasClaim(ClaimTypes.Role, "Admin");

        // ─────────────────────────────────────────────
        // GET /api/admin/questions
        // ─────────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? category,
            [FromQuery] string? status,
            [FromQuery] string? difficulty,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            if (!IsAdmin()) return Forbid();

            var query = _db.Questions.AsQueryable();

            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(q => q.Category == category);
            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(q => q.Status == status);
            if (!string.IsNullOrWhiteSpace(difficulty))
                query = query.Where(q => q.Difficulty == difficulty);
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(q =>
                    q.Title.Contains(search) || q.Content.Contains(search));

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(q => q.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(q => new QuestionAdminDto
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
                    Source = q.Source,
                    Status = q.Status,
                    AllowAIUse = q.AllowAIUse,
                    AllowRandomSelection = q.AllowRandomSelection,
                    IsClientVisible = q.IsClientVisible,
                    CreatedByAdminId = q.CreatedByAdminId,
                    CreatedAt = q.CreatedAt,
                    UpdatedAt = q.UpdatedAt
                })
                .ToListAsync();

            return Ok(new PagedResult<QuestionAdminDto>
            {
                Items = items,
                TotalItems = total,
                Page = page,
                PageSize = pageSize
            });
        }

        // ─────────────────────────────────────────────
        // GET /api/admin/questions/{id}
        // ─────────────────────────────────────────────
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            if (!IsAdmin()) return Forbid();

            var q = await _db.Questions.FindAsync(id);
            if (q == null) return NotFound();

            return Ok(MapToAdminDto(q));
        }

        // ─────────────────────────────────────────────
        // POST /api/admin/questions
        // ─────────────────────────────────────────────
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateQuestionRequest req)
        {
            if (!IsAdmin()) return Forbid();

            var question = new Question
            {
                Title = req.Title,
                Content = req.Content,
                ExpectedAnswerGuide = req.ExpectedAnswerGuide,
                ExampleAnswer = req.ExampleAnswer,
                Category = req.Category,
                Role = req.Role,
                Difficulty = req.Difficulty,
                TechStackJson = req.TechStackJson,
                TagsJson = req.TagsJson,
                Source = req.Source,
                Status = req.Status ?? "Draft",
                AllowAIUse = req.AllowAIUse,
                AllowRandomSelection = req.AllowRandomSelection,
                IsClientVisible = req.IsClientVisible,
                CreatedByAdminId = GetUserId(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Questions.Add(question);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = question.Id }, MapToAdminDto(question));
        }

        // ─────────────────────────────────────────────
        // PUT /api/admin/questions/{id}
        // ─────────────────────────────────────────────
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateQuestionRequest req)
        {
            if (!IsAdmin()) return Forbid();

            var q = await _db.Questions.FindAsync(id);
            if (q == null) return NotFound();

            q.Title = req.Title;
            q.Content = req.Content;
            q.ExpectedAnswerGuide = req.ExpectedAnswerGuide;
            q.ExampleAnswer = req.ExampleAnswer;
            q.Category = req.Category;
            q.Role = req.Role;
            q.Difficulty = req.Difficulty;
            q.TechStackJson = req.TechStackJson;
            q.TagsJson = req.TagsJson;
            q.AllowAIUse = req.AllowAIUse;
            q.AllowRandomSelection = req.AllowRandomSelection;
            q.IsClientVisible = req.IsClientVisible;
            q.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(MapToAdminDto(q));
        }

        // ─────────────────────────────────────────────
        // DELETE /api/admin/questions/{id}
        // ─────────────────────────────────────────────
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!IsAdmin()) return Forbid();

            var q = await _db.Questions.FindAsync(id);
            if (q == null) return NotFound();

            _db.Questions.Remove(q);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // ─────────────────────────────────────────────
        // POST /api/admin/questions/{id}/publish
        // ─────────────────────────────────────────────
        [HttpPost("{id}/publish")]
        public async Task<IActionResult> Publish(int id)
        {
            if (!IsAdmin()) return Forbid();

            var q = await _db.Questions.FindAsync(id);
            if (q == null) return NotFound();

            q.Status = "Published";
            q.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Câu hỏi đã được publish.", status = q.Status });
        }

        // ─────────────────────────────────────────────
        // POST /api/admin/questions/{id}/unpublish
        // ─────────────────────────────────────────────
        [HttpPost("{id}/unpublish")]
        public async Task<IActionResult> Unpublish(int id)
        {
            if (!IsAdmin()) return Forbid();

            var q = await _db.Questions.FindAsync(id);
            if (q == null) return NotFound();

            q.Status = "Draft";
            q.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Câu hỏi đã được chuyển về Draft.", status = q.Status });
        }

        private static QuestionAdminDto MapToAdminDto(Question q) => new()
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
            Source = q.Source,
            Status = q.Status,
            AllowAIUse = q.AllowAIUse,
            AllowRandomSelection = q.AllowRandomSelection,
            IsClientVisible = q.IsClientVisible,
            CreatedByAdminId = q.CreatedByAdminId,
            CreatedAt = q.CreatedAt,
            UpdatedAt = q.UpdatedAt
        };
    }
}
