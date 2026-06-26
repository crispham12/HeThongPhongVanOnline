using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

using InterviewPro.API.Services;

namespace InterviewPro.API.Controllers
{
    /// <summary>
    /// HrInterviewsController: Điểm vào API cho chức năng Phỏng vấn HR.
    ///
    /// Nguyên tắc thiết kế:
    /// - Controller chỉ làm 3 việc: parse request, gọi service, trả response
    /// - Mọi business logic nằm trong HrInterviewService
    /// - Error handling tập trung: dùng try/catch để map exception → HTTP status code
    /// </summary>
    [ApiController]
    [Route("api/hr-interviews")]
    [Authorize]
    public class HrInterviewsController : ControllerBase
    {
        private readonly IHrInterviewService _service;

        public HrInterviewsController(IHrInterviewService service)
        {
            _service = service;
        }

        // Lấy UserId từ JWT token
        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException();
            return int.Parse(claim.Value);
        }

        // ─────────────────────────────────────────────
        // POST /api/hr-interviews/start
        // Tạo phiên phỏng vấn HR mới + sinh 10 câu hỏi
        // ─────────────────────────────────────────────
        [HttpPost("start")]
        public async Task<IActionResult> Start([FromBody] StartHrInterviewRequest request)
        {
            try
            {
                var result = await _service.StartInterviewAsync(GetUserId(), request);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (NotEnoughCreditsException ex)
            {
                // 402 Payment Required: hết lượt miễn phí / trả phí
                return StatusCode(402, new { 
                    message = ex.Message,
                    requiredPayment = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Không thể tạo phiên phỏng vấn.", detail = ex.Message });
            }
        }


        // ─────────────────────────────────────────────
        // GET /api/hr-interviews/{sessionId}
        // Lấy thông tin phiên phỏng vấn + danh sách câu hỏi
        // ─────────────────────────────────────────────
        [HttpGet("{sessionId}")]
        public async Task<IActionResult> GetSession(string sessionId)
        {
            try
            {
                var result = await _service.GetInterviewAsync(GetUserId(), sessionId);
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

        // ─────────────────────────────────────────────
        // POST /api/hr-interviews/{sessionId}/answers
        // Nộp câu trả lời → AI đánh giá → nếu đủ 10 thì tổng kết
        // ─────────────────────────────────────────────
        [HttpPost("{sessionId}/answers")]
        public async Task<IActionResult> SubmitAnswer(string sessionId, [FromBody] SubmitHrAnswerRequest request)
        {
            try
            {
                var result = await _service.SubmitAnswerAsync(GetUserId(), sessionId, request);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("đã được trả lời"))
            {
                return Conflict(new { message = ex.Message });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("đã hoàn thành"))
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi xử lý câu trả lời.", detail = ex.Message });
            }
        }

        // ─────────────────────────────────────────────
        // GET /api/hr-interviews/{sessionId}/result
        // Lấy kết quả tổng kết HR
        // ─────────────────────────────────────────────
        [HttpGet("{sessionId}/result")]
        public async Task<IActionResult> GetResult(string sessionId)
        {
            try
            {
                var result = await _service.GetFinalResultAsync(GetUserId(), sessionId);
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

        // ─────────────────────────────────────────────
        // GET /api/hr-interviews/history
        // Lấy lịch sử phỏng vấn HR của user
        // ─────────────────────────────────────────────
        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            try
            {
                var result = await _service.GetHistoryAsync(GetUserId());
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
