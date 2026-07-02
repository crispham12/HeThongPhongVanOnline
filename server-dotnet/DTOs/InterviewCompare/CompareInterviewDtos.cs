using System;
using System.Collections.Generic;

namespace InterviewPro.API.DTOs.InterviewCompare
{
    public class CompareInterviewRequestDto
    {
        public string InterviewAId { get; set; } = string.Empty;
        public string InterviewBId { get; set; } = string.Empty;
    }

    public class CompareInterviewSummaryDto
    {
        public string SessionId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty; // e.g. 2026-07-01
        public double OverallScore { get; set; }
    }

    public class CompareMetricDto
    {
        public string Name { get; set; } = string.Empty;
        public double? InterviewAScore { get; set; }
        public double? InterviewBScore { get; set; }
        public double? Difference { get; set; }
        public string Trend { get; set; } = "notAvailable"; // up, down, same, notAvailable
    }

    public class CompareInterviewResponseDto
    {
        public CompareInterviewSummaryDto InterviewA { get; set; } = new();
        public CompareInterviewSummaryDto InterviewB { get; set; } = new();
        public double OverallDifference { get; set; }
        public string BetterInterview { get; set; } = string.Empty; // A, B, Equal
        public string PracticeFocus { get; set; } = string.Empty;
        public List<CompareMetricDto> Metrics { get; set; } = new();
        public List<string> StrengthsComparison { get; set; } = new();
        public List<string> WeaknessesComparison { get; set; } = new();
    }
}
