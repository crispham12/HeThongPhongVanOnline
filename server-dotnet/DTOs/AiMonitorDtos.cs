namespace InterviewPro.API.DTOs
{
    // ──────────────────────────────────────────────────────────
    // FILTER / PAGINATION
    // ──────────────────────────────────────────────────────────

    /// <summary>
    /// Filter chung cho các query AI Monitor.
    /// </summary>
    public class AiMonitorFilterDto
    {
        /// <summary>Ngày bắt đầu (UTC). Null = không giới hạn.</summary>
        public DateTime? From { get; set; }

        /// <summary>Ngày kết thúc (UTC). Null = không giới hạn.</summary>
        public DateTime? To { get; set; }

        /// <summary>
        /// Feature cụ thể: HRInterview, TechnicalInterview, CodingAnalysis,
        /// GitHubAnalysis, CVAnalysis, RoadmapGeneration, QuestionGeneration.
        /// Null = tất cả.
        /// </summary>
        public string? Feature { get; set; }

        /// <summary>Model cụ thể: gpt-3.5-turbo, gpt-4, gemini-pro, fallback. Null = tất cả.</summary>
        public string? Model { get; set; }

        /// <summary>Status: Success, Failed, Timeout. Null = tất cả.</summary>
        public string? Status { get; set; }
    }

    // ──────────────────────────────────────────────────────────
    // OVERVIEW
    // ──────────────────────────────────────────────────────────

    /// <summary>Tổng quan hệ thống AI trong khoảng thời gian.</summary>
    public class AiMonitorOverviewDto
    {
        public int TotalRequests { get; set; }
        public int SuccessCount { get; set; }
        public int FailedCount { get; set; }
        public int TimeoutCount { get; set; }
        public double SuccessRate { get; set; }          // 0–100 %

        public long TotalInputTokens { get; set; }
        public long TotalOutputTokens { get; set; }
        public long TotalTokens { get; set; }

        public decimal TotalEstimatedCost { get; set; } // USD
        public double AvgResponseTimeMs { get; set; }
        public double P95ResponseTimeMs { get; set; }   // 95th percentile

        public int UniqueUsers { get; set; }

        /// <summary>Breakdown theo model.</summary>
        public List<AiModelUsageDto> ModelBreakdown { get; set; } = new();
    }

    public class AiModelUsageDto
    {
        public string Model { get; set; } = string.Empty;
        public int Requests { get; set; }
        public long TotalTokens { get; set; }
        public decimal TotalCost { get; set; }
    }

    // ──────────────────────────────────────────────────────────
    // FEATURE USAGE
    // ──────────────────────────────────────────────────────────

    public class AiMonitorFeatureUsageDto
    {
        public string Feature { get; set; } = string.Empty;
        public int TotalRequests { get; set; }
        public int SuccessCount { get; set; }
        public int FailedCount { get; set; }
        public long TotalTokens { get; set; }
        public decimal TotalCost { get; set; }
        public double AvgResponseTimeMs { get; set; }
        public double SuccessRate { get; set; }
    }

    // ──────────────────────────────────────────────────────────
    // DAILY USAGE (time series)
    // ──────────────────────────────────────────────────────────

    public class AiDailyUsageDto
    {
        public string Date { get; set; } = string.Empty;   // "yyyy-MM-dd"
        public int TotalRequests { get; set; }
        public int SuccessCount { get; set; }
        public int FailedCount { get; set; }
        public long TotalTokens { get; set; }
        public decimal TotalCost { get; set; }
        public double AvgResponseTimeMs { get; set; }
    }

    // ──────────────────────────────────────────────────────────
    // ERROR LOGS
    // ──────────────────────────────────────────────────────────

    public class AiErrorLogDto
    {
        public Guid Id { get; set; }
        public int? UserId { get; set; }
        public string Feature { get; set; } = string.Empty;
        public string RequestType { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
        public long ResponseTimeMs { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // ──────────────────────────────────────────────────────────
    // RAW LOGS
    // ──────────────────────────────────────────────────────────

    public class AiRequestLogDto
    {
        public Guid Id { get; set; }
        public int? UserId { get; set; }
        public string Feature { get; set; } = string.Empty;
        public string RequestType { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int InputTokens { get; set; }
        public int OutputTokens { get; set; }
        public int TotalTokens { get; set; }
        public decimal EstimatedCost { get; set; }
        public long ResponseTimeMs { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // ──────────────────────────────────────────────────────────
    // TOP USERS
    // ──────────────────────────────────────────────────────────

    public class AiTopUserDto
    {
        public int UserId { get; set; }
        public int TotalRequests { get; set; }
        public long TotalTokens { get; set; }
        public decimal TotalCost { get; set; }
        public int FailedRequests { get; set; }
    }
}
