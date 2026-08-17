using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPro.API.Controllers
{
    /// <summary>
    /// AdminInterviewDataController — 6 endpoints cho Admin Dashboard phỏng vấn.
    ///
    /// Tất cả endpoints đều:
    ///   [Authorize(Roles = "Admin")] — chỉ Admin được truy cập
    ///   Trả về dữ liệu từ database thực, không có mock data
    ///
    /// Route gốc: /api/admin/interview-data
    /// </summary>
    [ApiController]
    [Route("api/admin/interview-data")]
    [Authorize]
    public class AdminInterviewDataController : ControllerBase
    {
        private readonly IInterviewDataService _service;

        public AdminInterviewDataController(IInterviewDataService service)
        {
            _service = service;
        }

        private bool IsAdmin() =>
            User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value == "1" ||
            User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value == "Admin" ||
            User.HasClaim("role", "1") ||
            User.HasClaim("role", "Admin") ||
            User.IsInRole("Admin");

        // ──────────────────────────────────────────────────────
        // GET /api/admin/interview-data/overview
        // Cards thống kê tổng quan đầu trang
        // ──────────────────────────────────────────────────────
        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            if (!IsAdmin()) return Forbid();
            try
            {
                var result = await _service.GetOverviewAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Không thể lấy thống kê tổng quan.", detail = ex.Message });
            }
        }

        // ──────────────────────────────────────────────────────
        // GET /api/admin/interview-data
        // Danh sách phiên luyện tập với bộ lọc và phân trang
        //
        // Query params:
        //   role, skillType, scoreMin, scoreMax, date, status
        //   page (default: 1), pageSize (default: 20)
        // ──────────────────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetSessions([FromQuery] AdminInterviewDataFilterRequest filter)
        {
            if (!IsAdmin()) return Forbid();
            try
            {
                var result = await _service.GetSessionsAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Không thể lấy danh sách phiên luyện tập.", detail = ex.Message });
            }
        }

        // ──────────────────────────────────────────────────────
        // GET /api/admin/interview-data/report
        // Dữ liệu cho xuất báo cáo PDF
        // PHẢI đặt TRƯỚC /{sessionId} để tránh routing conflict
        // ──────────────────────────────────────────────────────
        [HttpGet("report")]
        public async Task<IActionResult> GetReportData()
        {
            if (!IsAdmin()) return Forbid();
            try
            {
                var result = await _service.GetReportDataAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Không thể tạo báo cáo.", detail = ex.Message });
            }
        }

        // ──────────────────────────────────────────────────────
        // GET /api/admin/interview-data/{sessionId}
        // Chi tiết 1 phiên luyện tập + danh sách attempts
        // ──────────────────────────────────────────────────────
        [HttpGet("{sessionId:int}")]
        public async Task<IActionResult> GetSessionDetail(int sessionId)
        {
            if (!IsAdmin()) return Forbid();
            try
            {
                var result = await _service.GetSessionDetailAsync(sessionId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Không thể lấy chi tiết phiên luyện tập.", detail = ex.Message });
            }
        }

        // ──────────────────────────────────────────────────────
        // GET /api/admin/interview-data/{sessionId}/attempts
        // Lịch sử luyện tập của 1 phiên (sắp xếp theo attempt number)
        // ──────────────────────────────────────────────────────
        [HttpGet("{sessionId:int}/attempts")]
        public async Task<IActionResult> GetAttempts(int sessionId)
        {
            if (!IsAdmin()) return Forbid();
            try
            {
                var result = await _service.GetAttemptsAsync(sessionId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Không thể lấy lịch sử luyện tập.", detail = ex.Message });
            }
        }

        // ──────────────────────────────────────────────────────
        // GET /api/admin/interview-data/attempt/{attemptId}
        // Chi tiết 1 lần làm bài (kèm câu hỏi + câu trả lời)
        // ──────────────────────────────────────────────────────
        [HttpGet("attempt/{attemptId:int}")]
        public async Task<IActionResult> GetAttemptDetail(int attemptId)
        {
            if (!IsAdmin()) return Forbid();
            try
            {
                var result = await _service.GetAttemptDetailAsync(attemptId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Không thể lấy chi tiết lần làm bài.", detail = ex.Message });
            }
        }

        // ──────────────────────────────────────────────────────
        // GET /api/admin/interview-data/attempt/{attemptId}/questions
        // Chỉ lấy danh sách câu hỏi của 1 lần làm (lightweight)
        // ──────────────────────────────────────────────────────
        [HttpGet("attempt/{attemptId:int}/questions")]
        public async Task<IActionResult> GetAttemptQuestions(int attemptId)
        {
            if (!IsAdmin()) return Forbid();
            try
            {
                var result = await _service.GetAttemptQuestionsAsync(attemptId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Không thể lấy danh sách câu hỏi.", detail = ex.Message });
            }
        }
    }
}
