using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace InterviewPro.API.Services
{
    public class PracticeCodingProblemService : IPracticeCodingProblemService
    {
        private readonly AppDbContext _db;
        private readonly IHttpClientFactory _clientFactory;
        private readonly IConfiguration _config;
        private readonly IAiRequestLogService _aiRequestLogService;

        public PracticeCodingProblemService(
            AppDbContext db,
            IHttpClientFactory clientFactory,
            IConfiguration config,
            IAiRequestLogService aiRequestLogService)
        {
            _db = db;
            _clientFactory = clientFactory;
            _config = config;
            _aiRequestLogService = aiRequestLogService;
        }

        // ─────────────────────────────────────────────────
        // Helpers
        // ─────────────────────────────────────────────────

        private static T Deserialize<T>(string? json, T defaultVal)
        {
            if (string.IsNullOrEmpty(json)) return defaultVal;
            try { return System.Text.Json.JsonSerializer.Deserialize<T>(json) ?? defaultVal; }
            catch { return defaultVal; }
        }

        private static string Serialize<T>(T val)
        {
            try { return System.Text.Json.JsonSerializer.Serialize(val); }
            catch { return "{}"; }
        }

        private HttpClient CreateAiClient()
        {
            var client = _clientFactory.CreateClient("AIService");
            var baseUrl = _config["AiService:BaseUrl"] ?? "http://localhost:8000";
            client.BaseAddress = new Uri(baseUrl);
            return client;
        }

        /// <summary>
        /// Maps judge test-case results to an overall submission status.
        /// </summary>
        private static string GetJudgeStatus(List<TestCaseResultDto> results, int passed, int total)
        {
            if (total == 0) return "NoTestCases";
            if (results.Any(r => r.Status == "CompileError")) return "CompileError";
            if (results.Any(r => r.Status == "Timeout")) return "Timeout";
            if (results.Any(r => r.Status == "RuntimeError")) return "RuntimeError";
            return passed == total ? "Accepted" : "WrongAnswer";
        }

        /// <summary>
        /// Maps entity progress to a display status string.
        /// </summary>
        private static string GetPracticeStatus(UserCodingProblemProgress? progress)
        {
            if (progress == null) return "NotStarted";
            if (progress.IsSolved) return "Solved";
            if (progress.AttemptCount > 0) return "InProgress";
            return "NotStarted";
        }

        // ─────────────────────────────────────────────────
        // GET list
        // ─────────────────────────────────────────────────

        public async Task<PagedResult<CodingProblemListItemDto>> GetPracticeProblemsAsync(
            int userId,
            string? difficulty,
            string? category,
            string? recommendedLevel,
            string? search,
            int page,
            int pageSize)
        {
            var query = _db.CodingProblems
                .Where(p => p.Status == "Published" && p.IsClientVisible);

            // ── Server-side filters ──────────────────────
            if (!string.IsNullOrWhiteSpace(difficulty))
                query = query.Where(p => p.Difficulty == difficulty);

            if (!string.IsNullOrWhiteSpace(recommendedLevel))
                query = query.Where(p => p.RecommendedLevel == recommendedLevel);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(p =>
                    p.Title.Contains(term) ||
                    p.ProblemCode.Contains(term) ||
                    p.ShortDescription.Contains(term));
            }

            var allProblems = await query
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            // ── In-memory filter for CategoriesJson ─────
            var filteredProblems = allProblems.AsEnumerable();
            if (!string.IsNullOrWhiteSpace(category))
            {
                filteredProblems = filteredProblems.Where(p =>
                    Deserialize(p.CategoriesJson, new List<string>())
                        .Any(c => c.Equals(category, StringComparison.OrdinalIgnoreCase)));
            }

            var total = filteredProblems.Count();
            var problemsPage = filteredProblems
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var problemIds = problemsPage.Select(p => p.Id).ToList();

            // ── Fetch user progress in one query ─────────
            var progressMap = await _db.UserCodingProblemProgresses
                .Where(p => p.UserId == userId && problemIds.Contains(p.CodingProblemId))
                .ToDictionaryAsync(x => x.CodingProblemId, x => x);

            var items = problemsPage.Select(p =>
            {
                progressMap.TryGetValue(p.Id, out var prog);
                return new CodingProblemListItemDto
                {
                    Id = p.Id,
                    ProblemCode = p.ProblemCode,
                    Title = p.Title,
                    ShortDescription = p.ShortDescription,
                    Difficulty = p.Difficulty,
                    Categories = Deserialize(p.CategoriesJson, new List<string>()),
                    RecommendedLevel = p.RecommendedLevel,
                    FunctionName = p.FunctionName,
                    MethodSignature = p.MethodSignature,
                    ReturnType = p.ReturnType,
                    TargetSkills = Deserialize(p.TargetSkillsJson, new List<string>()),
                    EstimatedMinutes = p.EstimatedMinutes,
                    SupportedLanguages = Deserialize(p.SupportedLanguagesJson, new List<string>()),
                    PublicTestCaseCount = Deserialize(p.PublicTestCasesJson, new List<CodingTestCaseDto>()).Count,
                    // HiddenTestCaseCount intentionally not exposed to client
                    Status = p.Status,
                    IsClientVisible = p.IsClientVisible,
                    AllowRandomSelection = p.AllowRandomSelection,
                    CreatedAt = p.CreatedAt,
                    PracticeStatus = GetPracticeStatus(prog),
                    AttemptCount = prog?.AttemptCount ?? 0,
                    BestScore = prog?.BestScore,
                    CompletionStatus = GetPracticeStatus(prog),
                };
            }).ToList();

            return new PagedResult<CodingProblemListItemDto>
            {
                Items = items,
                TotalItems = total,
                Page = page,
                PageSize = pageSize
            };
        }

        // ─────────────────────────────────────────────────
        // GET detail
        // ─────────────────────────────────────────────────

        public async Task<CodingProblemDetailDto?> GetByIdAsync(Guid id, int userId)
        {
            var p = await _db.CodingProblems
                .FirstOrDefaultAsync(x => x.Id == id && x.Status == "Published" && x.IsClientVisible);

            if (p == null) return null;

            var progress = await _db.UserCodingProblemProgresses
                .FirstOrDefaultAsync(x => x.UserId == userId && x.CodingProblemId == id);

            return new CodingProblemDetailDto
            {
                Id = p.Id,
                ProblemCode = p.ProblemCode,
                Title = p.Title,
                ShortDescription = p.ShortDescription,
                Description = p.Description,
                Difficulty = p.Difficulty,
                Categories = Deserialize(p.CategoriesJson, new List<string>()),
                RecommendedLevel = p.RecommendedLevel,
                FunctionName = p.FunctionName,
                MethodSignature = p.MethodSignature,
                ReturnType = p.ReturnType,
                TargetSkills = Deserialize(p.TargetSkillsJson, new List<string>()),
                EstimatedMinutes = p.EstimatedMinutes,
                InputFormat = p.InputFormat,
                OutputFormat = p.OutputFormat,
                Constraints = Deserialize(p.ConstraintsJson, new List<string>()),
                Examples = Deserialize(p.ExamplesJson, new List<CodingExampleDto>()),
                PublicTestCases = Deserialize(p.PublicTestCasesJson, new List<CodingTestCaseDto>()),
                HiddenTestCases = null,   // Never expose hidden test cases to client
                SupportedLanguages = Deserialize(p.SupportedLanguagesJson, new List<string>()),
                StarterCode = Deserialize(p.StarterCodeJson, new Dictionary<string, string>()),
                Solution = null,           // Never expose solution to client
                Status = p.Status,
                IsClientVisible = p.IsClientVisible,
                AllowRandomSelection = p.AllowRandomSelection,
                CreatedByAdminId = p.CreatedByAdminId,
                CreatedByAdminName = p.CreatedByAdminName,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                PracticeStatus = GetPracticeStatus(progress),
                AttemptCount = progress?.AttemptCount ?? 0,
                BestScore = progress?.BestScore
            };
        }

        // ─────────────────────────────────────────────────
        // GET random (used by coding interview sessions)
        // ─────────────────────────────────────────────────

        public async Task<CodingProblemDetailDto?> GetRandomCodingProblemAsync(
            string? difficulty, string? recommendedLevel)
        {
            var query = _db.CodingProblems
                .Where(p => p.Status == "Published" && p.AllowRandomSelection && p.IsClientVisible);

            if (!string.IsNullOrWhiteSpace(difficulty))
                query = query.Where(p => p.Difficulty == difficulty);

            if (!string.IsNullOrWhiteSpace(recommendedLevel))
                query = query.Where(p => p.RecommendedLevel == recommendedLevel);

            var problems = await query.ToListAsync();
            if (!problems.Any()) return null;

            var rand = new Random();
            var rp = problems[rand.Next(problems.Count)];

            return new CodingProblemDetailDto
            {
                Id = rp.Id,
                ProblemCode = rp.ProblemCode,
                Title = rp.Title,
                ShortDescription = rp.ShortDescription,
                Description = rp.Description,
                Difficulty = rp.Difficulty,
                Categories = Deserialize(rp.CategoriesJson, new List<string>()),
                RecommendedLevel = rp.RecommendedLevel,
                FunctionName = rp.FunctionName,
                MethodSignature = rp.MethodSignature,
                ReturnType = rp.ReturnType,
                TargetSkills = Deserialize(rp.TargetSkillsJson, new List<string>()),
                EstimatedMinutes = rp.EstimatedMinutes,
                InputFormat = rp.InputFormat,
                OutputFormat = rp.OutputFormat,
                Constraints = Deserialize(rp.ConstraintsJson, new List<string>()),
                Examples = Deserialize(rp.ExamplesJson, new List<CodingExampleDto>()),
                PublicTestCases = Deserialize(rp.PublicTestCasesJson, new List<CodingTestCaseDto>()),
                SupportedLanguages = Deserialize(rp.SupportedLanguagesJson, new List<string>()),
                StarterCode = Deserialize(rp.StarterCodeJson, new Dictionary<string, string>()),
                HiddenTestCases = null,
                Solution = null,
                PracticeStatus = "NotStarted"
            };
        }

        // ─────────────────────────────────────────────────
        // POST run — executes public test cases only, no save
        // ─────────────────────────────────────────────────

        public async Task<SubmitCodeResult> RunCodeAsync(Guid id, int userId, SubmitCodeRequest request)
        {
            // ── 1. Fetch problem ──────────────────────────────────
            var p = await _db.CodingProblems
                .FirstOrDefaultAsync(x => x.Id == id && x.Status == "Published" && x.IsClientVisible)
                ?? throw new ArgumentException("Bài coding không tồn tại hoặc chưa được publish.");

            // ── 2. Validate inputs ────────────────────────────────
            if (string.IsNullOrWhiteSpace(request.Code))
                throw new ArgumentException("Code không được để trống.");

            var supportedLanguages = Deserialize(p.SupportedLanguagesJson, new List<string>());
            if (supportedLanguages.Any() &&
                !supportedLanguages.Any(l => l.Equals(request.Language, StringComparison.OrdinalIgnoreCase)))
            {
                throw new ArgumentException(
                    $"Ngôn ngữ '{request.Language}' không được hỗ trợ cho bài này. " +
                    $"Ngôn ngữ hỗ trợ: {string.Join(", ", supportedLanguages)}");
            }

            // ── 3. Build payload with public test cases only ──────
            var publicCases = Deserialize(p.PublicTestCasesJson, new List<CodingTestCaseDto>());
            if (!publicCases.Any())
                throw new ArgumentException("Bài này chưa có public test case nào.");

            var payload = new
            {
                language = request.Language,
                code = request.Code,
                functionName = p.FunctionName,
                methodSignature = p.MethodSignature,
                returnType = p.ReturnType,
                testCases = publicCases.Select(tc => new
                {
                    input = tc.Input,
                    expectedOutput = tc.ExpectedOutput,
                    isHidden = false
                }).ToList()
            };

            // ── 4. Call Judge service ─────────────────────────────
            var client = CreateAiClient();
            var response = await client.PostAsJsonAsync("/ai/practice/run", payload);

            if (!response.IsSuccessStatusCode)
            {
                var errBody = await response.Content.ReadAsStringAsync();
                throw new Exception($"Judge service trả lỗi: {errBody}");
            }

            var judgeResult = await response.Content.ReadFromJsonAsync<AiRunResponse>();
            if (judgeResult?.Results == null)
                throw new Exception("Không đọc được kết quả từ Judge service.");

            // ── 5. Build response — no attempt saved ──────────────
            var testResults = judgeResult.Results.Select(r => new TestCaseResultDto
            {
                Index = r.TestCaseIndex,
                Input = r.Input,
                ExpectedOutput = r.ExpectedOutput,
                ActualOutput = r.ActualOutput,
                Status = r.Status,
                Passed = r.Passed,
                ExecutionTimeMs = (int)r.ExecutionTimeMs
            }).ToList();

            int passed = testResults.Count(r => r.Passed);
            int total = testResults.Count;

            return new SubmitCodeResult
            {
                AttemptId = 0,
                AttemptNumber = 0,
                Status = GetJudgeStatus(testResults, passed, total),
                PassedTestCases = passed,
                TotalTestCases = total,
                Score = total > 0 ? (float)passed / total * 100 : 0,
                RuntimeMs = judgeResult.RuntimeMs ?? testResults.Sum(t => t.ExecutionTimeMs),
                MemoryUsageMb = judgeResult.MemoryUsageMb,
                AiFeedback = null,  // Run does not call AI
                TestResults = testResults
            };
        }

        // ─────────────────────────────────────────────────
        // POST submit — full test + AI + save attempt + update progress
        // ─────────────────────────────────────────────────

        public async Task<SubmitCodeResult> SubmitAnswerAsync(Guid id, int userId, SubmitCodeRequest request)
        {
            // ── 1. Fetch problem ──────────────────────────────────
            var p = await _db.CodingProblems
                .FirstOrDefaultAsync(x => x.Id == id && x.Status == "Published" && x.IsClientVisible)
                ?? throw new ArgumentException("Bài coding không tồn tại hoặc chưa được publish.");

            // ── 2. Validate inputs ────────────────────────────────
            if (string.IsNullOrWhiteSpace(request.Code))
                throw new ArgumentException("Code không được để trống.");

            var supportedLanguages = Deserialize(p.SupportedLanguagesJson, new List<string>());
            if (supportedLanguages.Any() &&
                !supportedLanguages.Any(l => l.Equals(request.Language, StringComparison.OrdinalIgnoreCase)))
            {
                throw new ArgumentException(
                    $"Ngôn ngữ '{request.Language}' không được hỗ trợ. " +
                    $"Ngôn ngữ hỗ trợ: {string.Join(", ", supportedLanguages)}");
            }

            // ── 3. Build payload — ALL test cases (public + hidden) ──
            var publicCases = Deserialize(p.PublicTestCasesJson, new List<CodingTestCaseDto>());
            var hiddenCases = Deserialize(p.HiddenTestCasesJson, new List<CodingTestCaseDto>());

            // Hidden test cases are sent to Judge service but NEVER returned to client
            var allTestCases = publicCases
                .Select(tc => new { input = tc.Input, expectedOutput = tc.ExpectedOutput, isHidden = false })
                .Concat(hiddenCases.Select(tc => new { input = tc.Input, expectedOutput = tc.ExpectedOutput, isHidden = true }))
                .ToList();

            var payload = new
            {
                problemTitle = p.Title,
                problemDescription = p.Description,
                language = request.Language,
                code = request.Code,
                functionName = p.FunctionName,
                methodSignature = p.MethodSignature,
                returnType = p.ReturnType,
                testCases = allTestCases
            };

            // ── 4. Call Judge + AI service, log AI usage ──────────
            var sw = System.Diagnostics.Stopwatch.StartNew();
            string logStatus = "Success";
            string? logError = null;
            AiSubmitResponse? judgeResult = null;

            try
            {
                var client = CreateAiClient();
                var response = await client.PostAsJsonAsync("/ai/practice/submit", payload);

                if (!response.IsSuccessStatusCode)
                {
                    logStatus = "Failed";
                    logError = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Judge service trả lỗi ({response.StatusCode}): {logError}");
                }

                judgeResult = await response.Content.ReadFromJsonAsync<AiSubmitResponse>();
                if (judgeResult == null)
                {
                    logStatus = "Failed";
                    logError = "Null response from Judge service";
                    throw new Exception("Không đọc được kết quả từ Judge service.");
                }
            }
            catch (Exception ex)
            {
                logStatus = "Failed";
                logError ??= ex.Message;
                throw;
            }
            finally
            {
                sw.Stop();
                // Always log AI request, even on failure (token = 0 if failed)
                try
                {
                    await _aiRequestLogService.LogAsync(new AiRequestLogCreateDto
                    {
                        UserId = userId,
                        Feature = "CodingAnalysis",
                        RequestType = "AnalyzeCode",
                        Model = judgeResult?.Usage?.Model ?? "gpt-4o-mini",
                        Status = logStatus,
                        InputTokens = judgeResult?.Usage?.InputTokens ?? 0,
                        OutputTokens = judgeResult?.Usage?.OutputTokens ?? 0,
                        TotalTokens = judgeResult?.Usage?.TotalTokens ?? 0,
                        ResponseTimeMs = sw.ElapsedMilliseconds,
                        ErrorMessage = logError
                    });
                }
                catch
                {
                    // Logging must never crash user's request
                }
            }

            // ── 5. Calculate attempt number ───────────────────────
            var attemptNumber = await _db.CodingPracticeAttempts
                .CountAsync(x => x.UserId == userId && x.CodingProblemId == id) + 1;

            // ── 6. Persist attempt ────────────────────────────────
            var attempt = new CodingPracticeAttempt
            {
                UserId = userId,
                CodingProblemId = id,
                AttemptNumber = attemptNumber,
                Language = request.Language,
                SubmittedCode = request.Code,
                PassedTestCases = judgeResult.PassedTestCases,
                TotalTestCases = judgeResult.TotalTestCases,
                Score = judgeResult.Score,
                RuntimeMs = judgeResult.RuntimeMs,
                MemoryUsageMb = judgeResult.MemoryUsageMb,
                AiFeedbackJson = Serialize(judgeResult.AiFeedback),
                Status = judgeResult.Status,
                CreatedAt = DateTime.UtcNow
            };
            _db.CodingPracticeAttempts.Add(attempt);

            // ── 7. Upsert UserCodingProblemProgress ───────────────
            var progress = await _db.UserCodingProblemProgresses
                .FirstOrDefaultAsync(x => x.UserId == userId && x.CodingProblemId == id);

            bool isAccepted = judgeResult.Status == "Accepted";

            if (progress == null)
            {
                progress = new UserCodingProblemProgress
                {
                    UserId = userId,
                    CodingProblemId = id,
                    AttemptCount = 1,
                    LatestScore = judgeResult.Score,
                    BestScore = judgeResult.Score,
                    IsSolved = isAccepted,
                    LastAttemptAt = DateTime.UtcNow
                };
                _db.UserCodingProblemProgresses.Add(progress);
            }
            else
            {
                progress.AttemptCount += 1;
                progress.LatestScore = judgeResult.Score;
                progress.BestScore = Math.Max(progress.BestScore ?? 0f, judgeResult.Score);
                // Once solved, stays solved
                progress.IsSolved = progress.IsSolved || isAccepted;
                progress.LastAttemptAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();

            // ── 8. Build response — filter out hidden test results ─
            // Only return public test case results to client
            // Hidden test cases results are summarized in passedTestCases/totalTestCases only
            var publicResultCount = publicCases.Count;
            var publicResults = judgeResult.Results
                .Take(publicResultCount)
                .Select(r => new TestCaseResultDto
                {
                    Index = r.TestCaseIndex,
                    Input = r.Input,
                    ExpectedOutput = r.ExpectedOutput,
                    ActualOutput = r.ActualOutput,
                    Status = r.Status,
                    Passed = r.Passed,
                    ExecutionTimeMs = (int)r.ExecutionTimeMs
                }).ToList();

            return new SubmitCodeResult
            {
                AttemptId = attempt.Id,
                AttemptNumber = attempt.AttemptNumber,
                Status = attempt.Status,
                PassedTestCases = attempt.PassedTestCases,
                TotalTestCases = attempt.TotalTestCases,
                Score = attempt.Score,
                RuntimeMs = attempt.RuntimeMs,
                MemoryUsageMb = attempt.MemoryUsageMb,
                AiFeedback = judgeResult.AiFeedback,
                TestResults = publicResults  // Hidden test case details are NOT returned
            };
        }

        // ─────────────────────────────────────────────────
        // GET history for a specific problem
        // ─────────────────────────────────────────────────

        public async Task<List<CodingPracticeAttemptDto>> GetProblemHistoryAsync(Guid id, int userId)
        {
            var attempts = await _db.CodingPracticeAttempts
                .Where(h => h.UserId == userId && h.CodingProblemId == id)
                .OrderByDescending(h => h.AttemptNumber)
                .ToListAsync();

            return attempts.Select(h => new CodingPracticeAttemptDto
            {
                Id = h.Id,
                CodingProblemId = h.CodingProblemId,
                CodingProblemTitle = "",
                AttemptNumber = h.AttemptNumber,
                Language = h.Language,
                SubmittedCode = h.SubmittedCode,
                PassedTestCases = h.PassedTestCases,
                TotalTestCases = h.TotalTestCases,
                Status = h.Status,
                Score = h.Score,
                RuntimeMs = h.RuntimeMs,
                MemoryUsageMb = h.MemoryUsageMb,
                AiFeedback = Deserialize(h.AiFeedbackJson, new AiFeedbackDto()),
                CreatedAt = h.CreatedAt
            }).ToList();
        }

        // ─────────────────────────────────────────────────
        // GET global history (all problems for current user)
        // ─────────────────────────────────────────────────

        public async Task<List<CodingPracticeAttemptDto>> GetPracticeHistoryAsync(int userId)
        {
            var attempts = await _db.CodingPracticeAttempts
                .Include(h => h.CodingProblem)
                .Where(h => h.UserId == userId)
                .OrderByDescending(h => h.CreatedAt)
                .ToListAsync();

            return attempts.Select(h => new CodingPracticeAttemptDto
            {
                Id = h.Id,
                CodingProblemId = h.CodingProblemId,
                CodingProblemTitle = h.CodingProblem?.Title ?? "Bài coding",
                AttemptNumber = h.AttemptNumber,
                Language = h.Language,
                SubmittedCode = h.SubmittedCode,
                PassedTestCases = h.PassedTestCases,
                TotalTestCases = h.TotalTestCases,
                Status = h.Status,
                Score = h.Score,
                RuntimeMs = h.RuntimeMs,
                MemoryUsageMb = h.MemoryUsageMb,
                AiFeedback = Deserialize(h.AiFeedbackJson, new AiFeedbackDto()),
                CreatedAt = h.CreatedAt
            }).ToList();
        }

        // ─────────────────────────────────────────────────
        // GET progress summary
        // ─────────────────────────────────────────────────

        public async Task<CodingProgressDto> GetPracticeProgressAsync(int userId)
        {
            var totalProblems = await _db.CodingProblems
                .CountAsync(p => p.Status == "Published" && p.IsClientVisible);

            var progresses = await _db.UserCodingProblemProgresses
                .Where(p => p.UserId == userId)
                .ToListAsync();

            var solvedCount = progresses.Count(p => p.IsSolved);
            var totalAttempts = progresses.Sum(p => p.AttemptCount);

            var avgScore = progresses.Any(p => p.LatestScore.HasValue)
                ? progresses.Where(p => p.LatestScore.HasValue).Average(p => p.LatestScore!.Value)
                : 0.0;

            var allStatuses = await _db.CodingPracticeAttempts
                .Where(a => a.UserId == userId)
                .Select(a => a.Status)
                .ToListAsync();

            var passRate = allStatuses.Count > 0
                ? (double)allStatuses.Count(s => s == "Accepted") / allStatuses.Count * 100.0
                : 0.0;

            return new CodingProgressDto
            {
                TotalProblemsCount = totalProblems,
                SolvedProblemsCount = solvedCount,
                TotalAttemptsCount = totalAttempts,
                AverageScore = Math.Round(avgScore, 1),
                PassRate = Math.Round(passRate, 1)
            };
        }
    }

    // ═══════════════════════════════════════════════
    // Internal DTOs for Judge service responses
    // ═══════════════════════════════════════════════

    /// <summary>Response from POST /ai/practice/run</summary>
    public class AiRunResponse
    {
        public List<AiRunResultItem> Results { get; set; } = new();
        public int? RuntimeMs { get; set; }
        public float? MemoryUsageMb { get; set; }
    }

    /// <summary>Single test case result from judge</summary>
    public class AiRunResultItem
    {
        public int TestCaseIndex { get; set; }
        public string Input { get; set; } = "";
        public string ExpectedOutput { get; set; } = "";
        public string ActualOutput { get; set; } = "";
        public string Status { get; set; } = "";
        public bool Passed { get; set; }
        public double ExecutionTimeMs { get; set; }
    }

    /// <summary>Response from POST /ai/practice/submit</summary>
    public class AiSubmitResponse
    {
        public string Status { get; set; } = "";
        public int PassedTestCases { get; set; }
        public int TotalTestCases { get; set; }
        public float Score { get; set; }
        public int RuntimeMs { get; set; }
        public float MemoryUsageMb { get; set; }
        public AiFeedbackDto AiFeedback { get; set; } = new();
        public List<AiRunResultItem> Results { get; set; } = new();
        public AiUsageResponse? Usage { get; set; }
    }

    /// <summary>Token usage metadata from AI service</summary>
    public class AiUsageResponse
    {
        public int InputTokens { get; set; }
        public int OutputTokens { get; set; }
        public int TotalTokens { get; set; }
        public string Model { get; set; } = "gpt-4o-mini";
    }
}
