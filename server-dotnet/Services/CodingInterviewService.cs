using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace InterviewPro.API.Services
{
    public class CodingInterviewService : ICodingInterviewService
    {
        private readonly AppDbContext _db;
        private readonly ICodingQuestionSelectionEngine _selectionEngine;
        private readonly IHttpClientFactory _clientFactory;
        private readonly IConfiguration _config;
        private readonly ILogger<CodingInterviewService> _logger;

        public CodingInterviewService(
            AppDbContext db,
            ICodingQuestionSelectionEngine selectionEngine,
            IHttpClientFactory clientFactory,
            IConfiguration config,
            ILogger<CodingInterviewService> logger)
        {
            _db = db;
            _selectionEngine = selectionEngine;
            _clientFactory = clientFactory;
            _config = config;
            _logger = logger;
        }

        private HttpClient CreateAiClient()
        {
            var client = _clientFactory.CreateClient("AIService");
            var baseUrl = _config["AiService:BaseUrl"] ?? "http://localhost:8000";
            client.BaseAddress = new Uri(baseUrl);
            return client;
        }

        private static T Deserialize<T>(string? json, T defaultVal)
        {
            if (string.IsNullOrEmpty(json)) return defaultVal;
            try { return JsonSerializer.Deserialize<T>(json) ?? defaultVal; }
            catch { return defaultVal; }
        }

        private static string Serialize<T>(T val)
        {
            try { return JsonSerializer.Serialize(val); }
            catch { return "{}"; }
        }

        public async Task<CodingInterviewSessionResponse> StartInterviewAsync(int userId, StartCodingInterviewRequest request)
        {
            // 1. Chọn bài 1
            var p1Model = await _selectionEngine.GetNextQuestionAsync(
                request.Role, request.Level, request.TechStack, request.Language, 1, null);

            var session = new CodingInterviewSession
            {
                UserId = userId,
                Role = request.Role,
                Level = request.Level,
                TechStack = request.TechStack,
                Language = request.Language,
                Status = "InProgress",
                CurrentProblemIndex = 1,
                CurrentStage = "ProblemUnderstanding"
            };

            _db.CodingInterviewSessions.Add(session);
            await _db.SaveChangesAsync();

            var problem = new CodingInterviewProblem
            {
                SessionId = session.Id,
                ProblemIndex = 1,
                CodingProblemId = p1Model.CodingProblemId,
                Source = p1Model.Source,
                Title = p1Model.Title,
                Description = p1Model.Description,
                Difficulty = p1Model.Difficulty,
                SubmittedCode = string.Empty
            };

            _db.CodingInterviewProblems.Add(problem);
            await _db.SaveChangesAsync();

            // AI sinh câu mở đầu cho Stage 1
            var client = CreateAiClient();
            var aiReq = new
            {
                role = session.Role,
                difficulty = session.Level,
                tech_stack = session.TechStack,
                problem_title = problem.Title,
                problem_description = problem.Description,
                language = session.Language,
                stage = "ProblemUnderstanding",
                context = "",
                candidate_input = "Xin chào, tôi đã sẵn sàng làm bài coding này.",
                current_code = ""
            };

            var response = await client.PostAsJsonAsync("/ai/coding-interview/next-stage-prompt", aiReq);
            response.EnsureSuccessStatusCode();
            var aiRes = await response.Content.ReadFromJsonAsync<SubmitStageInputResponse>();

            var stageLog = new CodingInterviewStageLog
            {
                ProblemId = problem.Id,
                Stage = "ProblemUnderstanding",
                CandidateInput = "Xin chào, tôi đã sẵn sàng làm bài coding này.",
                AiResponse = aiRes?.AiResponse ?? "Hãy giải thích cách bạn hiểu về đề bài này và các edge cases bạn quan tâm."
            };

            _db.CodingInterviewStageLogs.Add(stageLog);
            await _db.SaveChangesAsync();

            return await GetSessionAsync(userId, session.SessionGuid);
        }

        public async Task<CodingInterviewSessionResponse> GetSessionAsync(int userId, string sessionId)
        {
            var session = await _db.CodingInterviewSessions
                .Include(s => s.Problems)
                .FirstOrDefaultAsync(s => s.UserId == userId && s.SessionGuid == sessionId);

            if (session == null) throw new KeyNotFoundException("Phiên phỏng vấn coding không tồn tại.");

            var problemsDto = session.Problems.Select(p => new CodingInterviewProblemDto
            {
                ProblemIndex = p.ProblemIndex,
                Title = p.Title,
                Description = p.Description,
                Difficulty = p.Difficulty,
                StarterCode = p.SubmittedCode ?? string.Empty,
                PassedTestCases = p.PassedTestCases,
                TotalTestCases = p.TotalTestCases,
                Status = p.ProblemIndex < session.CurrentProblemIndex ? "Completed" : (p.ProblemIndex == session.CurrentProblemIndex ? "InProgress" : "NotStarted")
            }).ToList();

            return new CodingInterviewSessionResponse
            {
                SessionId = session.SessionGuid,
                Status = session.Status,
                CurrentProblemIndex = session.CurrentProblemIndex,
                CurrentStage = session.CurrentStage,
                Problems = problemsDto
            };
        }

        public async Task<SubmitStageInputResponse> SubmitStageInputAsync(int userId, string sessionId, SubmitStageInputRequest request)
        {
            var session = await _db.CodingInterviewSessions
                .Include(s => s.Problems)
                .ThenInclude(p => p.StageLogs)
                .FirstOrDefaultAsync(s => s.UserId == userId && s.SessionGuid == sessionId);

            if (session == null) throw new KeyNotFoundException("Session not found");
            if (session.Status == "Completed") throw new InvalidOperationException("Session is already completed");

            var currentProblem = session.Problems.FirstOrDefault(p => p.ProblemIndex == session.CurrentProblemIndex);
            if (currentProblem == null) throw new InvalidOperationException("No active problem found");

            // Build context from previous conversation
            var contextBuilder = new System.Text.StringBuilder();
            var logs = currentProblem.StageLogs.OrderBy(l => l.CreatedAt);
            foreach (var log in logs)
            {
                contextBuilder.AppendLine($"Candidate: {log.CandidateInput}");
                contextBuilder.AppendLine($"AI: {log.AiResponse}");
                contextBuilder.AppendLine("---");
            }

            // Gọi AI Service
            var client = CreateAiClient();
            var aiReq = new
            {
                role = session.Role,
                difficulty = session.Level,
                tech_stack = session.TechStack,
                problem_title = currentProblem.Title,
                problem_description = currentProblem.Description,
                language = session.Language,
                stage = session.CurrentStage,
                context = contextBuilder.ToString(),
                candidate_input = request.Input,
                current_code = currentProblem.SubmittedCode ?? ""
            };

            var response = await client.PostAsJsonAsync("/ai/coding-interview/next-stage-prompt", aiReq);
            response.EnsureSuccessStatusCode();
            var aiRes = await response.Content.ReadFromJsonAsync<SubmitStageInputResponse>();

            if (aiRes == null) throw new Exception("Không đọc được phản hồi từ AI Service.");

            // Lưu log hội thoại hiện tại
            var newLog = new CodingInterviewStageLog
            {
                ProblemId = currentProblem.Id,
                Stage = session.CurrentStage,
                CandidateInput = request.Input,
                AiResponse = aiRes.AiResponse
            };

            // Nếu chuyển Stage -> Gọi AI Evaluate Stage hiện tại trước
            if (aiRes.NextStage != session.CurrentStage)
            {
                try
                {
                    var evalReq = new
                    {
                        role = session.Role,
                        difficulty = session.Level,
                        problem_title = currentProblem.Title,
                        problem_description = currentProblem.Description,
                        stage = session.CurrentStage,
                        stage_history = contextBuilder.ToString() + $"\nCandidate: {request.Input}\nAI: {aiRes.AiResponse}"
                    };

                    var evalResponse = await client.PostAsJsonAsync("/ai/coding-interview/evaluate-stage", evalReq);
                    if (evalResponse.IsSuccessStatusCode)
                    {
                        var evalResult = await evalResponse.Content.ReadFromJsonAsync<JsonElement>();
                        newLog.EvaluationJson = evalResult.ToString();

                        // Cập nhật Dimension Scores tương ứng
                        float score = evalResult.GetProperty("score").GetSingle();
                        UpdateDimensionScore(currentProblem, session.CurrentStage, score);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi tự động chấm điểm giai đoạn.");
                }

                // Cập nhật trạng thái
                session.CurrentStage = aiRes.NextStage;

                // Nếu kết thúc bài toán 1 -> Chuyển qua bài toán 2
                if (session.CurrentStage == "Completed" || session.CurrentStage == "Evaluation")
                {
                    if (session.CurrentProblemIndex == 1)
                    {
                        // Tính điểm trung bình Bài 1
                        float avgScore = (currentProblem.ProblemUnderstandingScore + currentProblem.AlgorithmDesignScore + 
                            currentProblem.CorrectnessScore + currentProblem.QualityScore + 
                            currentProblem.ComplexityScore + currentProblem.TestingScore + currentProblem.CommunicationScore) / 7.0f;

                        // Tạo Bài 2 với cơ chế Adaptive Difficulty
                        var p2Model = await _selectionEngine.GetNextQuestionAsync(
                            session.Role, session.Level, session.TechStack, session.Language, 2, avgScore);

                        var problem2 = new CodingInterviewProblem
                        {
                            SessionId = session.Id,
                            ProblemIndex = 2,
                            CodingProblemId = p2Model.CodingProblemId,
                            Source = p2Model.Source,
                            Title = p2Model.Title,
                            Description = p2Model.Description,
                            Difficulty = p2Model.Difficulty,
                            SubmittedCode = string.Empty
                        };

                        _db.CodingInterviewProblems.Add(problem2);
                        session.CurrentProblemIndex = 2;
                        session.CurrentStage = "ProblemUnderstanding";
                    }
                    else
                    {
                        // Hoàn tất phiên phỏng vấn coding
                        session.Status = "Completed";
                        session.CompletedAt = DateTime.UtcNow;
                    }
                }
            }

            _db.CodingInterviewStageLogs.Add(newLog);
            await _db.SaveChangesAsync();

            return new SubmitStageInputResponse
            {
                AiResponse = aiRes.AiResponse,
                NextStage = session.CurrentStage,
                StageEvaluationJson = newLog.EvaluationJson
            };
        }

        private void UpdateDimensionScore(CodingInterviewProblem problem, string stage, float score)
        {
            switch (stage)
            {
                case "ProblemUnderstanding":
                    problem.ProblemUnderstandingScore = score;
                    break;
                case "SolutionDesign":
                    problem.AlgorithmDesignScore = score;
                    break;
                case "Implementation":
                    problem.QualityScore = score;
                    break;
                case "Testing":
                    problem.TestingScore = score;
                    break;
                case "Optimization":
                    problem.ComplexityScore = score;
                    break;
            }
        }

        public async Task<CodingSandboxRunResponse> RunSandboxCodeAsync(int userId, string sessionId, CodingSandboxRunRequest request)
        {
            // Tìm Coding Problem cục bộ để lấy Test Cases mẫu
            var session = await _db.CodingInterviewSessions
                .Include(s => s.Problems)
                .FirstOrDefaultAsync(s => s.UserId == userId && s.SessionGuid == sessionId);

            if (session == null) throw new KeyNotFoundException("Session not found");
            var currentProblem = session.Problems.FirstOrDefault(p => p.ProblemIndex == session.CurrentProblemIndex);
            if (currentProblem == null) throw new InvalidOperationException("No active problem");

            // Tải Public Testcases từ bài coding gốc (nếu có)
            if (currentProblem.CodingProblemId == null)
                throw new InvalidOperationException("Bài dynamic AI không hỗ trợ chạy Sandbox chay.");

            var originalProblem = await _db.CodingProblems.FindAsync(currentProblem.CodingProblemId.Value);
            if (originalProblem == null) throw new Exception("Không tìm thấy đề gốc.");

            var publicCases = Deserialize(originalProblem.PublicTestCasesJson, new List<CodingTestCaseDto>());

            var payload = new
            {
                language = session.Language,
                code = request.Code,
                functionName = originalProblem.FunctionName,
                methodSignature = originalProblem.MethodSignature,
                returnType = originalProblem.ReturnType,
                testCases = publicCases.Select(tc => new
                {
                    input = tc.Input,
                    expectedOutput = tc.ExpectedOutput,
                    isHidden = false
                }).ToList()
            };

            var client = CreateAiClient();
            var response = await client.PostAsJsonAsync("/ai/practice/run", payload);
            response.EnsureSuccessStatusCode();

            var runResult = await response.Content.ReadFromJsonAsync<CodingSandboxRunResponse>();
            if (runResult == null) throw new Exception("Failed to get runner output");

            // Lưu code hiện tại
            currentProblem.SubmittedCode = request.Code;
            await _db.SaveChangesAsync();

            return runResult;
        }

        public async Task<CodingSandboxRunResponse> SubmitSandboxCodeAsync(int userId, string sessionId, CodingSandboxRunRequest request)
        {
            var session = await _db.CodingInterviewSessions
                .Include(s => s.Problems)
                .FirstOrDefaultAsync(s => s.UserId == userId && s.SessionGuid == sessionId);

            if (session == null) throw new KeyNotFoundException("Session not found");
            var currentProblem = session.Problems.FirstOrDefault(p => p.ProblemIndex == session.CurrentProblemIndex);
            if (currentProblem == null) throw new InvalidOperationException("No active problem");

            if (currentProblem.CodingProblemId == null)
                throw new InvalidOperationException("Bài dynamic AI không hỗ trợ submit.");

            var originalProblem = await _db.CodingProblems.FindAsync(currentProblem.CodingProblemId.Value);
            if (originalProblem == null) throw new Exception("Không tìm thấy đề gốc.");

            var publicCases = Deserialize(originalProblem.PublicTestCasesJson, new List<CodingTestCaseDto>());
            var hiddenCases = Deserialize(originalProblem.HiddenTestCasesJson, new List<CodingTestCaseDto>());

            var allTestCases = publicCases
                .Select(tc => new { input = tc.Input, expectedOutput = tc.ExpectedOutput, isHidden = false })
                .Concat(hiddenCases.Select(tc => new { input = tc.Input, expectedOutput = tc.ExpectedOutput, isHidden = true }))
                .ToList();

            var payload = new
            {
                problemTitle = originalProblem.Title,
                problemDescription = originalProblem.Description,
                language = session.Language,
                code = request.Code,
                functionName = originalProblem.FunctionName,
                methodSignature = originalProblem.MethodSignature,
                returnType = originalProblem.ReturnType,
                testCases = allTestCases
            };

            var client = CreateAiClient();
            var response = await client.PostAsJsonAsync("/ai/practice/submit", payload);
            response.EnsureSuccessStatusCode();

            var runResult = await response.Content.ReadFromJsonAsync<AiSubmitResponse>();
            if (runResult == null) throw new Exception("Failed to get submit response");

            currentProblem.SubmittedCode = request.Code;
            currentProblem.PassedTestCases = runResult.PassedTestCases;
            currentProblem.TotalTestCases = runResult.TotalTestCases;
            currentProblem.ExecutionTimeMs = runResult.RuntimeMs;
            currentProblem.MemoryUsageMb = runResult.MemoryUsageMb;
            
            // Correctness Score = (pass / total) * 10
            currentProblem.CorrectnessScore = runResult.TotalTestCases > 0 
                ? ((float)runResult.PassedTestCases / runResult.TotalTestCases) * 10f 
                : 0f;

            await _db.SaveChangesAsync();

            return new CodingSandboxRunResponse
            {
                Status = runResult.Status,
                PassedTestCases = runResult.PassedTestCases,
                TotalTestCases = runResult.TotalTestCases,
                RuntimeMs = runResult.RuntimeMs,
                MemoryUsageMb = runResult.MemoryUsageMb
            };
        }

        public async Task<string> GetFinalReportAsync(int userId, string sessionId)
        {
            var session = await _db.CodingInterviewSessions
                .Include(s => s.Problems)
                .ThenInclude(p => p.StageLogs)
                .FirstOrDefaultAsync(s => s.UserId == userId && s.SessionGuid == sessionId);

            if (session == null) throw new KeyNotFoundException("Session not found");
            if (session.Status != "Completed") throw new InvalidOperationException("Phiên phỏng vấn coding chưa kết thúc.");

            if (!string.IsNullOrEmpty(session.FinalReportJson))
            {
                return session.FinalReportJson;
            }

            // Phân tích Weighted Score
            // Trọng số: Understanding 10%, Design 20%, Correctness 30%, Quality 15%, Complexity 10%, Testing 10%, Comm 5%
            foreach (var p in session.Problems)
            {
                // Giả định điểm Communication = Điểm trung bình của các Stage Logs
                p.CommunicationScore = 8.5f; // Điểm mặc định
            }

            var p1 = session.Problems.FirstOrDefault(p => p.ProblemIndex == 1);
            var p2 = session.Problems.FirstOrDefault(p => p.ProblemIndex == 2);

            if (p1 != null && p2 != null)
            {
                session.AvgProblemUnderstandingScore = (p1.ProblemUnderstandingScore + p2.ProblemUnderstandingScore) / 2.0f;
                session.AvgAlgorithmDesignScore = (p1.AlgorithmDesignScore + p2.AlgorithmDesignScore) / 2.0f;
                session.AvgCorrectnessScore = (p1.CorrectnessScore + p2.CorrectnessScore) / 2.0f;
                session.AvgQualityScore = (p1.QualityScore + p2.QualityScore) / 2.0f;
                session.AvgComplexityScore = (p1.ComplexityScore + p2.ComplexityScore) / 2.0f;
                session.AvgTestingScore = (p1.TestingScore + p2.TestingScore) / 2.0f;
                session.AvgCommunicationScore = (p1.CommunicationScore + p2.CommunicationScore) / 2.0f;

                // Tính Weighted Score
                session.OverallScore = (session.AvgProblemUnderstandingScore * 0.1f) +
                                       (session.AvgAlgorithmDesignScore * 0.2f) +
                                       (session.AvgCorrectnessScore * 0.3f) +
                                       (session.AvgQualityScore * 0.15f) +
                                       (session.AvgComplexityScore * 0.1f) +
                                       (session.AvgTestingScore * 0.1f) +
                                       (session.AvgCommunicationScore * 0.05f);
            }

            // Gọi AI xuất báo cáo tổng hợp cuối cùng
            var summaryBuilder = new System.Text.StringBuilder();
            foreach (var p in session.Problems)
            {
                summaryBuilder.AppendLine($"Bài {p.ProblemIndex}: {p.Title} ({p.Difficulty})");
                summaryBuilder.AppendLine($"Kết quả testcase: {p.PassedTestCases}/{p.TotalTestCases}");
                summaryBuilder.AppendLine($"Điểm thành phần: Understanding={p.ProblemUnderstandingScore}, Design={p.AlgorithmDesignScore}, Correctness={p.CorrectnessScore}, Quality={p.QualityScore}, Complexity={p.ComplexityScore}, Testing={p.TestingScore}");
                summaryBuilder.AppendLine("---");
            }

            var aiReq = new
            {
                role = session.Role,
                difficulty = session.Level,
                language = session.Language,
                problems_summary = summaryBuilder.ToString(),
                interview_memory = session.InterviewMemorySummary ?? "Ứng viên viết code nhất quán, chú trọng tối ưu hóa giải thuật."
            };

            var client = CreateAiClient();
            var response = await client.PostAsJsonAsync("/ai/coding-interview/final-evaluation", aiReq);
            response.EnsureSuccessStatusCode();

            var finalRes = await response.Content.ReadAsStringAsync();
            session.FinalReportJson = finalRes;
            await _db.SaveChangesAsync();

            return finalRes;
        }
    }
}
