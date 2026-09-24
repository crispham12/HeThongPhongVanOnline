using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace InterviewPro.API.Controllers
{
    /// <summary>
    /// Client-facing Practice Questions API.
    /// Only returns Status=Published AND IsClientVisible=true questions.
    /// </summary>
    [ApiController]
    [Route("api/practice/questions")]
    [Authorize]
    public class PracticeQuestionsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IHrAiClient _aiClient;
        private readonly ITechnicalAiClient _technicalAiClient;
        private readonly IInterviewQuotaService _quotaService;

        public PracticeQuestionsController(AppDbContext db, IHrAiClient aiClient, ITechnicalAiClient technicalAiClient, IInterviewQuotaService quotaService)
        {
            _db = db;
            _aiClient = aiClient;
            _technicalAiClient = technicalAiClient;
            _quotaService = quotaService;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException());

        // ─────────────────────────────────────────────
        // GET /api/practice/questions
        // Filter: category, role, difficulty, search, page, pageSize
        // ─────────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetList(
            [FromQuery] string? category,
            [FromQuery] string? role,
            [FromQuery] string? difficulty,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = GetUserId();

            // Base query: ONLY published + client-visible
            var query = _db.Questions.AsNoTracking()
                .Where(q => q.Status == "Published" && q.IsClientVisible);

            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(q => q.Category == category);
            if (!string.IsNullOrWhiteSpace(role))
                query = query.Where(q => q.Role.Contains(role));
            if (!string.IsNullOrWhiteSpace(difficulty))
                query = query.Where(q => q.Difficulty == difficulty);
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(q =>
                    q.Title.Contains(search) || q.Content.Contains(search));

            var total = await query.CountAsync();

            var questions = await query
                .OrderByDescending(q => q.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(q => new QuestionListItemDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Content = q.Content,
                    Category = q.Category,
                    Role = q.Role,
                    Difficulty = q.Difficulty,
                    TagsJson = q.TagsJson,
                    TechStackJson = q.TechStackJson
                })
                .ToListAsync();

            var questionIds = questions.Select(q => q.Id).ToList();

            // Get this user's practice history for these questions
            var historyList = await _db.UserQuestionPracticeHistories.AsNoTracking()
                .Where(h => h.UserId == userId && questionIds.Contains(h.QuestionId))
                .ToListAsync();

            var practiceMap = historyList
                .GroupBy(h => h.QuestionId)
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderByDescending(h => h.CreatedAt).First().PracticeStatus
                );

            // Enrich with practice status
            foreach (var item in questions)
                item.PracticeStatus = practiceMap.TryGetValue(item.Id, out var s) ? s : "NotStarted";

            return Ok(new PagedResult<QuestionListItemDto>
            {
                Items = questions,
                TotalItems = total,
                Page = page,
                PageSize = pageSize
            });
        }

        // ─────────────────────────────────────────────
        // GET /api/practice/questions/{id}
        // ─────────────────────────────────────────────
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = GetUserId();

            var q = await _db.Questions
                .Where(x => x.Id == id && x.Status == "Published" && x.IsClientVisible)
                .FirstOrDefaultAsync();

            if (q == null) return NotFound(new { message = "Câu hỏi không tồn tại hoặc chưa được publish." });

            var latestHistory = await _db.UserQuestionPracticeHistories
                .AsNoTracking()
                .Where(h => h.UserId == userId && h.QuestionId == id)
                .OrderByDescending(h => h.CreatedAt)
                .FirstOrDefaultAsync();

            var maxScoreQuery = await _db.UserQuestionPracticeHistories
                .AsNoTracking()
                .Where(h => h.UserId == userId && h.QuestionId == id)
                .Select(h => (float?)h.AiScore)
                .ToListAsync();
            float? maxScore = maxScoreQuery.Any() ? maxScoreQuery.Max() : null;

            return Ok(new QuestionDetailDto
            {
                Id = q.Id,
                Title = q.Title,
                Content = q.Content,
                ExpectedAnswerGuide = q.ExpectedAnswerGuide,
                ExampleAnswer = q.ExampleAnswer,
                Category = q.Category,
                Role = q.Role,
                Difficulty = q.Difficulty,
                TechStackJson = q.TechStackJson,
                TagsJson = q.TagsJson,
                PracticeStatus = latestHistory?.PracticeStatus ?? "NotStarted",
                HighestScore = maxScore,
                LastAttemptAt = latestHistory?.CreatedAt.ToLocalTime().ToString("yyyy-MM-dd HH:mm")
            });
        }

        [HttpPost("{id}/submit")]
        public async Task<IActionResult> Submit(int id, [FromBody] SubmitQuestionAnswerRequest req)
        {
            var userId = GetUserId();

            try
            {
                await _quotaService.ConsumeQuotaAsync(userId);
            }
            catch (QuotaExceededException ex)
            {
                return StatusCode(429, new { message = ex.Message });
            }

            var q = await _db.Questions
                .Where(x => x.Id == id && x.Status == "Published" && x.IsClientVisible)
                .FirstOrDefaultAsync();

            if (q == null) return NotFound(new { message = "Câu hỏi không tồn tại." });

            if (string.IsNullOrWhiteSpace(req.Answer))
                return BadRequest(new { message = "Câu trả lời không được để trống." });

            var techStack = new List<string>();
            if (!string.IsNullOrEmpty(q.TechStackJson))
            {
                try
                {
                    techStack = System.Text.Json.JsonSerializer.Deserialize<List<string>>(q.TechStackJson) ?? new List<string>();
                }
                catch {}
            }

            if (q.Category == "Technical" || q.Category == "Kỹ thuật")
            {
                var tags = new List<string>();
                if (!string.IsNullOrEmpty(q.TagsJson))
                {
                    try { tags = System.Text.Json.JsonSerializer.Deserialize<List<string>>(q.TagsJson) ?? new List<string>(); } catch {}
                }

                var validStages = new[] { "Core Technical Knowledge", "Applied Problem Solving", "Project & System Thinking" };
                var matchedStages = tags.Where(t => validStages.Contains(t)).ToList();
                
                if (matchedStages.Count == 0)
                {
                    return BadRequest(new { message = "Câu hỏi Technical này chưa được gán loại đánh giá (Stage). Vui lòng cập nhật câu hỏi." });
                }
                if (matchedStages.Count > 1)
                {
                    return BadRequest(new { message = "Câu hỏi Technical này được gán nhiều hơn 1 loại đánh giá (Stage). Không hợp lệ." });
                }
                
                string stage = matchedStages.First();

                var techEvalReq = new AiEvaluateAnswerRequest
                {
                    role = q.Role ?? "Developer",
                    difficulty = q.Difficulty ?? "Fresher",
                    tech_stack = string.Join(",", techStack),
                    stage = stage,
                    question = q.Content,
                    answer = req.Answer,
                    expected_answer_guide = q.ExpectedAnswerGuide ?? ""
                };

                var techAiResult = await _technicalAiClient.EvaluateAnswerAsync(techEvalReq);
                if (techAiResult == null) return StatusCode(500, new { message = "Lỗi khi gọi AI chấm điểm kỹ thuật." });

                float calculatedScore = 0f;
                var criteria = techAiResult.criteriaAnalysis ?? new List<AiCriterionAnalysis>();

                if (stage == "Core Technical Knowledge")
                {
                    float tk = criteria.FirstOrDefault(c => c.criterion == "Technical Knowledge")?.score ?? 0f;
                    float cu = criteria.FirstOrDefault(c => c.criterion == "Concept Understanding")?.score ?? 0f;
                    float tr = criteria.FirstOrDefault(c => c.criterion == "Technical Reasoning")?.score ?? 0f;
                    float comm = criteria.FirstOrDefault(c => c.criterion == "Communication")?.score ?? 0f;
                    calculatedScore = (tk * 0.35f) + (cu * 0.30f) + (tr * 0.20f) + (comm * 0.15f);
                }
                else if (stage == "Applied Problem Solving")
                {
                    float pa = criteria.FirstOrDefault(c => c.criterion == "Problem Analysis")?.score ?? 0f;
                    float sa = criteria.FirstOrDefault(c => c.criterion == "Solution Approach")?.score ?? 0f;
                    float tr = criteria.FirstOrDefault(c => c.criterion == "Technical Reasoning")?.score ?? 0f;
                    float bp = criteria.FirstOrDefault(c => c.criterion == "Best Practices")?.score ?? 0f;
                    calculatedScore = (pa * 0.30f) + (sa * 0.30f) + (tr * 0.25f) + (bp * 0.15f);
                }
                else if (stage == "Project & System Thinking")
                {
                    float pe = criteria.FirstOrDefault(c => c.criterion == "Practical Experience & Ownership")?.score ?? 0f;
                    float au = criteria.FirstOrDefault(c => c.criterion == "Architecture Understanding")?.score ?? 0f;
                    float tdm = criteria.FirstOrDefault(c => c.criterion == "Technical Decision Making")?.score ?? 0f;
                    float st = criteria.FirstOrDefault(c => c.criterion == "System Thinking & Trade-offs")?.score ?? 0f;
                    calculatedScore = (pe * 0.30f) + (au * 0.25f) + (tdm * 0.25f) + (st * 0.20f);
                }
                
                calculatedScore = (float)Math.Round(calculatedScore, 1);

                var history = new Entities.UserQuestionPracticeHistory
                {
                    UserId = userId,
                    QuestionId = id,
                    UserAnswer = req.Answer,
                    PracticeStatus = "Practiced",
                    AiScore = calculatedScore,
                    AiFeedback = techAiResult.summary ?? "",
                    StrengthsJson = System.Text.Json.JsonSerializer.Serialize(techAiResult.strengths ?? new List<string>()),
                    WeaknessesJson = System.Text.Json.JsonSerializer.Serialize(techAiResult.weaknesses ?? new List<string>()),
                    ImprovementSuggestionsJson = System.Text.Json.JsonSerializer.Serialize(techAiResult.improvementSuggestions ?? new List<string>()),
                    CreatedAt = DateTime.UtcNow
                };

                _db.UserQuestionPracticeHistories.Add(history);
                await _db.SaveChangesAsync();

                return Ok(new SubmitQuestionAnswerResult
                {
                    PracticeId = history.Id,
                    Score = history.AiScore,
                    Feedback = history.AiFeedback,
                    StrengthsJson = history.StrengthsJson,
                    WeaknessesJson = history.WeaknessesJson,
                    ImprovementSuggestionsJson = history.ImprovementSuggestionsJson,
                    ImprovedAnswer = new InterviewPro.API.Interfaces.ImprovedAnswerResult 
                    {
                        Action = techAiResult.improvedAnswer
                    },
                    TechnicalCriteriaAnalysis = techAiResult.criteriaAnalysis
                });
            }
            else
            {
                // Parse TagsJson to find HR Evaluation Category
                var tags = new List<string>();
                if (!string.IsNullOrEmpty(q.TagsJson))
                {
                    try
                    {
                        tags = System.Text.Json.JsonSerializer.Deserialize<List<string>>(q.TagsJson) ?? new List<string>();
                    }
                    catch {}
                }

                var validCategories = new[] { "Introduction & Motivation", "Behavioral / STAR", "Situational & Career" };
                var matchedCategories = tags.Where(t => validCategories.Contains(t)).ToList();

                if (matchedCategories.Count == 0)
                {
                    return BadRequest(new { message = "Câu hỏi HR này chưa được gán loại đánh giá (HR Evaluation Category). Vui lòng cập nhật câu hỏi." });
                }
                if (matchedCategories.Count > 1)
                {
                    return BadRequest(new { message = "Câu hỏi HR này được gán nhiều hơn 1 loại đánh giá (HR Evaluation Category). Không hợp lệ." });
                }

                string hrCategory = matchedCategories.First();

                var aiResult = await _aiClient.EvaluateHrAnswerAsync(
                    q.Role ?? "Developer",
                    q.Difficulty ?? "Fresher",
                    techStack,
                    hrCategory,
                    q.ExpectedAnswerGuide ?? "",
                    q.Content,
                    req.Answer
                );

                float sScore = (float)(aiResult.StarAnalysis?.Situation?.Score ?? 0);
                float tScore = (float)(aiResult.StarAnalysis?.Task?.Score ?? 0);
                float aScore = (float)(aiResult.StarAnalysis?.Action?.Score ?? 0);
                float rScore = (float)(aiResult.StarAnalysis?.Result?.Score ?? 0);
                float calculatedScore = (float)Math.Round(sScore * 0.20f + tScore * 0.20f + aScore * 0.30f + rScore * 0.30f, 1);

                var history = new Entities.UserQuestionPracticeHistory
                {
                    UserId = userId,
                    QuestionId = id,
                    UserAnswer = req.Answer,
                    PracticeStatus = "Practiced",
                    AiScore = calculatedScore,
                    AiFeedback = aiResult.Summary ?? "",
                    StrengthsJson = System.Text.Json.JsonSerializer.Serialize(aiResult.Strengths),
                    WeaknessesJson = System.Text.Json.JsonSerializer.Serialize(aiResult.Weaknesses),
                    ImprovementSuggestionsJson = System.Text.Json.JsonSerializer.Serialize(aiResult.ImprovementSuggestions),
                    CreatedAt = DateTime.UtcNow
                };

                _db.UserQuestionPracticeHistories.Add(history);
                await _db.SaveChangesAsync();

                return Ok(new SubmitQuestionAnswerResult
                {
                    PracticeId = history.Id,
                    Score = history.AiScore,
                    Feedback = history.AiFeedback,
                    StrengthsJson = history.StrengthsJson,
                    WeaknessesJson = history.WeaknessesJson,
                    ImprovementSuggestionsJson = history.ImprovementSuggestionsJson,
                    StarCompletion = aiResult.StarCompletion,
                    StarChecklist = aiResult.StarChecklist,
                    StarAnalysis = aiResult.StarAnalysis,
                    ImprovedAnswer = aiResult.ImprovedAnswer,
                    NextRecommendation = aiResult.NextRecommendation
                });
            }
        }
    }
}
