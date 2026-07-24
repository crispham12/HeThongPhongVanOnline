using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using InterviewPro.API.Data;
using System.Text.Json;
using System.Security.Claims;
using System.Diagnostics;
using InterviewPro.API.DTOs;


namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Yêu cầu đăng nhập để sử dụng các tính năng này
    public class InterviewController : ControllerBase
    {
        private readonly IInterviewRepository _repo;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IAiRequestLogService _aiRequestLogService;
        private readonly IInterviewDataService _interviewDataService;
        private readonly IInterviewQuotaService _quotaService;
        private readonly AppDbContext _context;

        public InterviewController(
            IInterviewRepository repo,
            IHttpClientFactory httpClientFactory,
            IAiRequestLogService aiRequestLogService,
            IInterviewDataService interviewDataService,
            IInterviewQuotaService quotaService,
            AppDbContext context)
        {
            _repo = repo;
            _httpClientFactory = httpClientFactory;
            _aiRequestLogService = aiRequestLogService;
            _interviewDataService = interviewDataService;
            _quotaService = quotaService;
            _context = context;
        }

        [HttpGet("quota")]
        public async Task<IActionResult> GetQuotaStatus()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) return Unauthorized("Không xác định được người dùng.");

                int userId = int.Parse(userIdClaim.Value);
                var status = await _quotaService.GetQuotaStatusAsync(userId);
                return Ok(status);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartSession([FromBody] InterviewSetupRequest request)
        {
            // Lấy UserId từ JWT Token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized("Không xác định được người dùng.");
            
            int userId = int.Parse(userIdClaim.Value);

            // Kiểm tra và áp dụng quota phỏng vấn trước khi bắt đầu session
            try
            {
                await _quotaService.ConsumeQuotaAsync(userId);
            }
            catch (QuotaExceededException ex)
            {
                return StatusCode(429, new { message = ex.Message });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {

                var session = new InterviewSession
                {
                    UserId = userId, 
                    Role = request.Role,
                    TechStack = JsonSerializer.Serialize(request.Stack),
                    Difficulty = request.Difficulty,
                    InterviewType = request.Type,
                    CurrentPhase = request.Type == "hr" ? "HR" : "Technical",
                    Status = "InProgress"
                };

                await _repo.CreateSession(session);
                await transaction.CommitAsync();

                return Ok(new { sessionId = session.SessionGuid });
            }

            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"[Error in StartSession]: {ex.ToString()}");
                return StatusCode(500, new { message = "Lỗi khi khởi tạo phiên phỏng vấn.", error = ex.ToString() });
            }
        }


        [HttpGet("next-question/{sessionId}")]
        public async Task<IActionResult> GetNextQuestion(string sessionId)
        {
            var session = await _repo.GetSessionByGuid(sessionId);
            if (session == null) return NotFound();

            var sw = Stopwatch.StartNew();
            int inputTokens = 0, outputTokens = 0, totalTokens = 0;
            string model = "gpt-4o-mini";
            string status = "Success";
            string? errorMessage = null;

            try
            {
                var aiClient = _httpClientFactory.CreateClient("AIService");
                var aiRequest = new {
                    role = session.Role,
                    stack = JsonSerializer.Deserialize<List<string>>(session.TechStack),
                    difficulty = session.Difficulty,
                    interview_type = session.CurrentPhase
                };

                var response = await aiClient.PostAsJsonAsync("/ai/generate-question", aiRequest);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                ParseTokenUsage(json, out model, out inputTokens, out outputTokens, out totalTokens);

                var aiResult = JsonSerializer.Deserialize<dynamic>(json);

                sw.Stop();
                return Ok(aiResult);
            }
            catch (Exception ex)
            {
                sw.Stop();
                status = "Failed";
                errorMessage = ex.Message;
                return StatusCode(500, new { message = "Lỗi khi gọi AI Service.", error = ex.Message });
            }
            finally
            {
                await _aiRequestLogService.LogAsync(new AiRequestLogCreateDto
                {
                    Feature = "InterviewQuestionGeneration",
                    RequestType = "GenerateQuestions",
                    Model = model,
                    Status = status,
                    InputTokens = inputTokens,
                    OutputTokens = outputTokens,
                    TotalTokens = totalTokens,
                    ResponseTimeMs = sw.ElapsedMilliseconds,
                    ErrorMessage = errorMessage
                });
            }
        }

        [HttpPost("submit-answer")]
        public async Task<IActionResult> SubmitAnswer([FromBody] AnswerRequest request)
        {
            var session = await _repo.GetSessionByGuid(request.SessionId);
            if (session == null) return NotFound();

            var sw = Stopwatch.StartNew();
            int inputTokens = 0, outputTokens = 0, totalTokens = 0;
            string model = "gpt-4o-mini";
            string status = "Success";
            string? errorMessage = null;

            try
            {
                var aiClient = _httpClientFactory.CreateClient("AIService");
                var aiRequest = new { 
                    question = request.QuestionContent, 
                    answer = request.Answer,
                    interview_type = session.CurrentPhase
                };

                var response = await aiClient.PostAsJsonAsync("/ai/evaluate-answer", aiRequest);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorMsg = await response.Content.ReadAsStringAsync();
                    throw new Exception("Lỗi từ AI Service: " + errorMsg);
                }

                var json = await response.Content.ReadAsStringAsync();
                ParseTokenUsage(json, out model, out inputTokens, out outputTokens, out totalTokens);

                var eval = JsonSerializer.Deserialize<JsonElement>(json);

                var question = new InterviewQuestion
                {
                    SessionId = session.Id,
                    Phase = session.CurrentPhase,
                    Content = request.QuestionContent,
                    UserAnswer = request.Answer,
                    Score = eval.GetProperty("score").GetDouble(),
                    Feedback = eval.GetProperty("feedback").GetString() ?? string.Empty
                };

                await _repo.AddQuestion(question);
                sw.Stop();
                return Ok(new { feedback = question.Feedback, score = question.Score });
            }
            catch (Exception ex)
            {
                sw.Stop();
                status = "Failed";
                errorMessage = ex.Message;
                return StatusCode(500, new { message = "Lỗi khi nộp câu trả lời.", error = ex.Message });
            }
            finally
            {
                // Dynamic mapping: Technical/Coding -> CodingAnalysis/AnalyzeCode; HR/Others -> AutoScoring/AutoScore
                bool isTechnical = session.CurrentPhase.Equals("Technical", StringComparison.OrdinalIgnoreCase);
                await _aiRequestLogService.LogAsync(new AiRequestLogCreateDto
                {
                    Feature = isTechnical ? "CodingAnalysis" : "AutoScoring",
                    RequestType = isTechnical ? "AnalyzeCode" : "AutoScore",
                    Model = model,
                    Status = status,
                    InputTokens = inputTokens,
                    OutputTokens = outputTokens,
                    TotalTokens = totalTokens,
                    ResponseTimeMs = sw.ElapsedMilliseconds,
                    ErrorMessage = errorMessage
                });
            }
        }

        // ──────────────────────────────────────────────────
        // POST /api/interview/complete-session
        // Đánh dấu Technical session Completed + tạo PracticeAttempt
        // ──────────────────────────────────────────────────
        [HttpPost("complete-session")]
        public async Task<IActionResult> CompleteSession([FromBody] CompleteSessionRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            int userId = int.Parse(userIdClaim.Value);

            var session = await _repo.GetSessionByGuid(request.SessionId);
            if (session == null) return NotFound(new { message = "Không tìm thấy phiên phỏng vấn." });
            if (session.UserId != userId) return Forbid();

            // Đánh dấu Completed + ghi điểm tổng
            session.Status = "Completed";
            session.OverallScore = request.OverallScore;
            session.OverallFeedback = request.OverallFeedback ?? string.Empty;
            session.CompletedAt = DateTime.UtcNow;
            await _repo.UpdateSession(session);

            // Tạo PracticeAttempt cho Technical session
            try
            {
                var userNameClaim = User.FindFirst(ClaimTypes.Name)
                    ?? User.FindFirst("name")
                    ?? User.FindFirst(ClaimTypes.Email);
                var userName = userNameClaim?.Value ?? $"User #{userId}";
                await _interviewDataService.CreateAttemptFromTechnicalSessionAsync(
                    userId, userName, session.Id);
            }
            catch (Exception ex)
            {
                // Không throw — không làm hỏng flow chính
                Console.WriteLine($"⚠️ Không tạo được PracticeAttempt cho Technical: {ex.Message}");
            }

            return Ok(new { message = "Hoàn thành phiên phỏng vấn thành công." });
        }

        private void ParseTokenUsage(string json, out string model, out int inputTokens, out int outputTokens, out int totalTokens)
        {
            model = "gpt-4o-mini";
            inputTokens = 0;
            outputTokens = 0;
            totalTokens = 0;

            try
            {
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.TryGetProperty("usage", out var usageElem))
                {
                    if (usageElem.TryGetProperty("inputTokens", out var inProp)) inputTokens = inProp.GetInt32();
                    else if (usageElem.TryGetProperty("input_tokens", out var inProp2)) inputTokens = inProp2.GetInt32();

                    if (usageElem.TryGetProperty("outputTokens", out var outProp)) outputTokens = outProp.GetInt32();
                    else if (usageElem.TryGetProperty("output_tokens", out var outProp2)) outputTokens = outProp2.GetInt32();

                    if (usageElem.TryGetProperty("totalTokens", out var totProp)) totalTokens = totProp.GetInt32();
                    else if (usageElem.TryGetProperty("total_tokens", out var totProp2)) totalTokens = totProp2.GetInt32();
                }

                if (doc.RootElement.TryGetProperty("model", out var modelElem))
                {
                    model = modelElem.GetString() ?? model;
                }
            }
            catch { }
        }
    }

    public record InterviewSetupRequest(string Role, List<string> Stack, string Difficulty, string Type);
    public record AnswerRequest(string SessionId, string QuestionContent, string Answer);
    public record CompleteSessionRequest(string SessionId, double OverallScore, string? OverallFeedback);
}
