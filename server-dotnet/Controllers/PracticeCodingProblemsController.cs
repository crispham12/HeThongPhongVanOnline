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
    [Route("api/practice/coding-problems")]
    [Authorize]
    public class PracticeCodingProblemsController : ControllerBase
    {
        private readonly IPracticeCodingProblemService _service;
        private readonly IInterviewQuotaService _quotaService;

        public PracticeCodingProblemsController(IPracticeCodingProblemService service, IInterviewQuotaService quotaService)
        {
            _service = service;
            _quotaService = quotaService;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException());

        [HttpGet]
        public async Task<IActionResult> GetList(
            [FromQuery] string? difficulty,
            [FromQuery] string? category,
            [FromQuery] string? recommendedLevel,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = GetUserId();
            var result = await _service.GetPracticeProblemsAsync(
                userId, difficulty, category, recommendedLevel, search, page, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var userId = GetUserId();
            var p = await _service.GetByIdAsync(id, userId);
            if (p == null) return NotFound(new { message = "Bài coding không tồn tại hoặc chưa được publish." });
            return Ok(p);
        }

        [HttpGet("{id}/history")]
        public async Task<IActionResult> GetProblemHistory(Guid id)
        {
            var userId = GetUserId();
            var history = await _service.GetProblemHistoryAsync(id, userId);
            return Ok(history);
        }

        [HttpPost("{id}/run")]
        public async Task<IActionResult> Run(Guid id, [FromBody] SubmitCodeRequest req)
        {
            var userId = GetUserId();
            try
            {
                var result = await _service.RunCodeAsync(id, userId, req);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("{id}/submit")]
        public async Task<IActionResult> Submit(Guid id, [FromBody] SubmitCodeRequest req)
        {
            var userId = GetUserId();
            try
            {
                await _quotaService.ConsumeQuotaAsync(userId);
            }
            catch (QuotaExceededException ex)
            {
                return StatusCode(429, new { message = ex.Message });
            }
            
            try
            {
                var result = await _service.SubmitAnswerAsync(id, userId, req);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("~/api/practice/coding-history")]
        public async Task<IActionResult> GetHistory()
        {
            var userId = GetUserId();
            var result = await _service.GetPracticeHistoryAsync(userId);
            return Ok(result);
        }

        [HttpGet("~/api/practice/coding-progress")]
        public async Task<IActionResult> GetProgress()
        {
            var userId = GetUserId();
            var result = await _service.GetPracticeProgressAsync(userId);
            return Ok(result);
        }
    }
}
