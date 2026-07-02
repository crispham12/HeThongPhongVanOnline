using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace InterviewPro.API.Services
{
    /// <summary>
    /// InterviewDataService — Business logic trung tâm cho chức năng Quản lý dữ liệu phỏng vấn.
    ///
    /// ═══════════════════════════════════════════════════════════════
    /// CÂU HỎI "TẠI SAO KHÔNG ĐƯỢC GHI ĐÈ ĐIỂM?"
    /// ═══════════════════════════════════════════════════════════════
    ///
    /// Nếu ghi đè:
    ///   HR lần 1: 65 → lưu 65
    ///   HR lần 2: 72 → ghi đè thành 72 (MẤT lần 1)
    ///   HR lần 3: 85 → ghi đè thành 85 (MẤT lần 1, 2)
    ///
    /// Chỉ còn lại: 85 → Admin không thấy được tiến trình học tập
    ///
    /// Giải pháp đúng:
    ///   Mỗi lần làm = 1 PracticeAttempt bất biến
    ///   PracticeSession chỉ lưu tổng hợp (LatestScore, BestScore, Count)
    ///   Mọi lần làm đều được lưu đầy đủ
    ///
    /// ═══════════════════════════════════════════════════════════════
    /// CÁCH TÍNH LATESTSCOPE VÀ BESTSCORE
    /// ═══════════════════════════════════════════════════════════════
    ///
    /// LatestScore = điểm của lần làm gần nhất (luôn cập nhật)
    /// BestScore = Math.Max(BestScore hiện tại, điểm lần này)
    ///
    /// Ví dụ:
    ///   Lần 1: Score=65 → Latest=65, Best=65
    ///   Lần 2: Score=72 → Latest=72, Best=72
    ///   Lần 3: Score=85 → Latest=85, Best=85
    ///   Lần 4: Score=80 → Latest=80, Best=85 (giữ nguyên)
    /// </summary>
    public class InterviewDataService : IInterviewDataService
    {
        private readonly AppDbContext _db;
        private readonly ILogger<InterviewDataService> _logger;

        public InterviewDataService(AppDbContext db, ILogger<InterviewDataService> logger)
        {
            _db = db;
            _logger = logger;
        }

        // ══════════════════════════════════════════════════════
        // ADMIN READ APIs
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// Tổng quan: COUNT sessions, SUM attempts, AVG score, breakdown theo SkillType.
        /// Tất cả dữ liệu đến từ bảng PracticeSession — không dùng mock data.
        /// </summary>
        public async Task<InterviewDataOverviewDto> GetOverviewAsync()
        {
            var sessions = await _db.PracticeSessions.AsNoTracking().ToListAsync();

            var completedSessions = sessions.Where(s => s.Status == "Completed").ToList();

            return new InterviewDataOverviewDto
            {
                TotalSessions  = sessions.Count,
                TotalAttempts  = sessions.Sum(s => s.AttemptCount),
                UniqueUsers    = sessions.Select(s => s.UserId).Distinct().Count(),
                AverageScore   = completedSessions.Any()
                                    ? Math.Round(completedSessions.Average(s => s.LatestScore), 1)
                                    : 0,
                HrCount            = sessions.Count(s => s.SkillType == "HR"),
                TechnicalCount     = sessions.Count(s => s.SkillType == "TECHNICAL"),
                CodingCount        = sessions.Count(s => s.SkillType == "CODING"),
                ComprehensiveCount = sessions.Count(s => s.SkillType == "COMPREHENSIVE"),
                ActiveCount    = sessions.Count(s => s.Status == "Active"),
                CompletedCount = sessions.Count(s => s.Status == "Completed"),
            };
        }

        /// <summary>
        /// Danh sách session với bộ lọc đa tiêu chí và phân trang.
        /// Filter: role, skillType, scoreMin, scoreMax, date, status
        /// </summary>
        public async Task<PagedResult<PracticeSessionListItemDto>> GetSessionsAsync(
            AdminInterviewDataFilterRequest filter)
        {
            var query = _db.PracticeSessions.AsNoTracking().AsQueryable();

            // ── Áp dụng filters ──
            if (!string.IsNullOrWhiteSpace(filter.Role))
                query = query.Where(s => s.Role.Contains(filter.Role));

            if (!string.IsNullOrWhiteSpace(filter.SkillType))
                query = query.Where(s => s.SkillType == filter.SkillType);

            if (filter.ScoreMin.HasValue)
                query = query.Where(s => s.LatestScore >= filter.ScoreMin.Value);

            if (filter.ScoreMax.HasValue)
                query = query.Where(s => s.LatestScore <= filter.ScoreMax.Value);

            if (!string.IsNullOrWhiteSpace(filter.Date))
            {
                if (DateTime.TryParse(filter.Date, out var date))
                {
                    var dayStart = date.Date;
                    var dayEnd = dayStart.AddDays(1);
                    query = query.Where(s => s.CreatedAt >= dayStart && s.CreatedAt < dayEnd);
                }
            }

            if (!string.IsNullOrWhiteSpace(filter.Status))
                query = query.Where(s => s.Status == filter.Status);

            // ── Đếm tổng (trước phân trang) ──
            var totalCount = await query.CountAsync();

            // ── Phân trang ──
            var pageSize = Math.Max(1, Math.Min(filter.PageSize, 100)); // giới hạn tối đa 100
            var page = Math.Max(1, filter.Page);
            var skip = (page - 1) * pageSize;

            var items = await query
                .OrderByDescending(s => s.UpdatedAt)
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<PracticeSessionListItemDto>
            {
                Items = items.Select(MapToListItem).ToList(),
                TotalItems = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        /// <summary>
        /// Chi tiết 1 phiên luyện tập, kèm danh sách các lần làm (không gồm câu hỏi chi tiết).
        /// </summary>
        public async Task<PracticeSessionDetailDto> GetSessionDetailAsync(int sessionId)
        {
            var session = await _db.PracticeSessions
                .AsNoTracking()
                .Include(s => s.Attempts.OrderByDescending(a => a.AttemptNumber))
                .FirstOrDefaultAsync(s => s.Id == sessionId)
                ?? throw new KeyNotFoundException($"Không tìm thấy phiên luyện tập ID={sessionId}.");

            return new PracticeSessionDetailDto
            {
                Id           = session.Id,
                UserId       = session.UserId,
                UserName     = session.UserName,
                Role         = session.Role,
                SkillType    = session.SkillType,
                LatestScore  = session.LatestScore,
                BestScore    = session.BestScore,
                AttemptCount = session.AttemptCount,
                Status       = session.Status,
                CreatedAt    = FormatDateVN(session.CreatedAt),
                UpdatedAt    = FormatDateVN(session.UpdatedAt),
                Attempts     = session.Attempts.Select(MapToAttemptListItem).ToList()
            };
        }

        /// <summary>
        /// Danh sách các lần làm bài trong 1 phiên (không kèm câu hỏi chi tiết).
        /// Sắp xếp theo AttemptNumber ASC để thấy tiến trình cải thiện.
        /// </summary>
        public async Task<List<PracticeAttemptListItemDto>> GetAttemptsAsync(int sessionId)
        {
            var exists = await _db.PracticeSessions.AnyAsync(s => s.Id == sessionId);
            if (!exists) throw new KeyNotFoundException($"Không tìm thấy phiên luyện tập ID={sessionId}.");

            var attempts = await _db.PracticeAttempts
                .AsNoTracking()
                .Where(a => a.SessionId == sessionId)
                .OrderBy(a => a.AttemptNumber)
                .ToListAsync();

            return attempts.Select(MapToAttemptListItem).ToList();
        }

        /// <summary>
        /// Chi tiết 1 lần làm bài, kèm toàn bộ câu hỏi và câu trả lời.
        /// </summary>
        public async Task<PracticeAttemptDetailDto> GetAttemptDetailAsync(int attemptId)
        {
            var attempt = await _db.PracticeAttempts
                .AsNoTracking()
                .Include(a => a.Questions.OrderBy(q => q.Id))
                .FirstOrDefaultAsync(a => a.Id == attemptId)
                ?? throw new KeyNotFoundException($"Không tìm thấy lần làm bài ID={attemptId}.");

            return new PracticeAttemptDetailDto
            {
                Id            = attempt.Id,
                SessionId     = attempt.SessionId,
                AttemptNumber = attempt.AttemptNumber,
                Score         = attempt.Score,
                DurationText  = FormatDuration(attempt.DurationSeconds),
                StartedAt     = FormatDateVN(attempt.StartedAt),
                CompletedAt   = attempt.CompletedAt.HasValue ? FormatDateVN(attempt.CompletedAt.Value) : "",
                Summary       = attempt.Summary,
                Questions     = attempt.Questions.Select(MapToQuestionDto).ToList()
            };
        }

        /// <summary>
        /// Chỉ lấy danh sách câu hỏi của 1 lần làm (không kèm info attempt).
        /// </summary>
        public async Task<List<PracticeAttemptQuestionDto>> GetAttemptQuestionsAsync(int attemptId)
        {
            var exists = await _db.PracticeAttempts.AnyAsync(a => a.Id == attemptId);
            if (!exists) throw new KeyNotFoundException($"Không tìm thấy lần làm bài ID={attemptId}.");

            var questions = await _db.PracticeAttemptQuestions
                .AsNoTracking()
                .Where(q => q.AttemptId == attemptId)
                .OrderBy(q => q.Id)
                .ToListAsync();

            return questions.Select(MapToQuestionDto).ToList();
        }

        /// <summary>
        /// Dữ liệu báo cáo PDF (chỉ thông tin tổng quan, không có dữ liệu nhạy cảm).
        /// </summary>
        public async Task<InterviewDataReportDto> GetReportDataAsync()
        {
            var overview = await GetOverviewAsync();

            // Lấy tối đa 50 session cho báo cáo
            var sessions = await _db.PracticeSessions
                .AsNoTracking()
                .OrderByDescending(s => s.UpdatedAt)
                .Take(50)
                .ToListAsync();

            // Top 10 user có BestScore cao nhất (GROUP BY UserId)
            var topUsers = await _db.PracticeSessions
                .AsNoTracking()
                .GroupBy(s => new { s.UserId, s.UserName, s.Role })
                .Select(g => new TopUserDto
                {
                    UserId       = g.Key.UserId,
                    UserName     = g.Key.UserName,
                    Role         = g.Key.Role,
                    BestScore    = g.Max(s => s.BestScore),
                    TotalAttempts = g.Sum(s => s.AttemptCount)
                })
                .OrderByDescending(u => u.BestScore)
                .Take(10)
                .ToListAsync();

            return new InterviewDataReportDto
            {
                ReportTitle = "Báo cáo Dữ liệu Phỏng vấn",
                GeneratedAt = FormatDateVN(DateTime.UtcNow),
                Overview    = overview,
                Sessions    = sessions.Select(MapToListItem).ToList(),
                TopUsers    = topUsers
            };
        }

        // ══════════════════════════════════════════════════════
        // PRACTICE INTEGRATION
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// Tạo PracticeAttempt từ HR Interview Session đã hoàn thành.
        ///
        /// NGUYÊN TẮC BẤT BIẾN:
        ///   - KHÔNG bao giờ xóa hay sửa PracticeAttempt cũ
        ///   - Mỗi lần gọi hàm này = 1 PracticeAttempt mới được tạo
        ///   - AttemptNumber = AttemptCount hiện tại + 1
        /// </summary>
        public async Task<PracticeAttempt> CreateAttemptFromHrSessionAsync(
            int userId, string userName, int hrSessionId)
        {
            // Lấy HR session + câu hỏi + câu trả lời + kết quả cuối
            var hrSession = await _db.HrInterviewSessions
                .Include(s => s.Questions)
                .Include(s => s.Answers)
                    .ThenInclude(a => a.Evaluation)
                .Include(s => s.FinalResult)
                .FirstOrDefaultAsync(s => s.Id == hrSessionId && s.UserId == userId)
                ?? throw new KeyNotFoundException($"Không tìm thấy HR session ID={hrSessionId}.");

            if (hrSession.Status != "Completed")
                throw new InvalidOperationException("HR session chưa hoàn thành, không thể tạo Attempt.");

            var score = hrSession.FinalScore ?? 0;
            var role  = hrSession.Role;

            // ── Bước 1: Tìm hoặc tạo PracticeSession ──
            var session = await _db.PracticeSessions
                .FirstOrDefaultAsync(s => s.UserId == userId && s.SkillType == "HR" && s.Role == role);

            if (session == null)
            {
                session = new PracticeSession
                {
                    UserId   = userId,
                    UserName = userName,
                    Role     = role,
                    SkillType = "HR",
                    Status   = "Active"
                };
                _db.PracticeSessions.Add(session);
                await _db.SaveChangesAsync(); // lấy Id mới
            }

            // ── Bước 2: Tạo PracticeAttempt mới ──
            var attemptNumber = session.AttemptCount + 1;
            var duration = hrSession.CompletedAt.HasValue
                ? (int)(hrSession.CompletedAt.Value - hrSession.CreatedAt).TotalSeconds
                : 0;

            var attempt = new PracticeAttempt
            {
                SessionId     = session.Id,
                AttemptNumber = attemptNumber,
                Score         = score,
                DurationSeconds = duration,
                StartedAt     = hrSession.CreatedAt,
                CompletedAt   = hrSession.CompletedAt,
                Summary       = hrSession.FinalResult?.OverallObservation ?? string.Empty
                                // CHỈ lưu summary, KHÔNG lưu full prompt hay API response raw
            };
            _db.PracticeAttempts.Add(attempt);
            await _db.SaveChangesAsync(); // lấy attemptId

            // ── Bước 3: Lưu từng câu hỏi + câu trả lời ──
            var attemptQuestions = hrSession.Questions.Select(q =>
            {
                var ans = hrSession.Answers.FirstOrDefault(a => a.QuestionId == q.Id);
                return new PracticeAttemptQuestion
                {
                    AttemptId        = attempt.Id,
                    SourceQuestionId = q.Id,
                    Question         = q.QuestionText,
                    UserAnswer       = ans?.AnswerText ?? string.Empty,
                    Score            = ans?.Evaluation?.QuestionScore ?? 0,
                    // Chỉ lưu feedback tổng hợp, KHÔNG lưu full AI prompt
                    AiFeedback       = ans?.Evaluation?.Weaknesses ?? string.Empty,
                    Category         = q.Category
                };
            }).ToList();

            _db.PracticeAttemptQuestions.AddRange(attemptQuestions);

            // ── Bước 4: Cập nhật PracticeSession ──
            // LatestScore = điểm lần này (luôn ghi đè)
            session.LatestScore  = score;
            // BestScore = giữ điểm cao nhất qua tất cả các lần
            session.BestScore    = Math.Max(session.BestScore, score);
            // AttemptCount tăng 1
            session.AttemptCount = attemptNumber;
            session.UpdatedAt    = DateTime.UtcNow;
            // Nếu đây là lần đầu hoàn thành, set Completed
            if (session.AttemptCount >= 1)
                session.Status = "Completed";

            await _db.SaveChangesAsync();

            _logger.LogInformation(
                "✅ PracticeAttempt tạo thành công: User={UserId}, SkillType=HR, Attempt #{N}, Score={Score}",
                userId, attemptNumber, score);

            return attempt;
        }

        /// <summary>
        /// Tạo PracticeAttempt từ Technical Interview Session đã hoàn thành.
        /// Technical dùng entity InterviewSession (khác với HrInterviewSession).
        /// </summary>
        public async Task<PracticeAttempt> CreateAttemptFromTechnicalSessionAsync(
            int userId, string userName, int technicalSessionId)
        {
            var techSession = await _db.InterviewSessions
                .Include(s => s.Questions)
                .FirstOrDefaultAsync(s => s.Id == technicalSessionId && s.UserId == userId)
                ?? throw new KeyNotFoundException($"Không tìm thấy Technical session ID={technicalSessionId}.");

            if (techSession.Status != "Completed")
                throw new InvalidOperationException("Technical session chưa hoàn thành.");

            var score = techSession.OverallScore;
            var role  = techSession.Role;

            // Tìm hoặc tạo PracticeSession TECHNICAL
            var session = await _db.PracticeSessions
                .FirstOrDefaultAsync(s => s.UserId == userId && s.SkillType == "TECHNICAL" && s.Role == role);

            if (session == null)
            {
                session = new PracticeSession
                {
                    UserId    = userId,
                    UserName  = userName,
                    Role      = role,
                    SkillType = "TECHNICAL",
                    Status    = "Active"
                };
                _db.PracticeSessions.Add(session);
                await _db.SaveChangesAsync();
            }

            var attemptNumber = session.AttemptCount + 1;
            var duration = techSession.CompletedAt.HasValue
                ? (int)(techSession.CompletedAt.Value - techSession.CreatedAt).TotalSeconds
                : 0;

            var attempt = new PracticeAttempt
            {
                SessionId       = session.Id,
                AttemptNumber   = attemptNumber,
                Score           = score,
                DurationSeconds = duration,
                StartedAt       = techSession.CreatedAt,
                CompletedAt     = techSession.CompletedAt,
                Summary         = techSession.OverallFeedback
            };
            _db.PracticeAttempts.Add(attempt);
            await _db.SaveChangesAsync();

            // Lưu câu hỏi (Technical dùng InterviewQuestion entity)
            var questions = techSession.Questions.Select(q => new PracticeAttemptQuestion
            {
                AttemptId        = attempt.Id,
                SourceQuestionId = q.Id,
                Question         = q.Content,
                UserAnswer       = q.UserAnswer,
                Score            = q.Score,
                AiFeedback       = q.Feedback,
                Category         = q.Phase
            }).ToList();

            _db.PracticeAttemptQuestions.AddRange(questions);

            // Cập nhật Session
            session.LatestScore  = score;
            session.BestScore    = Math.Max(session.BestScore, score);
            session.AttemptCount = attemptNumber;
            session.UpdatedAt    = DateTime.UtcNow;
            session.Status       = "Completed";

            await _db.SaveChangesAsync();

            _logger.LogInformation(
                "✅ PracticeAttempt tạo thành công: User={UserId}, SkillType=TECHNICAL, Attempt #{N}, Score={Score}",
                userId, attemptNumber, score);

            return attempt;
        }

        // ══════════════════════════════════════════════════════
        // PRIVATE HELPERS
        // ══════════════════════════════════════════════════════

        private static PracticeSessionListItemDto MapToListItem(PracticeSession s) => new()
        {
            Id           = s.Id,
            UserId       = s.UserId,
            UserName     = s.UserName,
            Role         = s.Role,
            SkillType    = s.SkillType,
            LatestScore  = s.LatestScore,
            BestScore    = s.BestScore,
            AttemptCount = s.AttemptCount,
            Status       = s.Status,
            CreatedAt    = FormatDateVN(s.CreatedAt),
            UpdatedAt    = FormatDateVN(s.UpdatedAt)
        };

        private static PracticeAttemptListItemDto MapToAttemptListItem(PracticeAttempt a) => new()
        {
            Id            = a.Id,
            AttemptNumber = a.AttemptNumber,
            Score         = a.Score,
            DurationText  = FormatDuration(a.DurationSeconds),
            CompletedAt   = a.CompletedAt.HasValue ? FormatDateVN(a.CompletedAt.Value) : "",
            CreatedAt     = FormatDateVN(a.CreatedAt)
        };

        private static PracticeAttemptQuestionDto MapToQuestionDto(PracticeAttemptQuestion q) => new()
        {
            Id         = q.Id,
            Question   = q.Question,
            UserAnswer = q.UserAnswer,
            Score      = q.Score,
            AiFeedback = q.AiFeedback,
            Category   = q.Category
        };

        /// <summary>Định dạng ngày kiểu Việt Nam: dd/MM/yyyy HH:mm</summary>
        private static string FormatDateVN(DateTime dt)
        {
            // Convert UTC → UTC+7 (Việt Nam)
            var vn = dt.Kind == DateTimeKind.Utc
                ? dt.AddHours(7)
                : dt;
            return vn.ToString("dd/MM/yyyy HH:mm");
        }

        /// <summary>Định dạng thời gian làm bài: "25 phút 30 giây" hoặc "1 giờ 5 phút"</summary>
        private static string FormatDuration(int seconds)
        {
            if (seconds <= 0) return "—";
            var ts = TimeSpan.FromSeconds(seconds);
            if (ts.TotalHours >= 1)
                return $"{(int)ts.TotalHours} giờ {ts.Minutes} phút";
            if (ts.TotalMinutes >= 1)
                return $"{ts.Minutes} phút {ts.Seconds} giây";
            return $"{ts.Seconds} giây";
        }
    }
}
