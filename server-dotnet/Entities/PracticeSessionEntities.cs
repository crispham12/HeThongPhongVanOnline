using System;
using System.Collections.Generic;

namespace InterviewPro.API.Entities
{
    /// <summary>
    /// PracticeSession — Đại diện cho TOÀN BỘ hành trình luyện tập của một user với một kỹ năng.
    ///
    /// Ví dụ:
    ///   User A luyện HR → có 1 PracticeSession (SkillType = "HR")
    ///   User A luyện Technical → có 1 PracticeSession (SkillType = "TECHNICAL")
    ///
    /// Mỗi lần luyện tập tạo ra 1 PracticeAttempt mới bên trong PracticeSession đó.
    /// PracticeSession lưu LatestScore, BestScore, AttemptCount để tổng hợp nhanh.
    /// </summary>
    public class PracticeSession
    {
        public int Id { get; set; }

        // Thông tin người dùng
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;   // Ví dụ: "Frontend Developer"

        /// <summary>HR | TECHNICAL | CODING | COMPREHENSIVE</summary>
        public string SkillType { get; set; } = string.Empty;

        // ── Thống kê tổng hợp (cập nhật sau mỗi lần làm) ──
        /// <summary>Điểm lần luyện tập gần nhất</summary>
        public double LatestScore { get; set; } = 0;

        /// <summary>Điểm cao nhất trong tất cả các lần</summary>
        public double BestScore { get; set; } = 0;

        /// <summary>Số lần đã luyện tập</summary>
        public int AttemptCount { get; set; } = 0;

        /// <summary>Active | Completed | Inactive</summary>
        public string Status { get; set; } = "Active";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<PracticeAttempt> Attempts { get; set; } = new List<PracticeAttempt>();
    }

    /// <summary>
    /// PracticeAttempt — Đại diện cho MỘT LẦN luyện tập cụ thể.
    ///
    /// Ví dụ:
    ///   HR lần 1 → PracticeAttempt (AttemptNumber=1, Score=65)
    ///   HR lần 2 → PracticeAttempt (AttemptNumber=2, Score=72)
    ///   HR lần 3 → PracticeAttempt (AttemptNumber=3, Score=85)
    ///
    /// KHÔNG BAO GIỜ ghi đè PracticeAttempt cũ.
    /// Mỗi lần làm bài là một bản ghi riêng biệt và bất biến.
    /// </summary>
    public class PracticeAttempt
    {
        public int Id { get; set; }

        // FK về PracticeSession
        public int SessionId { get; set; }

        /// <summary>Số thứ tự lần làm: 1, 2, 3, ...</summary>
        public int AttemptNumber { get; set; }

        /// <summary>Điểm tổng của lần làm này (0-100)</summary>
        public double Score { get; set; }

        /// <summary>Thời gian làm bài (giây)</summary>
        public int DurationSeconds { get; set; }

        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        /// <summary>Tóm tắt AI về lần làm này (không chứa nội dung nhạy cảm)</summary>
        public string Summary { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public PracticeSession? Session { get; set; }
        public ICollection<PracticeAttemptQuestion> Questions { get; set; } = new List<PracticeAttemptQuestion>();
    }

    /// <summary>
    /// PracticeAttemptQuestion — Từng câu hỏi và câu trả lời trong một lần làm bài.
    ///
    /// Lưu đủ thông tin để Admin xem lại chi tiết từng câu:
    ///   - Câu hỏi là gì
    ///   - User trả lời gì
    ///   - AI chấm mấy điểm
    ///   - AI feedback là gì
    ///
    /// Không lưu: Prompt AI, API Key, source code nội bộ.
    /// </summary>
    public class PracticeAttemptQuestion
    {
        public int Id { get; set; }

        // FK về PracticeAttempt
        public int AttemptId { get; set; }

        /// <summary>ID câu hỏi từ nguồn gốc (HrInterviewQuestion.Id, Question.Id, v.v.)</summary>
        public int? SourceQuestionId { get; set; }

        /// <summary>Nội dung câu hỏi (lưu bản sao để không mất khi question bị xóa)</summary>
        public string Question { get; set; } = string.Empty;

        /// <summary>Câu trả lời của user</summary>
        public string UserAnswer { get; set; } = string.Empty;

        /// <summary>Điểm câu này (0-100)</summary>
        public double Score { get; set; }

        /// <summary>Nhận xét của AI cho câu này (không chứa full prompt)</summary>
        public string AiFeedback { get; set; } = string.Empty;

        /// <summary>Loại câu hỏi: Communication, Clarity, STAR, ProfessionalMindset, Relevance, Algorithm, ...</summary>
        public string Category { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public PracticeAttempt? Attempt { get; set; }
    }
}
