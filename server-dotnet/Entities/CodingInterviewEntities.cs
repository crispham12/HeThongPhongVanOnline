using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InterviewPro.API.Entities
{
    [Table("CodingInterviewSessions")]
    public class CodingInterviewSession
    {
        [Key]
        public int Id { get; set; }
        public string SessionGuid { get; set; } = Guid.NewGuid().ToString();
        public int UserId { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string TechStack { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string Status { get; set; } = "InProgress"; // InProgress | Completed
        
        public int CurrentProblemIndex { get; set; } = 1; // 1 | 2
        public string CurrentStage { get; set; } = "ProblemUnderstanding"; // ProblemUnderstanding | SolutionDesign | Implementation | Testing | Optimization
        
        // Normalized Scores for BI Dashboards & Analytics
        public float OverallScore { get; set; }
        public float AvgProblemUnderstandingScore { get; set; }
        public float AvgAlgorithmDesignScore { get; set; }
        public float AvgCorrectnessScore { get; set; }
        public float AvgQualityScore { get; set; }
        public float AvgComplexityScore { get; set; }
        public float AvgTestingScore { get; set; }
        public float AvgCommunicationScore { get; set; }
        
        public string? FinalReportJson { get; set; }
        public string? InterviewMemorySummary { get; set; } // Cross-problem performance features
        
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        public User? User { get; set; }
        public List<CodingInterviewProblem> Problems { get; set; } = new();
    }

    [Table("CodingInterviewProblems")]
    public class CodingInterviewProblem
    {
        [Key]
        public int Id { get; set; }
        public int SessionId { get; set; }
        public int ProblemIndex { get; set; } // 1 | 2
        public Guid? CodingProblemId { get; set; }
        
        public string Source { get; set; } = "Internal"; // Internal | LeetCode | AIGenerated
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Difficulty { get; set; } = "Medium";
        
        public int PassedTestCases { get; set; }
        public int TotalTestCases { get; set; }
        public int ExecutionTimeMs { get; set; }
        public float MemoryUsageMb { get; set; }
        
        // Normalized Dimension Scores
        public float ProblemUnderstandingScore { get; set; }
        public float AlgorithmDesignScore { get; set; }
        public float CorrectnessScore { get; set; }
        public float QualityScore { get; set; }
        public float ComplexityScore { get; set; }
        public float TestingScore { get; set; }
        public float CommunicationScore { get; set; }
        
        public string? SubmittedCode { get; set; }
        public string? StaticAnalysisResultJson { get; set; }
        public string? AIReviewFeedbackJson { get; set; }
        
        public CodingInterviewSession? Session { get; set; }
        public List<CodingInterviewStageLog> StageLogs { get; set; } = new();
    }

    [Table("CodingInterviewStageLogs")]
    public class CodingInterviewStageLog
    {
        [Key]
        public int Id { get; set; }
        public int ProblemId { get; set; }
        public string Stage { get; set; } = string.Empty;
        public string CandidateInput { get; set; } = string.Empty;
        public string AiResponse { get; set; } = string.Empty;
        public string? EvaluationJson { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public CodingInterviewProblem? Problem { get; set; }
    }
}
