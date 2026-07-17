using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

using InterviewPro.API.Services;
using InterviewPro.API.Data;
using InterviewPro.API.Entities;

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
        // GET /api/hr-interviews/{sessionId}/questions
        // Lấy danh sách câu hỏi của phiên phỏng vấn
        // ─────────────────────────────────────────────
        [HttpGet("{sessionId}/questions")]
        public async Task<IActionResult> GetSessionQuestions(string sessionId)
        {
            try
            {
                var sessionDetail = await _service.GetInterviewAsync(GetUserId(), sessionId);
                return Ok(sessionDetail.Questions);
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
        // GET /api/hr-interviews/{sessionId}/questions/{questionId}/draft
        // Lấy bản nháp câu trả lời
        // ─────────────────────────────────────────────
        [HttpGet("{sessionId}/questions/{questionId}/draft")]
        public async Task<IActionResult> GetDraft(string sessionId, string questionId)
        {
            try
            {
                var draft = await _service.GetDraftAsync(GetUserId(), sessionId, questionId);
                if (draft == null) return NotFound(new { message = "Không có bản nháp." });
                return Ok(draft);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ─────────────────────────────────────────────
        // POST /api/hr-interviews/{sessionId}/questions/{questionId}/draft
        // Lưu bản nháp câu trả lời
        // ─────────────────────────────────────────────
        [HttpPost("{sessionId}/questions/{questionId}/draft")]
        public async Task<IActionResult> SaveDraft(string sessionId, string questionId, [FromBody] SubmitHrAnswerRequest request)
        {
            try
            {
                await _service.SaveDraftAsync(GetUserId(), sessionId, questionId, request);
                return Ok(new { message = "Đã lưu nháp." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ─────────────────────────────────────────────
        // DELETE /api/hr-interviews/{sessionId}/questions/{questionId}/draft
        // Xóa bản nháp câu trả lời
        // ─────────────────────────────────────────────
        [HttpDelete("{sessionId}/questions/{questionId}/draft")]
        public async Task<IActionResult> DeleteDraft(string sessionId, string questionId)
        {
            try
            {
                await _service.DeleteDraftAsync(GetUserId(), sessionId, questionId);
                return Ok(new { message = "Đã xóa nháp." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
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
        // ─────────────────────────────────────────────
        // POST /api/hr-interviews/{sessionId}/analysis/start
        // Start background AI Analysis
        // ─────────────────────────────────────────────
        [HttpPost("{sessionId}/analysis/start")]
        public async Task<IActionResult> StartAnalysis(string sessionId, [FromServices] AppDbContext db, [FromServices] IInterviewAnalysisQueue queue)
        {
            var session = db.HrInterviewSessions.FirstOrDefault(s => s.SessionGuid == sessionId && s.UserId == GetUserId());
            if (session == null) return NotFound("Session not found");

            // Check if job already exists
            var existingJob = db.InterviewAnalysisJobs.FirstOrDefault(j => j.SessionId == session.Id);
            if (existingJob != null && existingJob.Status != "Failed")
            {
                return Ok(new { jobId = existingJob.Id, message = "Analysis already started" });
            }

            var job = new InterviewAnalysisJob { SessionId = session.Id };
            db.InterviewAnalysisJobs.Add(job);
            await db.SaveChangesAsync();

            await queue.QueueAnalysisJobAsync(job.Id);

            return Ok(new { jobId = job.Id, message = "Analysis started" });
        }

        // ─────────────────────────────────────────────
        // GET /api/hr-interviews/{sessionId}/analysis/status
        // Get background AI Analysis status
        // ─────────────────────────────────────────────
        [HttpGet("{sessionId}/analysis/status")]
        public IActionResult GetAnalysisStatus(string sessionId, [FromServices] AppDbContext db)
        {
            var session = db.HrInterviewSessions.FirstOrDefault(s => s.SessionGuid == sessionId && s.UserId == GetUserId());
            if (session == null) return NotFound("Session not found");

            var job = db.InterviewAnalysisJobs.OrderByDescending(j => j.CreatedAt).FirstOrDefault(j => j.SessionId == session.Id);
            if (job == null) return NotFound("No analysis job found");

            return Ok(new AnalysisStatusResponseDto
            {
                SessionId = session.Id,
                Status = job.Status,
                Progress = job.Progress,
                CurrentStep = job.CurrentStep,
                CanRedirect = job.Status == "Completed",
                ErrorMessage = job.ErrorMessage
            });
        }

        // ─────────────────────────────────────────────
        // GET /api/hr-interviews/{sessionId}/analysis/result
        // Get background AI Analysis result
        // ─────────────────────────────────────────────
        [HttpGet("{sessionId}/analysis/result")]
        public async Task<IActionResult> GetAnalysisResult(string sessionId, [FromServices] IHRInterviewResultService resultService)
        {
            try
            {
                var isAdmin = User.IsInRole("Admin") || (User.FindFirst("Role")?.Value == "1");
                var result = await resultService.GetResultAsync(sessionId, GetUserId(), isAdmin);

                if (result == null)
                {
                    return NotFound(new { message = "Session not found." });
                }

                if (!result.IsReady)
                {
                    return StatusCode(202, result); // Accepted but not ready
                }

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the result.", detail = ex.Message });
            }
        }
    }
}
