using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/coding-interviews")]
    [Authorize]
    public class CodingInterviewsController : ControllerBase
    {
        private readonly ICodingInterviewService _service;
        private readonly AppDbContext _db;

        public CodingInterviewsController(ICodingInterviewService service, AppDbContext db)
        {
            _service = service;
            _db = db;
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

        // ──────────────────────────────────────────────────────────────────────
        // POST /api/coding-interviews/full-mock/save
        // Lưu kết quả Full Mock Coding round vào CodingInterviewSessions table
        // (thay thế legacy path ghi vào InterviewSessions)
        // ──────────────────────────────────────────────────────────────────────
        [HttpPost("full-mock/save")]
        public async Task<IActionResult> SaveFullMockCodingSession([FromBody] SaveFullMockCodingRequest request)
        {
            try
            {
                int userId = GetUserId();

                // Tính trung bình các sub-scores từ tất cả bài
                int n = request.Problems.Count;
                if (n == 0) return BadRequest(new { message = "Không có bài nào để lưu." });

                float avgOverall     = (float)request.Problems.Average(p => p.Score) / 10.0f;
                float avgCorrectness = (float)request.Problems.Average(p => p.TestScore) / 5.0f;       // 0-50 → 0-10
                float avgQuality     = (float)request.Problems.Average(p => p.QualityScore) / 3.0f;   // 0-30 → 0-10
                float avgComplexity  = (float)request.Problems.Average(p => p.ComplexityScore) / 2.0f; // 0-20 → 0-10
                float avgProblemUnderstanding = (float)request.Problems.Average(p => p.ProblemUnderstandingScore);
                float avgAlgorithmDesign      = (float)request.Problems.Average(p => p.AlgorithmDesignScore);
                float avgTesting              = (float)request.Problems.Average(p => p.TestingScore);

                // Gộp strengths / weaknesses / roadmap từ tất cả bài
                var allStrengths = request.Problems.SelectMany(p => p.Strengths ?? new()).Distinct().ToList();
                var allWeaknesses = request.Problems.SelectMany(p => p.Weaknesses ?? new()).Distinct().ToList();
                var allRoadmap = request.Problems.SelectMany(p => p.LearningRoadmap ?? new()).Distinct().ToList();

                var finalReportJson = JsonSerializer.Serialize(new
                {
                    strengths = allStrengths,
                    weaknesses = allWeaknesses,
                    roadmap = allRoadmap
                });

                // Tạo CodingInterviewSession
                var session = new CodingInterviewSession
                {
                    SessionGuid = request.SessionGuid,
                    UserId = userId,
                    Role = request.Role ?? "Developer",
                    Level = request.Level ?? "Fresher",
                    TechStack = request.Language ?? "N/A",
                    Language = request.Language ?? "N/A",
                    Status = "Completed",
                    OverallScore = (float)Math.Round(avgOverall, 2),
                    AvgProblemUnderstandingScore = (float)Math.Round(avgProblemUnderstanding, 1),
                    AvgAlgorithmDesignScore      = (float)Math.Round(avgAlgorithmDesign, 1),
                    AvgCorrectnessScore          = (float)Math.Round(avgCorrectness, 1),
                    AvgQualityScore              = (float)Math.Round(avgQuality, 1),
                    AvgComplexityScore           = (float)Math.Round(avgComplexity, 1),
                    AvgTestingScore              = (float)Math.Round(avgTesting, 1),
                    AvgCommunicationScore        = 0f,
                    FinalReportJson              = finalReportJson,
                    CompletedAt                  = DateTime.UtcNow,
                };

                _db.CodingInterviewSessions.Add(session);
                await _db.SaveChangesAsync();

                // Tạo CodingInterviewProblem cho từng bài
                for (int i = 0; i < request.Problems.Count; i++)
                {
                    var p = request.Problems[i];
                    _db.CodingInterviewProblems.Add(new CodingInterviewProblem
                    {
                        SessionId             = session.Id,
                        ProblemIndex          = i + 1,
                        Source                = "FullMock",
                        Title                 = p.Title ?? $"Bài {i + 1}",
                        Description           = string.Empty,
                        Difficulty            = request.Level ?? "Fresher",
                        PassedTestCases       = p.PassedCount,
                        TotalTestCases        = p.TotalCount,
                        ProblemUnderstandingScore = p.ProblemUnderstandingScore,
                        AlgorithmDesignScore  = p.AlgorithmDesignScore,
                        CorrectnessScore      = (float)Math.Round(p.TestScore / 5.0f, 1),
                        QualityScore          = (float)Math.Round(p.QualityScore / 3.0f, 1),
                        ComplexityScore       = (float)Math.Round(p.ComplexityScore / 2.0f, 1),
                        TestingScore          = p.TestingScore,
                        CommunicationScore    = 0f,
                        SubmittedCode         = p.UserCode,
                        AIReviewFeedbackJson  = JsonSerializer.Serialize(new
                        {
                            feedback    = p.Feedback,
                            strengths   = p.Strengths,
                            weaknesses  = p.Weaknesses,
                            roadmap     = p.LearningRoadmap,
                        }),
                    });
                }

                await _db.SaveChangesAsync();

                return Ok(new { sessionGuid = session.SessionGuid, message = "Đã lưu kết quả coding round thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lưu kết quả coding.", detail = ex.Message });
            }
        }
    }
}
