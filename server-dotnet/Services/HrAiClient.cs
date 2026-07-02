using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http.Json;
using System.Text.Json;
using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.Extensions.Logging;

namespace InterviewPro.API.Services
{
    /// <summary>
    /// HrAiClient: Giao tiếp với Python FastAPI AI Service.
    /// - Gọi 3 endpoints chính: generate-questions, evaluate-answer, final-evaluation
    /// - Tự động ghi log mỗi request bằng IAiRequestLogService để monitor dashboard
    /// - Fallback an toàn khi AI Service không khả dụng
    /// </summary>
    public class HrAiClient : IHrAiClient
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<HrAiClient> _logger;
        private readonly IAiRequestLogService _aiRequestLogService;

        public HrAiClient(
            IHttpClientFactory httpClientFactory,
            ILogger<HrAiClient> logger,
            IAiRequestLogService aiRequestLogService)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _aiRequestLogService = aiRequestLogService;
        }

        // ─────────────────────────────────────────────
        // 1. Sinh 10 câu hỏi HR từ AI
        // ─────────────────────────────────────────────
        public async Task<AiGeneratedQuestionsResult> GenerateHrQuestionsAsync(
            string role, string difficulty, List<string> techStack)
        {
            var sw = Stopwatch.StartNew();
            int inputTokens = 0, outputTokens = 0, totalTokens = 0;
            string model = "gpt-4o-mini";
            string status = "Success";
            string? errorMessage = null;

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
                
                // Parse tokens usage dynamically
                ParseTokenUsage(json, out model, out inputTokens, out outputTokens, out totalTokens);

                var result = JsonSerializer.Deserialize<AiGeneratedQuestionsResult>(json,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                sw.Stop();
                return result ?? new AiGeneratedQuestionsResult();
            }
            catch (Exception ex)
            {
                sw.Stop();
                status = "Failed";
                errorMessage = ex.Message;
                _logger.LogError(ex, "Error calling GenerateHrQuestions");

                // Fallback: trả danh sách câu hỏi mẫu để hệ thống không bị sập hoàn toàn
                return BuildFallbackQuestions(role, difficulty);
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

        // ─────────────────────────────────────────────
        // 1.5. Sinh 1 câu hỏi HR (Fallback)
        // ─────────────────────────────────────────────
        public async Task<SingleGeneratedQuestion> GenerateSingleHrQuestionAsync(
            string role, string level, string category, string targetSkill, string suggestedMethod, int maxAnswerTime)
        {
            var sw = Stopwatch.StartNew();
            int inputTokens = 0, outputTokens = 0, totalTokens = 0;
            string model = "gpt-4o-mini";
            string status = "Success";
            string? errorMessage = null;

            try
            {
                var client = _httpClientFactory.CreateClient("AIService");
                var payload = new
                {
                    role,
                    level,
                    category,
                    target_skill = targetSkill,
                    suggested_method = suggestedMethod,
                    max_answer_time = maxAnswerTime
                };

                var response = await client.PostAsJsonAsync("/ai/hr/generate-single-question", payload);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                
                // Parse tokens usage dynamically
                ParseTokenUsage(json, out model, out inputTokens, out outputTokens, out totalTokens);

                using var doc = JsonDocument.Parse(json);
                var questionElement = doc.RootElement.GetProperty("question");
                var result = JsonSerializer.Deserialize<SingleGeneratedQuestion>(questionElement.GetRawText(),
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                sw.Stop();
                return result ?? BuildFallbackSingleQuestion(category, targetSkill, level, suggestedMethod, maxAnswerTime);
            }
            catch (Exception ex)
            {
                sw.Stop();
                status = "Failed";
                errorMessage = ex.Message;
                _logger.LogError(ex, "Error calling GenerateSingleHrQuestionAsync");

                return BuildFallbackSingleQuestion(category, targetSkill, level, suggestedMethod, maxAnswerTime);
            }
            finally
            {
                await _aiRequestLogService.LogAsync(new AiRequestLogCreateDto
                {
                    Feature = "InterviewQuestionGeneration",
                    RequestType = "GenerateSingleQuestion",
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

        private SingleGeneratedQuestion BuildFallbackSingleQuestion(string category, string targetSkill, string level, string suggestedMethod, int maxAnswerTime)
        {
            return new SingleGeneratedQuestion
            {
                QuestionText = $"Hãy kể về một lần bạn thể hiện kỹ năng {targetSkill} trong công việc.",
                Category = category,
                Difficulty = level,
                TargetSkill = targetSkill,
                SuggestedMethod = suggestedMethod,
                MaxAnswerTime = maxAnswerTime,
                ExpectedAnswerGuide = $"Ứng viên cần sử dụng cấu trúc {suggestedMethod}."
            };
        }

        // ─────────────────────────────────────────────
        // 2. Đánh giá 1 câu trả lời theo 5 tiêu chí
        // ─────────────────────────────────────────────
        public async Task<AiEvaluationResult> EvaluateHrAnswerAsync(
            string role, string difficulty, List<string> techStack,
            string question, string answer)
        {
            var sw = Stopwatch.StartNew();
            int inputTokens = 0, outputTokens = 0, totalTokens = 0;
            string model = "gpt-4o-mini";
            string status = "Success";
            string? errorMessage = null;

            try
            {
                var client = _httpClientFactory.CreateClient("AIService");
                var payload = new { role, difficulty, tech_stack = techStack, question, answer };

                var response = await client.PostAsJsonAsync("/ai/hr/evaluate-answer", payload);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                
                // Parse tokens usage dynamically
                ParseTokenUsage(json, out model, out inputTokens, out outputTokens, out totalTokens);

                var result = JsonSerializer.Deserialize<AiEvaluationResult>(json,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                // Removed property mapping block as it's now computed by the backend

                sw.Stop();
                return result ?? BuildFallbackEvaluation();
            }
            catch (Exception ex)
            {
                sw.Stop();
                status = "Failed";
                errorMessage = ex.Message;
                _logger.LogError(ex, "Error calling EvaluateHrAnswer");
                return BuildFallbackEvaluation();
            }
            finally
            {
                await _aiRequestLogService.LogAsync(new AiRequestLogCreateDto
                {
                    Feature = "HRStarScoring",
                    RequestType = "EvaluateHrAnswer",
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

        // ─────────────────────────────────────────────
        // 3. Tổng kết sau 10 câu
        // ─────────────────────────────────────────────
        public async Task<HrFinalResultResponse> GenerateHrFinalResultAsync(
            string sessionId, string role, string difficulty, List<AiAnswerSummary> answers)
        {
            var sw = Stopwatch.StartNew();
            int inputTokens = 0, outputTokens = 0, totalTokens = 0;
            string model = "gpt-4o-mini";
            string status = "Success";
            string? errorMessage = null;

            try
            {
                var client = _httpClientFactory.CreateClient("AIService");
                var payload = new { session_id = sessionId, role, difficulty, answers };

                var response = await client.PostAsJsonAsync("/ai/hr/final-evaluation", payload);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                
                // Parse tokens usage dynamically
                ParseTokenUsage(json, out model, out inputTokens, out outputTokens, out totalTokens);

                var result = JsonSerializer.Deserialize<HrFinalResultResponse>(json,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                sw.Stop();
                return result ?? BuildFallbackFinal(sessionId);
            }
            catch (Exception ex)
            {
                sw.Stop();
                status = "Failed";
                errorMessage = ex.Message;
                _logger.LogError(ex, "Error calling GenerateHrFinalResult");
                return BuildFallbackFinal(sessionId);
            }
            finally
            {
                await _aiRequestLogService.LogAsync(new AiRequestLogCreateDto
                {
                    Feature = "CandidateEvaluation",
                    RequestType = "FinalEvaluation",
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

        // Helper to parse usage and model dynamically from JSON
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
            catch
            {
                // Ignore parsing errors and keep defaults
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
            Summary = "Không thể đánh giá do lỗi hệ thống AI hoặc không có dữ liệu hợp lệ.",

            Strengths = new List<string>(),
            Weaknesses = new List<string>(),
            ImprovementSuggestions = new List<string>(),
            StarCompletion = 0,
            StarChecklist = new StarChecklist(),
            StarAnalysis = new StarAnalysisResult(),
            ImprovedAnswer = new ImprovedAnswerResult()
        };

        private static HrFinalResultResponse BuildFallbackFinal(string sessionId) => new()
        {
            SessionId = sessionId,
            OverallScore = 0.0,
            CompositeScores = new CompositeScoresDto(),
            QuestionEvaluations = new List<HrQuestionEvaluationDto>(),
            Strengths = new List<HrStrengthDto>(),
            Improvements = new List<HrImprovementDto>(),
            RecommendedPractice = new List<HrRecommendedPracticeDto>(),
            OverallObservation = "Tổng kết tự động: Không có dữ liệu hợp lệ để đánh giá.",
            StrengthSummary = "Chưa có đủ dữ liệu để đánh giá điểm mạnh.",
            WeaknessSummary = "Chưa có đủ dữ liệu để đánh giá điểm yếu.",
            HiringRecommendation = "Chưa có đủ dữ liệu để đưa ra khuyến nghị tuyển dụng.",
            ReadinessLevel = "Cần luyện thêm",
            Status = "completed"
        };
    }
}
