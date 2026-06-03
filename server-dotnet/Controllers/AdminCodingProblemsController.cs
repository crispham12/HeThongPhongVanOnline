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
    /// Admin-only CRUD for the Coding Problem Bank.
    /// </summary>
    [ApiController]
    [Route("api/admin/coding-problems")]
    [Authorize]
    public class AdminCodingProblemsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AdminCodingProblemsController(AppDbContext db) => _db = db;

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException());

        private bool IsAdmin() =>
            User.FindFirstValue(ClaimTypes.Role) == "1" ||
            User.FindAll(ClaimTypes.Role).Any(c => c.Value == "1") ||
            User.HasClaim("role", "1");

        // ─────────────────────────────────────────────
        // GET /api/admin/coding-problems
        // ─────────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? difficulty,
            [FromQuery] string? category,
            [FromQuery] string? status,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            if (!IsAdmin()) return Forbid();

            var query = _db.CodingProblems.AsQueryable();

            if (!string.IsNullOrWhiteSpace(difficulty))
                query = query.Where(p => p.Difficulty == difficulty);
            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(p => p.Category == category);
            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(p => p.Status == status);
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(p =>
                    p.Title.Contains(search) || p.ShortDescription.Contains(search));

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new CodingProblemAdminDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    ShortDescription = p.ShortDescription,
                    Description = p.Description,
                    Difficulty = p.Difficulty,
                    Category = p.Category,
                    Role = p.Role,
                    TagsJson = p.TagsJson,
                    InputFormat = p.InputFormat,
                    OutputFormat = p.OutputFormat,
                    ConstraintsJson = p.ConstraintsJson,
                    ExamplesJson = p.ExamplesJson,
                    TestCasesJson = p.TestCasesJson,
                    StarterCodeJson = p.StarterCodeJson,
                    Status = p.Status,
                    AllowRandomSelection = p.AllowRandomSelection,
                    IsClientVisible = p.IsClientVisible,
                    CreatedByAdminId = p.CreatedByAdminId,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                })
                .ToListAsync();

            return Ok(new PagedResult<CodingProblemAdminDto>
            {
                Items = items,
                TotalItems = total,
                Page = page,
                PageSize = pageSize
            });
        }

        // ─────────────────────────────────────────────
        // GET /api/admin/coding-problems/{id}
        // ─────────────────────────────────────────────
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            if (!IsAdmin()) return Forbid();
            var p = await _db.CodingProblems.FindAsync(id);
            if (p == null) return NotFound();
            return Ok(MapToAdminDto(p));
        }

        // ─────────────────────────────────────────────
        // POST /api/admin/coding-problems
        // ─────────────────────────────────────────────
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCodingProblemRequest req)
        {
            if (!IsAdmin()) return Forbid();

            var problem = new CodingProblem
            {
                Title = req.Title,
                ShortDescription = req.ShortDescription,
                Description = req.Description,
                Difficulty = req.Difficulty,
                Category = req.Category,
                Role = req.Role,
                TagsJson = req.TagsJson,
                InputFormat = req.InputFormat,
                OutputFormat = req.OutputFormat,
                ConstraintsJson = req.ConstraintsJson,
                ExamplesJson = req.ExamplesJson,
                TestCasesJson = req.TestCasesJson,
                StarterCodeJson = req.StarterCodeJson,
                SolutionJson = req.SolutionJson,
                Status = "Draft",
                AllowRandomSelection = req.AllowRandomSelection,
                IsClientVisible = req.IsClientVisible,
                CreatedByAdminId = GetUserId(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.CodingProblems.Add(problem);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = problem.Id }, MapToAdminDto(problem));
        }

        // ─────────────────────────────────────────────
        // PUT /api/admin/coding-problems/{id}
        // ─────────────────────────────────────────────
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCodingProblemRequest req)
        {
            if (!IsAdmin()) return Forbid();

            var p = await _db.CodingProblems.FindAsync(id);
            if (p == null) return NotFound();

            p.Title = req.Title;
            p.ShortDescription = req.ShortDescription;
            p.Description = req.Description;
            p.Difficulty = req.Difficulty;
            p.Category = req.Category;
            p.Role = req.Role;
            p.TagsJson = req.TagsJson;
            p.InputFormat = req.InputFormat;
            p.OutputFormat = req.OutputFormat;
            p.ConstraintsJson = req.ConstraintsJson;
            p.ExamplesJson = req.ExamplesJson;
            p.TestCasesJson = req.TestCasesJson;
            p.StarterCodeJson = req.StarterCodeJson;
            p.SolutionJson = req.SolutionJson;
            p.AllowRandomSelection = req.AllowRandomSelection;
            p.IsClientVisible = req.IsClientVisible;
            p.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(MapToAdminDto(p));
        }

        // ─────────────────────────────────────────────
        // DELETE /api/admin/coding-problems/{id}
        // ─────────────────────────────────────────────
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!IsAdmin()) return Forbid();

            var p = await _db.CodingProblems.FindAsync(id);
            if (p == null) return NotFound();

            _db.CodingProblems.Remove(p);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // ─────────────────────────────────────────────
        // POST /api/admin/coding-problems/{id}/publish
        // ─────────────────────────────────────────────
        [HttpPost("{id}/publish")]
        public async Task<IActionResult> Publish(int id)
        {
            if (!IsAdmin()) return Forbid();

            var p = await _db.CodingProblems.FindAsync(id);
            if (p == null) return NotFound();

            p.Status = "Published";
            p.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Bài coding đã được publish.", status = p.Status });
        }

        // ─────────────────────────────────────────────
        // POST /api/admin/coding-problems/{id}/unpublish
        // ─────────────────────────────────────────────
        [HttpPost("{id}/unpublish")]
        public async Task<IActionResult> Unpublish(int id)
        {
            if (!IsAdmin()) return Forbid();

            var p = await _db.CodingProblems.FindAsync(id);
            if (p == null) return NotFound();

            p.Status = "Draft";
            p.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Bài coding đã được chuyển về Draft.", status = p.Status });
        }

        private static CodingProblemAdminDto MapToAdminDto(CodingProblem p) => new()
        {
            Id = p.Id,
            Title = p.Title,
            ShortDescription = p.ShortDescription,
            Description = p.Description,
            Difficulty = p.Difficulty,
            Category = p.Category,
            Role = p.Role,
            TagsJson = p.TagsJson,
            InputFormat = p.InputFormat,
            OutputFormat = p.OutputFormat,
            ConstraintsJson = p.ConstraintsJson,
            ExamplesJson = p.ExamplesJson,
            TestCasesJson = p.TestCasesJson,
            StarterCodeJson = p.StarterCodeJson,
            Status = p.Status,
            AllowRandomSelection = p.AllowRandomSelection,
            IsClientVisible = p.IsClientVisible,
            CreatedByAdminId = p.CreatedByAdminId,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };
    }
}
