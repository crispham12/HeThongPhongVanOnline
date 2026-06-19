using System;
using System.Collections.Generic;

namespace InterviewPro.API.DTOs
{
    // ══════════════════════════════════════════════════════
    // QUERY / FILTER
    // ══════════════════════════════════════════════════════

    /// <summary>Query parameters cho GET /api/admin/interview-data</summary>
    public class AdminInterviewDataFilterRequest
    {
        /// <summary>Lọc theo role: "Frontend Developer", "Backend Developer", ...</summary>
        public string? Role { get; set; }

        /// <summary>Lọc theo loại kỹ năng: HR | TECHNICAL | CODING | COMPREHENSIVE</summary>
        public string? SkillType { get; set; }

        /// <summary>Điểm tối thiểu (0-100)</summary>
        public double? ScoreMin { get; set; }

        /// <summary>Điểm tối đa (0-100)</summary>
        public double? ScoreMax { get; set; }

        /// <summary>Lọc theo ngày tạo session (ISO date string: yyyy-MM-dd)</summary>
        public string? Date { get; set; }

        /// <summary>Lọc theo status: Active | Completed | Inactive</summary>
        public string? Status { get; set; }

        /// <summary>Trang hiện tại (bắt đầu từ 1)</summary>
        public int Page { get; set; } = 1;

        /// <summary>Số dòng mỗi trang</summary>
        public int PageSize { get; set; } = 20;
    }

    // ══════════════════════════════════════════════════════
    // OVERVIEW
    // ══════════════════════════════════════════════════════

    /// <summary>
    /// DTO cho GET /api/admin/interview-data/overview
    /// Dùng cho các card thống kê tổng quan ở đầu trang Admin.
    /// </summary>
    public class InterviewDataOverviewDto
    {
        /// <summary>Tổng số PracticeSession trong hệ thống</summary>
        public int TotalSessions { get; set; }

        /// <summary>Tổng số lần luyện tập (SUM của AttemptCount)</summary>
        public int TotalAttempts { get; set; }

        /// <summary>Số người dùng đã từng luyện tập (COUNT DISTINCT UserId)</summary>
        public int UniqueUsers { get; set; }

        /// <summary>Điểm trung bình (AVG LatestScore của Completed sessions)</summary>
        public double AverageScore { get; set; }

        // ── Breakdown theo SkillType ──
        public int HrCount { get; set; }
        public int TechnicalCount { get; set; }
        public int CodingCount { get; set; }
        public int ComprehensiveCount { get; set; }

        /// <summary>Số session đang Active (chưa hoàn thành)</summary>
        public int ActiveCount { get; set; }

        /// <summary>Số session đã Completed</summary>
        public int CompletedCount { get; set; }
    }

    // ══════════════════════════════════════════════════════
    // SESSION LIST
    // ══════════════════════════════════════════════════════

