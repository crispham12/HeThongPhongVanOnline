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
        private readonly ICreditService _creditService;
        private readonly ILogger<HrInterviewService> _logger;

        private const int TotalQuestions = 10;
        private const int MinAnswerLength = 20;

        public HrInterviewService(
            AppDbContext db,
            IHrAiClient aiClient,
            IInterviewDataService interviewDataService,
            ICreditService creditService,
            ILogger<HrInterviewService> logger)
        {
            _db = db;
            _aiClient = aiClient;
            _interviewDataService = interviewDataService;
            _creditService = creditService;
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

            using var transactionScope = await _db.Database.BeginTransactionAsync();
            try
            {
                // Trừ lượt phỏng vấn bằng CreditService
                await _creditService.UseCreditAsync(userId, $"Phỏng vấn HR: {request.Role}");

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

                // Gọi AI tạo 10 câu hỏi
                var aiResult = await _aiClient.GenerateHrQuestionsAsync(
                    request.Role, request.Difficulty, request.TechStack);


            // Lưu 10 câu hỏi vào DB
            var questions = aiResult.Questions.Select(q => new HrInterviewQuestion
            {
                SessionId = session.Id,
                QuestionIndex = q.QuestionIndex,
                Category = q.Category,
                QuestionText = q.QuestionText,
                ExpectedAnswerGuide = q.ExpectedAnswerGuide
            }).ToList();

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

            // Gọi AI đánh giá
            var techStack = JsonSerializer.Deserialize<List<string>>(session.TechStackJson) ?? new List<string>();
            var evaluation = await _aiClient.EvaluateHrAnswerAsync(
                session.Role, session.Difficulty, techStack,
                question.QuestionText, request.AnswerText);

            // Lưu câu trả lời + kết quả đánh giá
            var answer = new HrInterviewAnswer
            {
                SessionId = session.Id,
                QuestionId = question.Id,
                AnswerText = request.AnswerText,
                CommunicationScore = evaluation.CommunicationScore,
                ClarityScore = evaluation.ClarityScore,
                StarScore = evaluation.StarScore,
                ProfessionalMindsetScore = evaluation.ProfessionalMindsetScore,
                RelevanceScore = evaluation.RelevanceScore,
                QuestionScore = evaluation.QuestionScore,
                Level = evaluation.Level,
                Feedback = evaluation.Feedback,
                StrengthsJson = JsonSerializer.Serialize(evaluation.Strengths),
                WeaknessesJson = JsonSerializer.Serialize(evaluation.Weaknesses),
                ImprovementSuggestionsJson = JsonSerializer.Serialize(evaluation.ImprovementSuggestions)
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
                finalResult = await CompleteInterviewAsync(session, techStack);
            }

            return new SubmitHrAnswerResponse
            {
                AnswerId = answer.Id.ToString(),
                QuestionScore = evaluation.QuestionScore,
                CommunicationScore = evaluation.CommunicationScore,
                ClarityScore = evaluation.ClarityScore,
                StarScore = evaluation.StarScore,
                ProfessionalMindsetScore = evaluation.ProfessionalMindsetScore,
                RelevanceScore = evaluation.RelevanceScore,
                Level = evaluation.Level,
                Feedback = evaluation.Feedback,
                Strengths = evaluation.Strengths,
                Weaknesses = evaluation.Weaknesses,
                ImprovementSuggestions = evaluation.ImprovementSuggestions,
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
                    Score = ans?.QuestionScore ?? 0,
                    Feedback = ans?.Feedback ?? ""
                };
            }).ToList();

            // Gọi AI tổng kết cuối bài
            var finalResult = await _aiClient.GenerateHrFinalResultAsync(
                session.SessionGuid, session.Role, session.Difficulty, answerSummaries);

            // Lưu FinalResult vào DB
            var dbFinalResult = new HrInterviewFinalResult
            {
                SessionId = session.Id,
                HrFinalScore = finalResult.HrFinalScore,
                Level = finalResult.Level,
                Summary = finalResult.Summary,
                OverallStrengthsJson = JsonSerializer.Serialize(finalResult.OverallStrengths),
                OverallWeaknessesJson = JsonSerializer.Serialize(finalResult.OverallWeaknesses),
                ImprovementRoadmapJson = JsonSerializer.Serialize(finalResult.ImprovementRoadmap),
                ReadinessLevel = finalResult.ReadinessLevel
            };

            _db.HrInterviewFinalResults.Add(dbFinalResult);

            // Cập nhật session thành Completed
            session.Status = "Completed";
            session.FinalScore = finalResult.HrFinalScore;
            session.FinalLevel = finalResult.Level;
            session.FinalSummary = finalResult.Summary;
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
                throw new InvalidOperationException("Kết quả tổng kết chưa có. Hãy hoàn thành đủ 10 câu hỏi.");

            var fr = session.FinalResult;
            return new HrFinalResultResponse
            {
                SessionId = session.SessionGuid,
                HrFinalScore = fr.HrFinalScore,
                Level = fr.Level,
                Summary = fr.Summary,
                OverallStrengths = JsonSerializer.Deserialize<List<string>>(fr.OverallStrengthsJson) ?? new(),
                OverallWeaknesses = JsonSerializer.Deserialize<List<string>>(fr.OverallWeaknessesJson) ?? new(),
                ImprovementRoadmap = JsonSerializer.Deserialize<List<RoadmapItemDto>>(fr.ImprovementRoadmapJson) ?? new(),
                ReadinessLevel = fr.ReadinessLevel,
                Status = session.Status
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
