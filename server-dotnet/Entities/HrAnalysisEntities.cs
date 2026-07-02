using System;

namespace InterviewPro.API.Entities
{
    public class InterviewAnalysisJob
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        
        // Status: Pending, Running, Completed, Failed
        public string Status { get; set; } = "Pending";
        
        // Progress: 0 - 100
        public int Progress { get; set; } = 0;
        
        // Current Step: Transcript Processing, Speech Analysis, STAR Evaluation, Communication Skills, Professionalism Assessment, Confidence Analysis, Generating Feedback, Preparing Final Report
        public string CurrentStep { get; set; } = "Pending";
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        
        public string ErrorMessage { get; set; } = string.Empty;
        
        public int? AnalysisResultId { get; set; }
    }

    public class InterviewAnalysisResult
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        
        // Scores
        public double OverallScore { get; set; }
        public double STARScore { get; set; }
        public double CommunicationScore { get; set; }
        public double ConfidenceScore { get; set; }
        public double ProfessionalismScore { get; set; }
        public double LogicScore { get; set; }
        public double CompletenessScore { get; set; }
        public double ClarityScore { get; set; }

        public string OverallStatus { get; set; } = string.Empty;
        public string SummaryText { get; set; } = string.Empty;
        public string TopPercentile { get; set; } = string.Empty;
        public string HiringReadiness { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<InterviewStrength> Strengths { get; set; } = new List<InterviewStrength>();
        public ICollection<InterviewImprovement> Improvements { get; set; } = new List<InterviewImprovement>();
        public ICollection<InterviewStarAnalysis> StarAnalyses { get; set; } = new List<InterviewStarAnalysis>();
    }

    public class InterviewStrength
    {
        public int Id { get; set; }
        public int ResultId { get; set; }
        public string Title { get; set; } = string.Empty;
        public double Score { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int OrderIndex { get; set; }

        public InterviewAnalysisResult? Result { get; set; }
    }

    public class InterviewImprovement
    {
        public int Id { get; set; }
        public int ResultId { get; set; }
        public string Title { get; set; } = string.Empty;
        public double Score { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int OrderIndex { get; set; }

        public InterviewAnalysisResult? Result { get; set; }
    }

    public class InterviewStarAnalysis
    {
        public int Id { get; set; }
        public int ResultId { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Score { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Feedback { get; set; } = string.Empty;
        public int OrderIndex { get; set; }

        public InterviewAnalysisResult? Result { get; set; }
    }
}
