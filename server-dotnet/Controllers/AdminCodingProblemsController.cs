using System;
using System.Security.Claims;
using System.Threading.Tasks;
using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/admin/coding-problems")]
    [Authorize(Roles = "Admin")]
    public class AdminCodingProblemsController : ControllerBase
    {
        private readonly IAdminCodingProblemService _service;

        public AdminCodingProblemsController(IAdminCodingProblemService service)
        {
            _service = service;
        }

        private Guid GetAdminGuid()
        {
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(idStr, out var idInt))
            {
                // Deterministic Guid generation from int User ID
                return Guid.Parse($"00000000-0000-0000-0000-{idInt:D12}");
            }
            if (Guid.TryParse(idStr, out var idGuid))
            {
                return idGuid;
            }
            return Guid.Empty;
        }

        private string GetAdminName()
        {
            return User.FindFirstValue(ClaimTypes.Name) 
                ?? User.FindFirstValue("name") 
                ?? User.FindFirstValue(ClaimTypes.Email) 
                ?? "Admin User";
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? difficulty,
            [FromQuery] string? category,
            [FromQuery] string? recommendedLevel,
            [FromQuery] string? status,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _service.GetProblemsAsync(
                difficulty, category, recommendedLevel, status, search, page, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var p = await _service.GetByIdAsync(id);
            if (p == null) return NotFound(new { message = "Bài coding không tồn tại." });
            return Ok(p);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCodingProblemRequest req)
        {
            try
            {
                var adminGuid = GetAdminGuid();
                var adminName = GetAdminName();
                var result = await _service.CreateAsync(req, adminGuid, adminName);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCodingProblemRequest req)
        {
            try
            {
                var result = await _service.UpdateAsync(id, req);
                if (result == null) return NotFound(new { message = "Bài coding không tồn tại." });
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success) return NotFound(new { message = "Bài coding không tồn tại." });
            return NoContent();
        }

        [HttpPost("{id}/publish")]
        public async Task<IActionResult> Publish(Guid id)
        {
            try
            {
                var result = await _service.PublishAsync(id);
                if (result == null) return NotFound(new { message = "Bài coding không tồn tại." });
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/draft")]
        public async Task<IActionResult> Draft(Guid id)
        {
            var result = await _service.DraftAsync(id);
            if (result == null) return NotFound(new { message = "Bài coding không tồn tại." });
            return Ok(result);
        }
    }
}
