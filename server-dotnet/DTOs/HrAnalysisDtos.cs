using System;

namespace InterviewPro.API.DTOs
{
    public class AnalysisStatusResponseDto
    {
        public int SessionId { get; set; }
        public string Status { get; set; } = string.Empty;
        public int Progress { get; set; }
        public string CurrentStep { get; set; } = string.Empty;
        public bool CanRedirect { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class AnalysisResultResponseDto
    {
        public int SessionId { get; set; }
        public double OverallScore { get; set; }
        public double STARScore { get; set; }
        public double CommunicationScore { get; set; }
        public double ConfidenceScore { get; set; }
        public double ProfessionalismScore { get; set; }
        public string TranscriptAnalysis { get; set; } = string.Empty;
        public string Strengths { get; set; } = string.Empty;
        public string Weaknesses { get; set; } = string.Empty;
        public string ImprovementSuggestions { get; set; } = string.Empty;
        public string FinalFeedback { get; set; } = string.Empty;
        public DateTime CompletedAt { get; set; }
    }
}
