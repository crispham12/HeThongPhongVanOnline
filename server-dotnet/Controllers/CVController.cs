using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using InterviewPro.API.Entities;
using InterviewPro.API.Data;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Requires JWT auth
    public class CVController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;

        public CVController(AppDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet]
        public async Task<IActionResult> GetCV()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized("Không xác định được người dùng.");
            int userId = int.Parse(userIdClaim.Value);

            var cv = await _context.UserCVs.FirstOrDefaultAsync(c => c.UserId == userId);
            if (cv == null)
            {
                return Ok(null); // Return empty so the frontend can initialize defaults
            }

            return Ok(new CVResponse(
                cv.Id,
                cv.UserId,
                cv.TemplateId,
                cv.Title,
                cv.PersonalInfo,
                cv.Experience,
                cv.Education,
                cv.Skills,
                cv.Languages,
                cv.CoreStack,
                cv.Proficiencies,
                cv.AiScore,
                cv.AiFeedback,
                cv.UpdatedAt
            ));
        }

        [HttpPost("save")]
        public async Task<IActionResult> SaveCV([FromBody] SaveCVRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized("Không xác định được người dùng.");
            int userId = int.Parse(userIdClaim.Value);

            var cv = await _context.UserCVs.FirstOrDefaultAsync(c => c.UserId == userId);
            bool isNew = false;

            if (cv == null)
            {
                isNew = true;
                cv = new UserCV
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };
            }

            cv.TemplateId = request.TemplateId;
            cv.Title = request.Title;
            cv.PersonalInfo = request.PersonalInfo;
            cv.Experience = request.Experience;
            cv.Education = request.Education;
            cv.Skills = request.Skills;
            cv.Languages = request.Languages;
            cv.CoreStack = request.CoreStack;
            cv.Proficiencies = request.Proficiencies;
            cv.UpdatedAt = DateTime.UtcNow;

            if (isNew)
            {
                _context.UserCVs.Add(cv);
            }
            else
            {
                _context.UserCVs.Update(cv);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Lưu CV thành công", cvId = cv.Id });
        }

        [HttpPost("analyze")]
        public async Task<IActionResult> AnalyzeCV([FromBody] AnalyzeCVRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized("Không xác định được người dùng.");
            int userId = int.Parse(userIdClaim.Value);

            // First, call the AI Service (Python FastAPI)
            var aiClient = _httpClientFactory.CreateClient("AIService");
            
            var aiRequest = new
            {
                cv_title = request.Title,
                personal_info = JsonSerializer.Deserialize<Dictionary<string, string>>(request.PersonalInfo),
                experiences = JsonSerializer.Deserialize<List<Dictionary<string, string>>>(request.Experience),
                educations = JsonSerializer.Deserialize<List<Dictionary<string, string>>>(request.Education),
                skills = JsonSerializer.Deserialize<List<string>>(request.Skills)
            };

            int score = 80;
            string feedback = "API Key OpenAI chưa cấu hình. Đây là phản hồi giả lập từ hệ thống phân tích CV.";

            try
            {
                var response = await aiClient.PostAsJsonAsync("/ai/analyze-cv", aiRequest);
                if (response.IsSuccessStatusCode)
                {
                    var eval = await response.Content.ReadFromJsonAsync<AiServiceResponse>();
                    if (eval != null)
                    {
                        score = eval.score;
                        feedback = eval.feedback;
                    }
                }
                else
                {
                    Console.WriteLine($"⚠️ AI Service returned non-success status: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Error calling AI Service: {ex.Message}");
            }

            // Save the AI insights to the database
            var cv = await _context.UserCVs.FirstOrDefaultAsync(c => c.UserId == userId);
            if (cv == null)
            {
                cv = new UserCV
                {
                    UserId = userId,
                    TemplateId = request.TemplateId,
                    Title = request.Title,
                    PersonalInfo = request.PersonalInfo,
                    Experience = request.Experience,
                    Education = request.Education,
                    Skills = request.Skills,
                    Languages = request.Languages,
                    CoreStack = request.CoreStack,
                    Proficiencies = request.Proficiencies,
                    CreatedAt = DateTime.UtcNow
                };
                _context.UserCVs.Add(cv);
            }

            cv.AiScore = score;
            cv.AiFeedback = feedback;
            cv.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { score = cv.AiScore, feedback = cv.AiFeedback });
        }
    }

    public record SaveCVRequest(
        string TemplateId,
        string Title,
        string PersonalInfo,
        string Experience,
        string Education,
        string Skills,
        string Languages,
        string CoreStack,
        string Proficiencies
    );

    public record AnalyzeCVRequest(
        string TemplateId,
        string Title,
        string PersonalInfo,
        string Experience,
        string Education,
        string Skills,
        string Languages,
        string CoreStack,
        string Proficiencies
    );

    public record CVResponse(
        int Id,
        int UserId,
        string TemplateId,
        string Title,
        string PersonalInfo,
        string Experience,
        string Education,
        string Skills,
        string Languages,
        string CoreStack,
        string Proficiencies,
        int AiScore,
        string AiFeedback,
        DateTime UpdatedAt
    );

    public class AiServiceResponse
    {
        public int score { get; set; }
        public string feedback { get; set; } = string.Empty;
    }
}
