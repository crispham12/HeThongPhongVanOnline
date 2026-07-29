using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/technical-interviews")]
    [Authorize]
    public class TechnicalInterviewsController : ControllerBase
    {
        private readonly ITechnicalInterviewService _service;

        public TechnicalInterviewsController(ITechnicalInterviewService service)
        {
            _service = service;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();
            return int.Parse(claim.Value);
        }

        [HttpPost("start")]
        public async Task<IActionResult> Start([FromBody] StartTechnicalInterviewRequest request)
        {
            try
            {
                var result = await _service.StartInterviewAsync(GetUserId(), request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Không thể khởi tạo phiên phỏng vấn.", detail = ex.Message });
            }
        }

        [HttpGet("{sessionId}")]
        public async Task<IActionResult> GetSession(string sessionId)
        {
            try
            {
                var result = await _service.GetSessionAsync(GetUserId(), sessionId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Không tìm thấy phiên phỏng vấn." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("{sessionId}/answers")]
        public async Task<IActionResult> SubmitAnswer(string sessionId, [FromBody] SubmitTechnicalAnswerRequest request)
        {
            try
            {
                var result = await _service.SubmitAnswerAsync(GetUserId(), sessionId, request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi xử lý câu trả lời.", detail = ex.Message });
            }
        }

        [HttpGet("{sessionId}/result")]
        public async Task<IActionResult> GetResult(string sessionId)
        {
            try
            {
                var result = await _service.GetResultAsync(GetUserId(), sessionId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Không tìm thấy phiên phỏng vấn." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
