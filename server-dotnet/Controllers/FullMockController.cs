using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/full-mock")]
    [Authorize]
    public class FullMockController : ControllerBase
    {
        private readonly IFullMockService _fullMockService;

        public FullMockController(IFullMockService fullMockService)
        {
            _fullMockService = fullMockService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateSession([FromBody] CreateFullMockRequest request)
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var response = await _fullMockService.CreateSessionAsync(userId, request);
                return Ok(response);
            }
            catch (QuotaExceededException ex)
            {
                return StatusCode(429, new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(401, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("{guid}/complete-round")]
        public async Task<IActionResult> CompleteRound(string guid, [FromBody] CompleteRoundRequest request)
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                await _fullMockService.CompleteRoundAsync(userId, guid, request);
                return Ok(new { message = $"Hoàn thành vòng {request.Round} thành công." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (QuotaExceededException ex)
            {
                return StatusCode(429, new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(401, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("{guid}/abandon")]
        public async Task<IActionResult> AbandonSession(string guid)
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                await _fullMockService.AbandonSessionAsync(userId, guid);
                return Ok(new { message = "Hủy bỏ phiên phỏng vấn thử thành công." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(401, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("{guid}/report")]
        public async Task<IActionResult> GetReport(string guid)
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var report = await _fullMockService.GetReportAsync(userId, guid);
                return Ok(report);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(401, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveSession()
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var session = await _fullMockService.GetActiveSessionAsync(userId);
                return Ok(session);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
