using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using System.Text.Json;
using System.Security.Claims;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Yêu cầu đăng nhập để sử dụng các tính năng này
    public class InterviewController : ControllerBase
    {
        private readonly IInterviewRepository _repo;
        private readonly IHttpClientFactory _httpClientFactory;

        public InterviewController(IInterviewRepository repo, IHttpClientFactory httpClientFactory)
        {
            _repo = repo;
            _httpClientFactory = httpClientFactory;
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartSession([FromBody] InterviewSetupRequest request)
        {
            // Lấy UserId từ JWT Token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized("Không xác định được người dùng.");
            
            int userId = int.Parse(userIdClaim.Value);

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
            return Ok(new { sessionId = session.SessionGuid });
        }

        [HttpGet("next-question/{sessionId}")]
        public async Task<IActionResult> GetNextQuestion(string sessionId)
        {
            var session = await _repo.GetSessionByGuid(sessionId);
            if (session == null) return NotFound();

            var aiClient = _httpClientFactory.CreateClient("AIService");
            var aiRequest = new {
                role = session.Role,
                stack = JsonSerializer.Deserialize<List<string>>(session.TechStack),
                difficulty = session.Difficulty,
                interview_type = session.CurrentPhase
            };

            var response = await aiClient.PostAsJsonAsync("/ai/generate-question", aiRequest);
            var aiResult = await response.Content.ReadFromJsonAsync<dynamic>();

            return Ok(aiResult);
        }

        [HttpPost("submit-answer")]
        public async Task<IActionResult> SubmitAnswer([FromBody] AnswerRequest request)
        {
            var session = await _repo.GetSessionByGuid(request.SessionId);
            if (session == null) return NotFound();

            var aiClient = _httpClientFactory.CreateClient("AIService");
            var aiRequest = new { 
                question = request.QuestionContent, 
                answer = request.Answer,
                interview_type = session.CurrentPhase
            };

            var response = await aiClient.PostAsJsonAsync("/ai/evaluate-answer", aiRequest);
            
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, "Lỗi từ AI Service: " + await response.Content.ReadAsStringAsync());
            }

            var eval = await response.Content.ReadFromJsonAsync<dynamic>();

            var question = new InterviewQuestion
            {
                SessionId = session.Id,
                Phase = session.CurrentPhase,
                Content = request.QuestionContent,
                UserAnswer = request.Answer,
                Score = (double)eval.GetProperty("score").GetDouble(),
                Feedback = eval.GetProperty("feedback").GetString()
            };

            await _repo.AddQuestion(question);
            return Ok(new { feedback = question.Feedback, score = question.Score });
        }
    }

    public record InterviewSetupRequest(string Role, List<string> Stack, string Difficulty, string Type);
    public record AnswerRequest(string SessionId, string QuestionContent, string Answer);
}
