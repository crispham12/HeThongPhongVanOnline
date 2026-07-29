using System.Text.Json;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InterviewPro.API.Services
{
    /// <summary>
    /// HrInterviewService: Business logic trung tâm của chức năng Phỏng vấn HR.
    ///
    /// Giải thích luồng cho người mới học:
    /// 1. StartInterviewAsync: Kiểm tra giới hạn Free Plan → Tạo session → Gọi AI sinh câu hỏi → Lưu DB
    /// 2. SubmitAnswerAsync: Validate → Gọi AI đánh giá → Lưu kết quả → Nếu đủ 10 câu → Tạo FinalResult
    /// 3. GetFinalResultAsync: Lấy kết quả tổng kết từ DB
    /// 4. GetHistoryAsync: Lấy danh sách phiên HR của user
    ///
    /// Controller chỉ cần gọi Service, không cần biết logic bên trong.
    /// </summary>
    public class HrInterviewService : IHrInterviewService
    {
        private readonly AppDbContext _db;
        private readonly IHrAiClient _aiClient;
        private readonly IInterviewDataService _interviewDataService;
        private readonly IHrQuestionBankService _questionBankService;
        private readonly IInterviewQuotaService _quotaService;
        private readonly ILogger<HrInterviewService> _logger;

        private const int TotalQuestions = 10;
        private const int MinAnswerLength = 20;

        public HrInterviewService(
            AppDbContext db,
            IHrAiClient aiClient,
            IInterviewDataService interviewDataService,
            IHrQuestionBankService questionBankService,
            IInterviewQuotaService quotaService,
            ILogger<HrInterviewService> logger)
        {
            _db = db;
            _aiClient = aiClient;
            _interviewDataService = interviewDataService;
            _questionBankService = questionBankService;
            _quotaService = quotaService;
            _logger = logger;
        }

        // ─────────────────────────────────────────────
        // 1. Bắt đầu phiên phỏng vấn mới
        // ─────────────────────────────────────────────
        public async Task<StartHrInterviewResponse> StartInterviewAsync(
            int userId, StartHrInterviewRequest request)
        {
            // Validate input cơ bản
            if (string.IsNullOrWhiteSpace(request.Role))
                throw new ArgumentException("Vui lòng chọn vai trò.");
            if (string.IsNullOrWhiteSpace(request.Difficulty))
                throw new ArgumentException("Vui lòng chọn mức độ khó.");

            // Áp dụng giới hạn quota phỏng vấn
            await _quotaService.ConsumeQuotaAsync(userId);

            using var transactionScope = await _db.Database.BeginTransactionAsync();
            try
            {


                // Tạo session mới trong DB
                var session = new HrInterviewSession
                {
                    UserId = userId,
                    Role = request.Role,
                    Difficulty = request.Difficulty,
                    TechStackJson = JsonSerializer.Serialize(request.TechStack),
                    TotalQuestions = TotalQuestions,
                    Status = "InProgress"
                };
                _db.HrInterviewSessions.Add(session);
                await _db.SaveChangesAsync();

                // Gọi Selection Service tạo 10 câu hỏi theo Blueprint
                var questions = await _questionBankService.GenerateSessionQuestionsAsync(
                    session.Id, request.Role, request.Difficulty, request.QuestionMode, request.TechStack);

                _db.HrInterviewQuestions.AddRange(questions);
                await _db.SaveChangesAsync();

                await transactionScope.CommitAsync();

            // Trả về cho frontend
            return new StartHrInterviewResponse
            {
                SessionId = session.SessionGuid,
                TotalQuestions = TotalQuestions,
                Questions = questions.Select(q => new HrQuestionDto
                {
                    QuestionId = q.QuestionGuid,
                    QuestionIndex = q.QuestionIndex,
                    Category = q.Category,
                    QuestionText = q.QuestionText,
                    ExpectedAnswerGuide = q.ExpectedAnswerGuide
                }).ToList()
            };
            }
            catch (Exception)
            {
                await transactionScope.RollbackAsync();
                throw;
            }
        }


        // ─────────────────────────────────────────────
        // 1.5. Draft Management (Lưu nháp câu trả lời)
        // ─────────────────────────────────────────────
        public async Task SaveDraftAsync(
            int userId, string sessionId, string questionId, SubmitHrAnswerRequest request)
        {
            var session = await _db.HrInterviewSessions
                .FirstOrDefaultAsync(s => s.SessionGuid == sessionId && s.UserId == userId)
                ?? throw new KeyNotFoundException("Không tìm thấy phiên phỏng vấn.");

            if (session.Status == "Completed") return; // Bỏ qua nếu đã xong

            var question = await _db.HrInterviewQuestions
                .FirstOrDefaultAsync(q => q.QuestionGuid == questionId && q.SessionId == session.Id)
                ?? throw new KeyNotFoundException("Không tìm thấy câu hỏi.");

            var draft = await _db.HrInterviewDrafts
                .FirstOrDefaultAsync(d => d.SessionId == session.Id && d.QuestionId == question.Id);

            if (draft == null)
            {
                draft = new HrInterviewDraft
                {
                    SessionId = session.Id,
                    QuestionId = question.Id,
                    AnswerText = request.AnswerText ?? "",
                    Transcript = request.Transcript ?? "",
                    DurationSeconds = request.DurationSeconds,
                    WordCount = request.WordCount,
                    FillerWords = request.FillerWords,
                    UpdatedAt = DateTime.UtcNow
                };
                _db.HrInterviewDrafts.Add(draft);
            }
            else
            {
                draft.AnswerText = request.AnswerText ?? "";
                draft.Transcript = request.Transcript ?? "";
                draft.DurationSeconds = request.DurationSeconds;
                draft.WordCount = request.WordCount;
                draft.FillerWords = request.FillerWords;
                draft.UpdatedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();
        }

        public async Task<SubmitHrAnswerRequest?> GetDraftAsync(
            int userId, string sessionId, string questionId)
        {
            var session = await _db.HrInterviewSessions
                .FirstOrDefaultAsync(s => s.SessionGuid == sessionId && s.UserId == userId);
            if (session == null) return null;

            var question = await _db.HrInterviewQuestions
                .FirstOrDefaultAsync(q => q.QuestionGuid == questionId && q.SessionId == session.Id);
            if (question == null) return null;

            var draft = await _db.HrInterviewDrafts
                .FirstOrDefaultAsync(d => d.SessionId == session.Id && d.QuestionId == question.Id);

            if (draft == null) return null;

            return new SubmitHrAnswerRequest
            {
                QuestionId = questionId,
                AnswerText = draft.AnswerText,
                Transcript = draft.Transcript,
                DurationSeconds = draft.DurationSeconds,
                WordCount = draft.WordCount,
                FillerWords = draft.FillerWords
            };
        }

        public async Task DeleteDraftAsync(
            int userId, string sessionId, string questionId)
        {
            var session = await _db.HrInterviewSessions
                .FirstOrDefaultAsync(s => s.SessionGuid == sessionId && s.UserId == userId);
            if (session == null) return;

            var question = await _db.HrInterviewQuestions
                .FirstOrDefaultAsync(q => q.QuestionGuid == questionId && q.SessionId == session.Id);
            if (question == null) return;

            var draft = await _db.HrInterviewDrafts
                .FirstOrDefaultAsync(d => d.SessionId == session.Id && d.QuestionId == question.Id);

            if (draft != null)
            {
                _db.HrInterviewDrafts.Remove(draft);
                await _db.SaveChangesAsync();
            }
        }

        // ─────────────────────────────────────────────
        // 2. Nộp câu trả lời + AI đánh giá
        // ─────────────────────────────────────────────
        public async Task<SubmitHrAnswerResponse> SubmitAnswerAsync(
            int userId, string sessionId, SubmitHrAnswerRequest request)
        {
            // Lấy session và kiểm tra ownership
            var session = await _db.HrInterviewSessions
                .FirstOrDefaultAsync(s => s.SessionGuid == sessionId && s.UserId == userId)
                ?? throw new KeyNotFoundException("Không tìm thấy phiên phỏng vấn.");

            if (session.Status == "Completed")
                throw new InvalidOperationException("Phiên phỏng vấn này đã hoàn thành.");

            // Lấy câu hỏi
            var question = await _db.HrInterviewQuestions
                .FirstOrDefaultAsync(q => q.QuestionGuid == request.QuestionId && q.SessionId == session.Id)
                ?? throw new KeyNotFoundException("Không tìm thấy câu hỏi.");

            // Kiểm tra trùng câu trả lời
            var existingAnswer = await _db.HrInterviewAnswers
                .AnyAsync(a => a.SessionId == session.Id && a.QuestionId == question.Id);
            if (existingAnswer)
                throw new InvalidOperationException("Câu hỏi này đã được trả lời.");

            // Validate độ dài câu trả lời
            if (string.IsNullOrWhiteSpace(request.AnswerText) || request.AnswerText.Trim().Length < MinAnswerLength)
                throw new ArgumentException($"Câu trả lời quá ngắn. Vui lòng trả lời ít nhất {MinAnswerLength} ký tự.");

            // Cập nhật câu trả lời nhưng KHÔNG gọi AI đánh giá ngay lập tức
            var answer = new HrInterviewAnswer
            {
                SessionId = session.Id,
                QuestionId = question.Id,
                AnswerText = request.AnswerText,
                Transcript = request.Transcript ?? "",
                DurationSeconds = request.DurationSeconds,
                WordCount = request.WordCount,
                FillerWords = request.FillerWords,
                SubmittedAt = DateTime.UtcNow
            };

            _db.HrInterviewAnswers.Add(answer);

            // Cập nhật index câu hỏi hiện tại
            session.CurrentQuestionIndex = question.QuestionIndex;
            await _db.SaveChangesAsync();

            // Kiểm tra đã đủ 10 câu chưa
            var totalAnswered = await _db.HrInterviewAnswers.CountAsync(a => a.SessionId == session.Id);
            var isCompleted = totalAnswered >= TotalQuestions;

            HrFinalResultResponse? finalResult = null;

            if (isCompleted)
            {
                // Tạo FinalResult sau câu thứ 10
                var techStack = JsonSerializer.Deserialize<List<string>>(session.TechStackJson) ?? new List<string>();
                finalResult = await CompleteInterviewAsync(session, techStack);
            }

            return new SubmitHrAnswerResponse
            {
                AnswerId = answer.Id.ToString(),
                IsCompleted = isCompleted,
                FinalResult = finalResult
            };
        }

        // ─────────────────────────────────────────────
        // 3. Hoàn thành phiên & tổng kết
        // ─────────────────────────────────────────────
        private async Task<HrFinalResultResponse> CompleteInterviewAsync(
            HrInterviewSession session, List<string> techStack)
        {
            // Lấy tất cả câu hỏi và câu trả lời để gửi AI tổng kết
            var questions = await _db.HrInterviewQuestions
                .Where(q => q.SessionId == session.Id)
                .OrderBy(q => q.QuestionIndex)
                .ToListAsync();

            var answers = await _db.HrInterviewAnswers
                .Where(a => a.SessionId == session.Id)
                .ToListAsync();

            var answerSummaries = questions.Select(q =>
            {
                var ans = answers.FirstOrDefault(a => a.QuestionId == q.Id);
                return new AiAnswerSummary
                {
                    Question = q.QuestionText,
                    Answer = ans?.AnswerText ?? "",
                    Transcript = ans?.Transcript ?? "",
                    DurationSeconds = ans?.DurationSeconds ?? 0,
                    WordCount = ans?.WordCount ?? 0,
                    FillerWords = ans?.FillerWords ?? 0,
                    Score = 0, // Sẽ được chấm chung
                    Feedback = ""
                };
            }).ToList();

            HrFinalResultResponse finalResult;
            if (!answerSummaries.Any(a => !string.IsNullOrWhiteSpace(a.Answer) || !string.IsNullOrWhiteSpace(a.Transcript)))
            {
                // Fallback zero-score result if no transcripts are found
                finalResult = new HrFinalResultResponse
                {
                    SessionId = session.SessionGuid,
                    OverallScore = 0.0,
                    CompositeScores = new CompositeScoresDto(),
                    OverallObservation = "Không có dữ liệu hợp lệ để đánh giá.",
                    HiringRecommendation = "Không",
                    ReadinessLevel = "Không"
                };
            }
                // Gọi AI tổng kết cuối bài
                finalResult = await _aiClient.GenerateHrFinalResultAsync(
                    session.SessionGuid, session.Role, session.Difficulty, answerSummaries);

                // --- BACKEND SCORING LOGIC ---
                double sumScore = 0.0;
                int validQuestions = 0;

                if (finalResult.QuestionEvaluations != null && finalResult.QuestionEvaluations.Any())
                {
                    foreach (var qEval in finalResult.QuestionEvaluations)
                    {
                        if (qEval.StarAnalysis != null)
                        {
                            var sScore = qEval.StarAnalysis.Situation?.Score ?? 0;
                            var tScore = qEval.StarAnalysis.Task?.Score ?? 0;
                            var aScore = qEval.StarAnalysis.Action?.Score ?? 0;
                            var rScore = qEval.StarAnalysis.Result?.Score ?? 0;
                            
                            // Trọng số STAR
                            qEval.QuestionScore = sScore * 0.20 + tScore * 0.20 + aScore * 0.30 + rScore * 0.30;
                            // Fallback properties for UI display mapping
                            qEval.StarScore = qEval.QuestionScore;
                            qEval.CommunicationScore = qEval.QuestionScore;
                            qEval.ConfidenceScore = qEval.QuestionScore;

                            sumScore += qEval.QuestionScore;
                            validQuestions++;
                        }
                    }
                }

                // Final OverallScore must be calculated from compositeScores 7-criterion formula
                if (finalResult.CompositeScores != null)
                {
                    var c = finalResult.CompositeScores;
                    double overall = (c.StarStructureScore * 0.30)
                                   + (c.CommunicationScore * 0.20)
                                   + (c.ProfessionalismScore * 0.10)
                                   + (c.ConfidenceScore * 0.10)
                                   + (c.LogicScore * 0.15)
                                   + (c.CompletenessScore * 0.05)
                                   + (c.ClarityScore * 0.10);
                    finalResult.OverallScore = Math.Round(overall, 1);
                }
                else
                {
                    finalResult.OverallScore = 0.0;
                }

                // Thresholds for Hiring Readiness
                if (finalResult.OverallScore >= 8.0)
                {
                    finalResult.ReadinessLevel = $"Sẵn sàng phỏng vấn {session.Difficulty}";
                }
                else if (finalResult.OverallScore >= 6.0)
                {
                    finalResult.ReadinessLevel = $"Cần luyện thêm trước khi phỏng vấn {session.Difficulty}";
                }
                else
                {
                    finalResult.ReadinessLevel = "Cần chuẩn bị kỹ hơn";
                }
                
                finalResult.Status = "completed";

            // Lưu FinalResult vào DB
            var dbFinalResult = new HrInterviewEvaluation
            {
                SessionId = session.Id,
                StarStructureScore = finalResult.CompositeScores?.StarStructureScore ?? 0,
                CommunicationScore = finalResult.CompositeScores?.CommunicationScore ?? 0,
                ProfessionalismScore = finalResult.CompositeScores?.ProfessionalismScore ?? 0,
                ConfidenceScore = finalResult.CompositeScores?.ConfidenceScore ?? 0,
                LogicScore = finalResult.CompositeScores?.LogicScore ?? 0,
                CompletenessScore = finalResult.CompositeScores?.CompletenessScore ?? 0,
                ClarityScore = finalResult.CompositeScores?.ClarityScore ?? 0,
                OverallScore = finalResult.OverallScore,
                OverallObservation = finalResult.OverallObservation,
                StrengthSummary = finalResult.StrengthSummary,
                WeaknessSummary = finalResult.WeaknessSummary,
                HiringRecommendation = finalResult.HiringRecommendation,
                HiringReadiness = finalResult.ReadinessLevel,
                OverallStatus = "completed"
            };

            if (finalResult.Strengths != null)
            {
                foreach (var s in finalResult.Strengths)
                {
                    dbFinalResult.Strengths.Add(new HrInterviewStrength
                    {
                        Title = s.Title,
                        Description = s.Description,
                        Score = s.Score,
                        Status = s.Status
                    });
                }
            }

            if (finalResult.Improvements != null)
            {
                foreach (var i in finalResult.Improvements)
                {
                    dbFinalResult.Improvements.Add(new HrInterviewImprovement
                    {
                        Priority = i.Priority,
                        Title = i.Title,
                        Description = i.Description
                    });
                }
            }

            if (finalResult.RecommendedPractice != null)
            {
                foreach (var r in finalResult.RecommendedPractice)
                {
                    dbFinalResult.RecommendedPractices.Add(new HrInterviewRecommendedPractice
                    {
                        Title = r.Title,
                        EstimatedTime = r.EstimatedTime,
                        Difficulty = r.Difficulty,
                        RecommendedLevel = r.RecommendedLevel
                    });
                }
            }

            _db.HrInterviewEvaluations.Add(dbFinalResult);

            // Ghi nhận điểm từng câu hỏi nếu có trả về
            if (finalResult.QuestionEvaluations != null && finalResult.QuestionEvaluations.Any())
            {
                foreach (var qEval in finalResult.QuestionEvaluations)
                {
                    // Map theo index sử dụng biến local thay vì navigation property
                    var question = questions.FirstOrDefault(q => q.QuestionIndex == qEval.QuestionIndex);
                    if (question != null)
                    {
                        var answer = answers.FirstOrDefault(a => a.QuestionId == question.Id);
                        if (answer != null)
                        {
                            var dbQuestionEval = new HrInterviewQuestionEvaluation
                            {
                                InterviewAnswerId = answer.Id,
                                QuestionScore = qEval.QuestionScore,
                                StarScore = qEval.StarScore,
                                CommunicationScore = qEval.CommunicationScore,
                                ConfidenceScore = qEval.ConfidenceScore,
                                Strengths = JsonSerializer.Serialize(qEval.Strengths ?? new List<string>()),
                                Weaknesses = JsonSerializer.Serialize(qEval.Weaknesses ?? new List<string>()),
                                Suggestions = JsonSerializer.Serialize(qEval.Suggestions ?? new List<string>()),
                                SituationScore = qEval.StarAnalysis?.Situation?.Score ?? 0,
                                SituationStatus = qEval.StarAnalysis?.Situation?.Status ?? "",
                                SituationFeedback = qEval.StarAnalysis?.Situation?.Feedback ?? "",
                                TaskScore = qEval.StarAnalysis?.Task?.Score ?? 0,
                                TaskStatus = qEval.StarAnalysis?.Task?.Status ?? "",
                                TaskFeedback = qEval.StarAnalysis?.Task?.Feedback ?? "",
                                ActionScore = qEval.StarAnalysis?.Action?.Score ?? 0,
                                ActionStatus = qEval.StarAnalysis?.Action?.Status ?? "",
                                ActionFeedback = qEval.StarAnalysis?.Action?.Feedback ?? "",
                                ResultScore = qEval.StarAnalysis?.Result?.Score ?? 0,
                                ResultStatus = qEval.StarAnalysis?.Result?.Status ?? "",
                                ResultFeedback = qEval.StarAnalysis?.Result?.Feedback ?? ""
                            };
                            _db.HrInterviewQuestionEvaluations.Add(dbQuestionEval);
                        }
                    }
                }
            }

            // Cập nhật session thành Completed
            session.Status = "Completed";
            session.FinalScore = finalResult.OverallScore;
            session.FinalLevel = finalResult.ReadinessLevel;
            session.FinalSummary = finalResult.OverallObservation;
            session.CompletedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            // ── Tích hợp PracticeSession: ghi lại lần luyện tập này ──
            // Lấy tên user để lưu vào PracticeSession
            try
            {
                var user = await _db.Users.FindAsync(session.UserId);
                var userName = user?.Name ?? user?.Email ?? $"User #{session.UserId}";
                await _interviewDataService.CreateAttemptFromHrSessionAsync(
                    session.UserId, userName, session.Id);
            }
            catch (Exception ex)
            {
                // Không throw — lỗi ghi PracticeAttempt không được làm hỏng flow HR
                _logger.LogWarning(ex, "⚠️ Không thể tạo PracticeAttempt cho HR session {Id}", session.Id);
            }

            finalResult.SessionId = session.SessionGuid;
            return finalResult;
        }

        // ─────────────────────────────────────────────
        // 4. Lấy thông tin phiên phỏng vấn
        // ─────────────────────────────────────────────
        public async Task<HrSessionDetailResponse> GetInterviewAsync(int userId, string sessionId)
        {
            var session = await _db.HrInterviewSessions
                .Include(s => s.Questions)
                .FirstOrDefaultAsync(s => s.SessionGuid == sessionId && s.UserId == userId)
                ?? throw new KeyNotFoundException("Không tìm thấy phiên phỏng vấn.");

            var answeredCount = await _db.HrInterviewAnswers
                .CountAsync(a => a.SessionId == session.Id);

            return new HrSessionDetailResponse
            {
                SessionId = session.SessionGuid,
                Role = session.Role,
                Difficulty = session.Difficulty,
                Status = session.Status,
                TotalQuestions = session.TotalQuestions,
                AnsweredCount = answeredCount,
                Questions = session.Questions.OrderBy(q => q.QuestionIndex).Select(q => new HrQuestionDto
                {
                    QuestionId = q.QuestionGuid,
                    QuestionIndex = q.QuestionIndex,
                    Category = q.Category,
                    QuestionText = q.QuestionText,
                    ExpectedAnswerGuide = q.ExpectedAnswerGuide
                }).ToList()
            };
        }

        // ─────────────────────────────────────────────
        // 5. Lấy kết quả tổng kết
        // ─────────────────────────────────────────────
        public async Task<HrFinalResultResponse> GetFinalResultAsync(int userId, string sessionId)
        {
            var session = await _db.HrInterviewSessions
                .Include(s => s.FinalResult)
                .FirstOrDefaultAsync(s => s.SessionGuid == sessionId && s.UserId == userId)
                ?? throw new KeyNotFoundException("Không tìm thấy phiên phỏng vấn.");

            if (session.FinalResult == null)
            {
                if (session.Status == "Completed")
                {
                    // Fallback for old sessions that completed without a generated result
                    return new HrFinalResultResponse
                    {
                        SessionId = session.SessionGuid,
                        OverallScore = 0.0,
                        CompositeScores = new CompositeScoresDto(),
                        OverallObservation = "Không có dữ liệu hợp lệ để đánh giá.",
                        HiringRecommendation = "Không",
                        ReadinessLevel = "Không",
                        Status = "Completed"
                    };
                }

                // Cập nhật: Cho phép kết thúc sớm nếu đã trả lời ít nhất 1 câu
                var totalAnswered = await _db.HrInterviewAnswers.CountAsync(a => a.SessionId == session.Id);
                if (totalAnswered >= 1)
                {
                    var techStack = System.Text.Json.JsonSerializer.Deserialize<List<string>>(session.TechStackJson) ?? new List<string>();
                    var generatedResult = await CompleteInterviewAsync(session, techStack);
                    return generatedResult;
                }

                throw new InvalidOperationException("Kết quả tổng kết chưa có. Vui lòng hoàn thành ít nhất 1 câu hỏi.");
            }

            var fr = session.FinalResult;
            return new HrFinalResultResponse
            {
                SessionId = session.SessionGuid,
                OverallScore = fr.OverallScore,
                CompositeScores = new CompositeScoresDto
                {
                    StarStructureScore = fr.StarStructureScore,
                    CommunicationScore = fr.CommunicationScore,
                    ProfessionalismScore = fr.ProfessionalismScore,
                    ConfidenceScore = fr.ConfidenceScore,
                    LogicScore = fr.LogicScore,
                    CompletenessScore = fr.CompletenessScore,
                    ClarityScore = fr.ClarityScore
                },
                OverallObservation = fr.OverallObservation,
                StrengthSummary = fr.StrengthSummary,
                WeaknessSummary = fr.WeaknessSummary,
                HiringRecommendation = fr.HiringRecommendation,
                ReadinessLevel = fr.HiringReadiness,
                Status = session.Status,
                Strengths = fr.Strengths.Select(s => new HrStrengthDto
                {
                    Title = s.Title,
                    Description = s.Description,
                    Score = s.Score,
                    Status = s.Status
                }).ToList(),
                Improvements = fr.Improvements.Select(i => new HrImprovementDto
                {
                    Priority = i.Priority,
                    Title = i.Title,
                    Description = i.Description
                }).ToList(),
                RecommendedPractice = fr.RecommendedPractices.Select(r => new HrRecommendedPracticeDto
                {
                    Title = r.Title,
                    EstimatedTime = r.EstimatedTime,
                    Difficulty = r.Difficulty,
                    RecommendedLevel = r.RecommendedLevel
                }).ToList()
            };
        }

        // ─────────────────────────────────────────────
        // 6. Lịch sử phỏng vấn HR
        // ─────────────────────────────────────────────
        public async Task<List<HrSessionHistoryItem>> GetHistoryAsync(int userId)
        {
            var sessions = await _db.HrInterviewSessions
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            return sessions.Select(s => new HrSessionHistoryItem
            {
                SessionId = s.SessionGuid,
                Role = s.Role,
                Difficulty = s.Difficulty,
                Status = s.Status,
                FinalScore = s.FinalScore,
                FinalLevel = s.FinalLevel,
                CreatedAt = s.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
                CompletedAt = s.CompletedAt?.ToString("yyyy-MM-dd HH:mm")
            }).ToList();
        }
    }
}
