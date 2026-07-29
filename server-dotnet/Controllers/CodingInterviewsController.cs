using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/coding-interviews")]
    [Authorize]
    public class CodingInterviewsController : ControllerBase
    {
        private readonly ICodingInterviewService _service;

        public CodingInterviewsController(ICodingInterviewService service)
        {
            _service = service;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();
            return int.Parse(claim.Value);
        }

        [HttpPost("start")]
        public async Task<IActionResult> Start([FromBody] StartCodingInterviewRequest request)
        {
            try
            {
                var result = await _service.StartInterviewAsync(GetUserId(), request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi khởi tạo phiên phỏng vấn coding.", detail = ex.Message });
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

        [HttpPost("{sessionId}/stage/input")]
        public async Task<IActionResult> SubmitStageInput(string sessionId, [FromBody] SubmitStageInputRequest request)
        {
            try
            {
                var result = await _service.SubmitStageInputAsync(GetUserId(), sessionId, request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tương tác giai đoạn phỏng vấn.", detail = ex.Message });
            }
        }

        [HttpPost("{sessionId}/run")]
        public async Task<IActionResult> RunSandbox(string sessionId, [FromBody] CodingSandboxRunRequest request)
        {
            try
            {
                var result = await _service.RunSandboxCodeAsync(GetUserId(), sessionId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi biên dịch chạy thử code.", detail = ex.Message });
            }
        }

        [HttpPost("{sessionId}/submit")]
        public async Task<IActionResult> SubmitSandbox(string sessionId, [FromBody] CodingSandboxRunRequest request)
        {
            try
            {
                var result = await _service.SubmitSandboxCodeAsync(GetUserId(), sessionId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi nộp bài và chạy test case.", detail = ex.Message });
            }
        }

        [HttpGet("{sessionId}/result")]
        public async Task<IActionResult> GetResult(string sessionId)
        {
            try
            {
                var result = await _service.GetFinalReportAsync(GetUserId(), sessionId);
                return Content(result, "application/json");
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
    }
}
