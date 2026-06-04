using System.Diagnostics;
using System.Net.Http.Json;
using System.Text.Json;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.Extensions.Logging;

namespace InterviewPro.API.Services
{
    /// <summary>
    /// HrAiClient: Đại diện giao tiếp với Python FastAPI AI Service.
    /// - Gọi 3 endpoints chính: generate-questions, evaluate-answer, final-evaluation
    /// - Tự động ghi log mỗi request vào bảng AiRequestLogs để monitor dashboard
    /// - Fallback an toàn khi AI Service không khả dụng
    /// </summary>
    public class HrAiClient : IHrAiClient
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly AppDbContext _db;
        private readonly ILogger<HrAiClient> _logger;

        public HrAiClient(IHttpClientFactory httpClientFactory, AppDbContext db, ILogger<HrAiClient> logger)
        {
            _httpClientFactory = httpClientFactory;
            _db = db;
            _logger = logger;
        }

        // ─────────────────────────────────────────────
        // 1. Sinh 10 câu hỏi HR từ AI
        // ─────────────────────────────────────────────
        public async Task<AiGeneratedQuestionsResult> GenerateHrQuestionsAsync(
            string role, string difficulty, List<string> techStack)
        {
            var sw = Stopwatch.StartNew();
            var log = new Entities.AiRequestLog
            {
                Feature = "HRInterview",
                RequestType = "GenerateQuestions",
                Status = "Success"
            };

            try
            {
                var client = _httpClientFactory.CreateClient("AIService");
                var payload = new
                {
                    role,
                    difficulty,
                    tech_stack = techStack,
                    total_questions = 10
                };

                var response = await client.PostAsJsonAsync("/ai/hr/generate-questions", payload);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<AiGeneratedQuestionsResult>(json,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                sw.Stop();
                log.ResponseTimeMs = sw.ElapsedMilliseconds;
                return result ?? new AiGeneratedQuestionsResult();
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Status = "Failed";
                log.ErrorMessage = ex.Message;
                log.ResponseTimeMs = sw.ElapsedMilliseconds;
                _logger.LogError(ex, "Error calling GenerateHrQuestions");

                // Fallback: trả danh sách câu hỏi mẫu để hệ thống không bị sập hoàn toàn
                return BuildFallbackQuestions(role, difficulty);
            }
            finally
            {
                _db.AiRequestLogs.Add(log);
                await _db.SaveChangesAsync();
            }
        }

        // ─────────────────────────────────────────────
        // 2. Đánh giá 1 câu trả lời theo 5 tiêu chí
        // ─────────────────────────────────────────────
        public async Task<AiEvaluationResult> EvaluateHrAnswerAsync(
            string role, string difficulty, List<string> techStack,
            string question, string answer)
        {
            var sw = Stopwatch.StartNew();
            var log = new Entities.AiRequestLog
            {
                Feature = "HRInterview",
                RequestType = "EvaluateAnswer",
                Status = "Success"
            };

            try
            {
                var client = _httpClientFactory.CreateClient("AIService");
                var payload = new { role, difficulty, tech_stack = techStack, question, answer };

                var response = await client.PostAsJsonAsync("/ai/hr/evaluate-answer", payload);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<AiEvaluationResult>(json,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (result != null)
                {
                    result.QuestionScore = result.OverallScore;
                    result.CommunicationScore = result.OverallScore;
                    result.ClarityScore = result.OverallScore;
                    result.StarScore = result.StarAnalysis != null ? 
                        (result.StarAnalysis.Situation.Score * 0.20 + 
                         result.StarAnalysis.Task.Score * 0.20 + 
                         result.StarAnalysis.Action.Score * 0.30 + 
                         result.StarAnalysis.Result.Score * 0.30) : result.OverallScore;
                    result.ProfessionalMindsetScore = result.OverallScore;
                    result.RelevanceScore = result.OverallScore;
                    result.Feedback = result.Summary;
                }

                sw.Stop();
                log.ResponseTimeMs = sw.ElapsedMilliseconds;
                return result ?? BuildFallbackEvaluation();
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Status = "Failed";
                log.ErrorMessage = ex.Message;
                log.ResponseTimeMs = sw.ElapsedMilliseconds;
                _logger.LogError(ex, "Error calling EvaluateHrAnswer");
                return BuildFallbackEvaluation();
            }
            finally
            {
                _db.AiRequestLogs.Add(log);
                await _db.SaveChangesAsync();
            }
        }

        // ─────────────────────────────────────────────
        // 3. Tổng kết sau 10 câu
        // ─────────────────────────────────────────────
        public async Task<HrFinalResultResponse> GenerateHrFinalResultAsync(
            string sessionId, string role, string difficulty, List<AiAnswerSummary> answers)
        {
            var sw = Stopwatch.StartNew();
            var log = new Entities.AiRequestLog
            {
                Feature = "HRInterview",
                RequestType = "FinalEvaluation",
                Status = "Success"
            };

            try
            {
                var client = _httpClientFactory.CreateClient("AIService");
                var payload = new { session_id = sessionId, role, difficulty, answers };

                var response = await client.PostAsJsonAsync("/ai/hr/final-evaluation", payload);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<HrFinalResultResponse>(json,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                sw.Stop();
                log.ResponseTimeMs = sw.ElapsedMilliseconds;
                return result ?? BuildFallbackFinal(sessionId);
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Status = "Failed";
                log.ErrorMessage = ex.Message;
                log.ResponseTimeMs = sw.ElapsedMilliseconds;
                _logger.LogError(ex, "Error calling GenerateHrFinalResult");
                return BuildFallbackFinal(sessionId);
            }
            finally
            {
                _db.AiRequestLogs.Add(log);
                await _db.SaveChangesAsync();
            }
        }

        // ─────────────────────────────────────────────
        // Fallback helpers (khi AI Service lỗi)
        // ─────────────────────────────────────────────
        private static AiGeneratedQuestionsResult BuildFallbackQuestions(string role, string difficulty)
        {
            var categories = new[]
            {
                "Giới thiệu bản thân", "Mục tiêu nghề nghiệp", "Điểm mạnh / điểm yếu",
                "Làm việc nhóm", "Xử lý mâu thuẫn", "Áp lực deadline",
                "Học công nghệ mới", "Tư duy giải quyết vấn đề",
                "Trách nhiệm trong dự án", "Lý do phù hợp vị trí"
            };
            var questions = new[]
            {
                "Hãy giới thiệu ngắn gọn về bản thân bạn.",
                $"Mục tiêu nghề nghiệp 3 năm tới của bạn trong ngành IT là gì?",
                "Điểm mạnh lớn nhất của bạn là gì? Hãy kể ví dụ cụ thể.",
                $"Hãy kể về một lần bạn làm việc nhóm trong dự án lập trình.",
                "Bạn xử lý thế nào khi không đồng ý với ý kiến của thành viên khác?",
                "Bạn làm gì khi gặp deadline gấp mà còn nhiều task chưa hoàn thành?",
                "Kể về một công nghệ mới bạn đã tự học gần đây và cách bạn tiếp cận.",
                "Khi gặp một bug khó, quy trình debug của bạn như thế nào?",
                "Hãy mô tả một dự án bạn chịu trách nhiệm chính và bạn đã làm gì.",
                $"Vì sao bạn nghĩ mình phù hợp với vị trí {role} ở cấp độ {difficulty}?"
            };

            var result = new AiGeneratedQuestionsResult();
            for (int i = 0; i < 10; i++)
            {
                result.Questions.Add(new AiGeneratedQuestion
                {
                    QuestionIndex = i + 1,
                    Category = categories[i],
                    QuestionText = questions[i],
                    ExpectedAnswerGuide = "Ứng viên nên trả lời theo cấu trúc STAR với ví dụ cụ thể."
                });
            }
            return result;
        }

        private static AiEvaluationResult BuildFallbackEvaluation() => new()
        {
            CommunicationScore = 7,
            ClarityScore = 7,
            StarScore = 6,
            ProfessionalMindsetScore = 7,
            RelevanceScore = 7,
            QuestionScore = 6.9,
            Level = "Khá",
            Feedback = "AI Service tạm thời không khả dụng. Điểm số này là ước tính tự động.",
            Strengths = new List<string> { "Có cố gắng trả lời đúng trọng tâm câu hỏi" },
            Weaknesses = new List<string> { "Không thể đánh giá chi tiết do AI Service lỗi" },
            ImprovementSuggestions = new List<string> { "Hãy thử lại sau khi hệ thống ổn định." }
        };

        private static HrFinalResultResponse BuildFallbackFinal(string sessionId) => new()
        {
            SessionId = sessionId,
            HrFinalScore = 7.0,
            Level = "Khá",
            Summary = "Tổng kết tự động do AI Service tạm thời không khả dụng.",
            OverallStrengths = new List<string> { "Hoàn thành đủ 10 câu hỏi phỏng vấn." },
            OverallWeaknesses = new List<string> { "Không thể phân tích chi tiết lúc này." },
            ImprovementRoadmap = new List<RoadmapItemDto>
            {
                new() { Title = "Luyện STAR method", Description = "Chuẩn bị theo 4 bước: Situation, Task, Action, Result." }
            },
            ReadinessLevel = "Đang đánh giá",
            Status = "completed"
        };
    }
}