    /// <summary>
    /// DTO cho 1 dòng trong bảng danh sách phiên luyện tập.
    /// GET /api/admin/interview-data
    /// </summary>
    public class PracticeSessionListItemDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string SkillType { get; set; } = string.Empty;
        public double LatestScore { get; set; }
        public double BestScore { get; set; }
        public int AttemptCount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
        public string UpdatedAt { get; set; } = string.Empty;
    }

    // ══════════════════════════════════════════════════════
    // SESSION DETAIL
    // ══════════════════════════════════════════════════════

    /// <summary>
    /// DTO cho trang chi tiết 1 phiên luyện tập.
    /// GET /api/admin/interview-data/{sessionId}
    /// </summary>
    public class PracticeSessionDetailDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string SkillType { get; set; } = string.Empty;
        public double LatestScore { get; set; }
        public double BestScore { get; set; }
        public int AttemptCount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
        public string UpdatedAt { get; set; } = string.Empty;

        /// <summary>Danh sách tất cả lần luyện tập (tóm tắt)</summary>
        public List<PracticeAttemptListItemDto> Attempts { get; set; } = new();
    }

    // ══════════════════════════════════════════════════════
    // ATTEMPT LIST
    // ══════════════════════════════════════════════════════

    /// <summary>
    /// DTO cho 1 dòng trong bảng lịch sử luyện tập.
    /// GET /api/admin/interview-data/{sessionId}/attempts
    ///
    /// Ví dụ:
    ///   Attempt #1 | 65 điểm | 25 phút | 10/06/2026
    ///   Attempt #2 | 72 điểm | 28 phút | 11/06/2026
    ///   Attempt #3 | 85 điểm | 30 phút | 11/06/2026
    /// </summary>
    public class PracticeAttemptListItemDto
    {
        public int Id { get; set; }
        public int AttemptNumber { get; set; }
        public double Score { get; set; }

        /// <summary>Thời gian làm bài dạng "25 phút 30 giây"</summary>
        public string DurationText { get; set; } = string.Empty;

        /// <summary>Thời gian hoàn thành dạng dd/MM/yyyy HH:mm</summary>
        public string CompletedAt { get; set; } = string.Empty;

        public string CreatedAt { get; set; } = string.Empty;
    }

    // ══════════════════════════════════════════════════════
    // ATTEMPT DETAIL
    // ══════════════════════════════════════════════════════

    /// <summary>
    /// DTO cho trang chi tiết 1 lần làm bài.
    /// GET /api/admin/interview-data/attempt/{attemptId}
    /// </summary>
    public class PracticeAttemptDetailDto
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        public int AttemptNumber { get; set; }
        public double Score { get; set; }
        public string DurationText { get; set; } = string.Empty;
        public string StartedAt { get; set; } = string.Empty;
        public string CompletedAt { get; set; } = string.Empty;

        /// <summary>Tóm tắt AI về lần làm (không chứa nội dung nhạy cảm)</summary>
        public string Summary { get; set; } = string.Empty;

        /// <summary>Danh sách câu hỏi và câu trả lời</summary>
        public List<PracticeAttemptQuestionDto> Questions { get; set; } = new();
    }

    // ══════════════════════════════════════════════════════
    // QUESTION DETAIL
    // ══════════════════════════════════════════════════════

    /// <summary>
    /// DTO cho 1 câu hỏi trong một lần làm bài.
    /// GET /api/admin/interview-data/attempt/{attemptId}/questions
    /// </summary>
    public class PracticeAttemptQuestionDto
    {
        public int Id { get; set; }
        public string Question { get; set; } = string.Empty;
        public string UserAnswer { get; set; } = string.Empty;
        public double Score { get; set; }

        /// <summary>Nhận xét AI (không chứa prompt/API key)</summary>
        public string AiFeedback { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;
    }


    // ══════════════════════════════════════════════════════
    // PDF REPORT
    // ══════════════════════════════════════════════════════

    /// <summary>
    /// Dữ liệu dùng để tạo PDF báo cáo quản lý dữ liệu phỏng vấn.
    /// CHỈ chứa thông tin tổng quan, KHÔNG chứa:
    ///   - Prompt AI
    ///   - API Key
    ///   - CV Text
    ///   - Source Code người dùng
    ///   - Github Data
    /// </summary>
    public class InterviewDataReportDto
    {
        public string ReportTitle { get; set; } = "Báo cáo Dữ liệu Phỏng vấn";
        public string GeneratedAt { get; set; } = string.Empty;
        public InterviewDataOverviewDto Overview { get; set; } = new();
        public List<PracticeSessionListItemDto> Sessions { get; set; } = new();

        /// <summary>Top người dùng có điểm cao nhất (BestScore)</summary>
        public List<TopUserDto> TopUsers { get; set; } = new();
    }

    /// <summary>Top user theo BestScore</summary>
    public class TopUserDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public double BestScore { get; set; }
        public int TotalAttempts { get; set; }
    }
}
