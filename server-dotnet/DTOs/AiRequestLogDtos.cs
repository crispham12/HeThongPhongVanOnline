using System;
using System.Collections.Generic;

namespace InterviewPro.API.DTOs
{
    public class AiRequestLogCreateDto
    {
        public int? UserId { get; set; }
        public string? UserName { get; set; }
        public string Feature { get; set; } = string.Empty;
        public string RequestType { get; set; } = string.Empty;
        public string? Model { get; set; }
        public string Status { get; set; } = "Success";
        public int InputTokens { get; set; }
        public int OutputTokens { get; set; }
        public int TotalTokens { get; set; }
        public decimal EstimatedCost { get; set; }
        public long ResponseTimeMs { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class AiMonitoringOverviewDto
    {
        public int TotalRequests { get; set; }
        public double AverageResponseTime { get; set; }
        public string AverageResponseTimeText { get; set; } = "0s";
        public long TotalTokens { get; set; }
        public decimal EstimatedCost { get; set; }
        public double SuccessRate { get; set; }
        public double ErrorRate { get; set; }
    }

    public class AiFeatureUsageDto
    {
        public string Feature { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public int RequestCount { get; set; }
        public double Percentage { get; set; }
    }

    public class AiTokenUsageDto
    {
        public string Label { get; set; } = string.Empty;
        public int InputTokens { get; set; }
        public int OutputTokens { get; set; }
        public int TotalTokens { get; set; }
    }

    public class AiRecentLogDto
    {
        public string UserName { get; set; } = string.Empty;
        public string Feature { get; set; } = string.Empty;
        public string FeatureDisplayName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string StatusText { get; set; } = string.Empty;
        public int TotalTokens { get; set; }
        public long ResponseTimeMs { get; set; }
        public string ResponseTimeText { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedAtText { get; set; } = string.Empty;
    }

    public class AiSystemStatusDto
    {
        public string ApiStatus { get; set; } = "Hoạt động";
        public string AiServiceStatus { get; set; } = "Hoạt động";
        public int GptLimitUsedPercent { get; set; }
        public long SystemLatencyMs { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class PaginatedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalItems { get; set; }
    }
}
