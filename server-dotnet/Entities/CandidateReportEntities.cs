using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InterviewPro.API.Entities
{
    [Table("CandidateReports")]
    public class CandidateReport
    {
        [Key]
        public int Id { get; set; }
        public string SessionGuid { get; set; } = Guid.NewGuid().ToString();
        public int UserId { get; set; }
        public string CandidateName { get; set; } = string.Empty;
        public string TargetRole { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        
        public float OverallScore { get; set; }
        public string HiringRecommendation { get; set; } = "Borderline"; // Strong Hire | Hire | Borderline | No Hire
        public float ConfidenceScore { get; set; } = 80.0f;
        public string AiAssessmentSummary { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
        public HRReport? HrReport { get; set; }
        public TechnicalReport? TechnicalReport { get; set; }
        public CodingReport? CodingReport { get; set; }
    }

    [Table("HRReports")]
    public class HRReport
    {
        [Key]
        public int Id { get; set; }
        public int CandidateReportId { get; set; }
        
        public float OverallHrScore { get; set; }
        public float CommunicationScore { get; set; }
        public float MotivationScore { get; set; }
        public float ProblemSolvingScore { get; set; }
        public float TeamworkScore { get; set; }
        public float AdaptabilityScore { get; set; }
        public float ProfessionalismScore { get; set; }
        public float SelfAwarenessScore { get; set; }
        
        public string StrengthsJson { get; set; } = "[]";
        public string ImprovementsJson { get; set; } = "[]";
        public string AiSummary { get; set; } = string.Empty;
        public string HrRecommendation { get; set; } = "Borderline";

        public CandidateReport? CandidateReport { get; set; }
    }

    [Table("TechnicalReports")]
    public class TechnicalReport
    {
        [Key]
        public int Id { get; set; }
        public int CandidateReportId { get; set; }
        
        public float OverallTechnicalScore { get; set; }
        public float TechnicalKnowledgeScore { get; set; }
        public float ProblemSolvingScore { get; set; }
        public float PracticalExperienceScore { get; set; }
        public float SystemThinkingScore { get; set; }
        public float CommunicationScore { get; set; }
        public float BestPracticesScore { get; set; }
        
        public string StrengthsJson { get; set; } = "[]";
        public string WeaknessesJson { get; set; } = "[]";
        public string AiSummary { get; set; } = string.Empty;
        public string TechnicalRecommendation { get; set; } = "Borderline";

        public CandidateReport? CandidateReport { get; set; }
    }

    [Table("CodingReports")]
    public class CodingReport
    {
        [Key]
        public int Id { get; set; }
        public int CandidateReportId { get; set; }
        
        public float OverallCodingScore { get; set; }
        public float ProblemUnderstandingScore { get; set; }
        public float AlgorithmDesignScore { get; set; }
        public float CodeCorrectnessScore { get; set; }
        public float CodeQualityScore { get; set; }
        public float ComplexityAnalysisScore { get; set; }
        public float TestingValidationScore { get; set; }
        public float CommunicationScore { get; set; }
        
        public string StrengthsJson { get; set; } = "[]";
        public string WeaknessesJson { get; set; } = "[]";
        public string LearningRoadmapJson { get; set; } = "[]";
        public string CodingRecommendation { get; set; } = "Borderline";

        public CandidateReport? CandidateReport { get; set; }
    }
}
