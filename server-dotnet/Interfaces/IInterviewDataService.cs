using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;

namespace InterviewPro.API.Interfaces
{
    /// <summary>
    /// IInterviewDataService — Contract cho toàn bộ business logic
    /// của chức năng "Quản lý dữ liệu phỏng vấn".
    ///
    /// Hai nhóm chức năng chính:
    ///
    /// [Admin Read APIs]
    ///   → Đọc dữ liệu từ PracticeSession, PracticeAttempt, PracticeAttemptQuestion
    ///   → Dùng cho Admin Dashboard
    ///
    /// [Practice Integration]
    ///   → Được gọi bởi HrInterviewService / InterviewService
    ///     khi user hoàn thành 1 bài luyện tập
    ///   → Tự động tạo PracticeAttempt mới, KHÔNG ghi đè dữ liệu cũ
    /// </summary>
    public interface IInterviewDataService
    {
        // ──────────────────────────────────────────────────────
        // ADMIN READ APIs
        // ──────────────────────────────────────────────────────

        /// <summary>
        /// Lấy thống kê tổng quan cho Admin Dashboard.
        /// GET /api/admin/interview-data/overview
        /// </summary>
        Task<InterviewDataOverviewDto> GetOverviewAsync();

        /// <summary>
        /// Lấy danh sách phiên luyện tập với bộ lọc và phân trang.
        /// GET /api/admin/interview-data
        /// </summary>
        Task<PagedResult<PracticeSessionListItemDto>> GetSessionsAsync(AdminInterviewDataFilterRequest filter);

        /// <summary>
        /// Lấy chi tiết 1 phiên luyện tập (kèm danh sách attempts).
        /// GET /api/admin/interview-data/{sessionId}
        /// </summary>
        Task<PracticeSessionDetailDto> GetSessionDetailAsync(int sessionId);

        /// <summary>
        /// Lấy danh sách tất cả lần làm bài trong 1 phiên (không kèm câu hỏi chi tiết).
        /// GET /api/admin/interview-data/{sessionId}/attempts
        /// </summary>
        Task<List<PracticeAttemptListItemDto>> GetAttemptsAsync(int sessionId);

        /// <summary>
        /// Lấy chi tiết 1 lần làm bài (kèm danh sách câu hỏi + câu trả lời).
        /// GET /api/admin/interview-data/attempt/{attemptId}
        /// </summary>
        Task<PracticeAttemptDetailDto> GetAttemptDetailAsync(int attemptId);

        /// <summary>
        /// Lấy danh sách câu hỏi và câu trả lời của 1 lần làm bài.
        /// GET /api/admin/interview-data/attempt/{attemptId}/questions
        /// </summary>
        Task<List<PracticeAttemptQuestionDto>> GetAttemptQuestionsAsync(int attemptId);

        /// <summary>
        /// Lấy dữ liệu đầy đủ để tạo báo cáo PDF.
        /// GET /api/admin/interview-data/report
        /// CHỈ trả về dữ liệu tổng quan, KHÔNG chứa thông tin nhạy cảm.
        /// </summary>
        Task<InterviewDataReportDto> GetReportDataAsync();

        // ──────────────────────────────────────────────────────
        // PRACTICE INTEGRATION
        // Được gọi bởi các service khác khi user hoàn thành bài
        // ──────────────────────────────────────────────────────

        /// <summary>
        /// Tạo PracticeAttempt mới từ HR Interview Session đã hoàn thành.
        ///
        /// Logic:
        ///   1. Tìm PracticeSession (HR) của user, nếu chưa có thì tạo mới
        ///   2. Tạo PracticeAttempt với AttemptNumber = AttemptCount + 1
        ///   3. Lưu từng câu hỏi/trả lời vào PracticeAttemptQuestion
        ///   4. Cập nhật PracticeSession:
        ///      LatestScore = điểm lần này
        ///      BestScore = max(BestScore, điểm lần này)
        ///      AttemptCount += 1
        ///
        /// Được gọi bởi: HrInterviewService.CompleteInterviewAsync()
        /// </summary>
        Task<PracticeAttempt> CreateAttemptFromHrSessionAsync(int userId, string userName, int hrSessionId);

        /// <summary>
        /// Tạo PracticeAttempt mới từ Technical Interview Session đã hoàn thành.
        /// Được gọi bởi: InterviewController khi Technical session Completed
        /// </summary>
        Task<PracticeAttempt> CreateAttemptFromTechnicalSessionAsync(int userId, string userName, int technicalSessionId);
    }
}
