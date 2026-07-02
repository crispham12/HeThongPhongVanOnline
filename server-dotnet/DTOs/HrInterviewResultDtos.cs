using System;
using System.Collections.Generic;

namespace InterviewPro.API.DTOs
{
    public class HrInterviewResultResponseDto
    {
        public string SessionId { get; set; } = string.Empty;
        public bool IsReady { get; set; }
        public string? Message { get; set; }

        public HrInterviewSummaryDto? Summary { get; set; }
        public HrInterviewOverallDto? Overall { get; set; }
        public List<HrInterviewScoreMetricDto>? ScoreBreakdown { get; set; }
        public List<HrInterviewStrengthDto>? Strengths { get; set; }
        public List<HrInterviewImprovementDto>? Improvements { get; set; }
        public List<HrInterviewStarAnalysisDto>? StarAnalysis { get; set; }
    }

    public class HrInterviewSummaryDto
    {
        public string Role { get; set; } = string.Empty;
        public string InterviewType { get; set; } = "HR Interview";
        public string Level { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public int QuestionsAnswered { get; set; }
        public int TotalQuestions { get; set; }
        public string InterviewDate { get; set; } = string.Empty;
        public string OverallStatus { get; set; } = string.Empty;
    }

    public class HrInterviewOverallDto
    {
        public double Score { get; set; }
        public string Status { get; set; } = string.Empty;
        public string SummaryText { get; set; } = string.Empty;
        public string TopPercentile { get; set; } = string.Empty;
        public string HiringReadiness { get; set; } = string.Empty;
    }

    public class HrInterviewScoreMetricDto
    {
        public string Name { get; set; } = string.Empty;
        public double Score { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class HrInterviewStrengthDto
    {
        public string Title { get; set; } = string.Empty;
        public double Score { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class HrInterviewImprovementDto
    {
        public string Title { get; set; } = string.Empty;
        public double Score { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class HrInterviewStarAnalysisDto
    {
        public string Name { get; set; } = string.Empty;
        public double Score { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Feedback { get; set; } = string.Empty;
    }
}
