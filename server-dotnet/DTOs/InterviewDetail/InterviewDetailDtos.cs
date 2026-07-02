using System;
using System.Collections.Generic;

namespace InterviewPro.API.DTOs.InterviewDetail
{
    public class InterviewDetailSummaryDto
    {
        public string SessionId { get; set; } = string.Empty;
        public string InterviewType { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public DateTime? InterviewDate { get; set; }
        public int DurationMinutes { get; set; }
        public int QuestionsAnswered { get; set; }
        public int TotalQuestions { get; set; }
        public double OverallScore { get; set; }
        public string OverallStatus { get; set; } = string.Empty;
        public string HiringReadiness { get; set; } = string.Empty;
    }

    public class InterviewDetailOverallDto
    {
        public double OverallScore { get; set; }
        public string OverallStatus { get; set; } = string.Empty;
        public string HiringReadiness { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty; // AI summary from FinalResult
    }

    public class InterviewDetailScoreBreakdownDto
    {
        public double StarStructure { get; set; }
        public double Communication { get; set; }
        public double Professionalism { get; set; }
        public double Confidence { get; set; }
        public double Logic { get; set; }
        public double Completeness { get; set; }
        public double Clarity { get; set; }
    }

    public class InterviewDetailStrengthDto
    {
        public string Title { get; set; } = string.Empty;
        public double Score { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class InterviewDetailImprovementDto
    {
        public string Title { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty; // High, Medium, Low
        public string Description { get; set; } = string.Empty;
    }

    public class InterviewDetailStarAnalysisItemDto
    {
        public double Score { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Feedback { get; set; } = string.Empty;
    }

    public class InterviewDetailStarAnalysisDto
    {
        // This could be aggregated from the average of all questions,
        // or just the most critical one. Since the prompt asks for one STAR analysis,
        // we'll compute the average or return a global one if it exists.
        // Actually, the UI screenshot for STAR Analysis usually shows the overall STAR breakdown if available, 
        // or we aggregate it from QuestionEvaluations.
        public InterviewDetailStarAnalysisItemDto Situation { get; set; } = new();
        public InterviewDetailStarAnalysisItemDto Task { get; set; } = new();
        public InterviewDetailStarAnalysisItemDto Action { get; set; } = new();
        public InterviewDetailStarAnalysisItemDto Result { get; set; } = new();
    }

    public class InterviewDetailQuestionEvaluationDto
    {
        public int QuestionId { get; set; }
        public string Question { get; set; } = string.Empty;
        public double QuestionScore { get; set; }
        public double StarScore { get; set; }
        public double CommunicationScore { get; set; }
        public double ConfidenceScore { get; set; }
        public List<string> Strengths { get; set; } = new();
        public List<string> Weaknesses { get; set; } = new();
        public List<string> Suggestions { get; set; } = new();
        public string Transcript { get; set; } = string.Empty;
        public int Duration { get; set; } // in seconds
        public int WordCount { get; set; }
        public int FillerWords { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class InterviewDetailAiSummaryDto
    {
        public string OverallObservation { get; set; } = string.Empty;
        public string StrengthsSummary { get; set; } = string.Empty;
        public string WeaknessesSummary { get; set; } = string.Empty;
        public string HiringRecommendation { get; set; } = string.Empty;
    }

    public class InterviewDetailRecommendedPracticeDto
    {
        public string Title { get; set; } = string.Empty;
        public string EstimatedTime { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string RecommendedLevel { get; set; } = string.Empty;
    }

    public class InterviewDetailResponseDto
    {
        public InterviewDetailSummaryDto Summary { get; set; } = new();
        public InterviewDetailOverallDto Overall { get; set; } = new();
        public InterviewDetailScoreBreakdownDto ScoreBreakdown { get; set; } = new();
        public List<InterviewDetailStrengthDto> Strengths { get; set; } = new();
        public List<InterviewDetailImprovementDto> Improvements { get; set; } = new();
        public InterviewDetailStarAnalysisDto StarAnalysis { get; set; } = new();
        public List<InterviewDetailQuestionEvaluationDto> QuestionEvaluations { get; set; } = new();
        public InterviewDetailAiSummaryDto AiSummary { get; set; } = new();
        public List<InterviewDetailRecommendedPracticeDto> RecommendedPractices { get; set; } = new();
    }
}
