using System;
using System.Collections.Generic;

namespace InterviewPro.API.DTOs
{
    public class CandidateReportResponse
    {
        public string SessionGuid { get; set; } = string.Empty;
        public string CandidateName { get; set; } = string.Empty;
        public string TargetRole { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        
        public float OverallScore { get; set; }
        public string HiringRecommendation { get; set; } = string.Empty;
        public float ConfidenceScore { get; set; }
        public string AiAssessmentSummary { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public HRReportDto? HrReport { get; set; }
        public TechnicalReportDto? TechnicalReport { get; set; }
        public CodingReportDto? CodingReport { get; set; }
        public CompetencyProfileDto? CompetencyProfile { get; set; }
        public List<LearningRoadmapItemDto> LearningRoadmap { get; set; } = new();
    }

    public class HRReportDto
    {
        public float OverallHrScore { get; set; }
        public float Communication { get; set; }
        public float Motivation { get; set; }
        public float ProblemSolvingMindset { get; set; }
        public float Teamwork { get; set; }
        public float Adaptability { get; set; }
        public float Professionalism { get; set; }
        public float SelfAwareness { get; set; }
        
        public List<string> Strengths { get; set; } = new();
        public List<string> AreasForImprovement { get; set; } = new();
        public string AiSummary { get; set; } = string.Empty;
        public string HrRecommendation { get; set; } = string.Empty;
    }

    public class TechnicalReportDto
    {
        public float OverallTechnicalScore { get; set; }
        public float TechnicalKnowledge { get; set; }
        public float ProblemSolving { get; set; }
        public float PracticalExperience { get; set; }
        public float SystemThinking { get; set; }
        public float Communication { get; set; }
        public float BestPractices { get; set; }
        
        public List<string> Strengths { get; set; } = new();
        public List<string> Weaknesses { get; set; } = new();
        public string AiSummary { get; set; } = string.Empty;
        public string TechnicalRecommendation { get; set; } = string.Empty;
    }

    public class CodingReportDto
    {
        public float OverallCodingScore { get; set; }
        public float ProblemUnderstanding { get; set; }
        public float AlgorithmDesign { get; set; }
        public float CodeCorrectness { get; set; }
        public float CodeQuality { get; set; }
        public float ComplexityAnalysis { get; set; }
        public float TestingValidation { get; set; }
        public float Communication { get; set; }
        
        public List<string> Strengths { get; set; } = new();
        public List<string> Weaknesses { get; set; } = new();
        public List<string> LearningRoadmap { get; set; } = new();
        public string CodingRecommendation { get; set; } = string.Empty;
    }

    public class CompetencyProfileDto
    {
        public float Communication { get; set; }
        public float ProblemSolving { get; set; }
        public float TechnicalKnowledge { get; set; }
        public float CodingAbility { get; set; }
        public float SystemThinking { get; set; }
        public float Professionalism { get; set; }
        public float Teamwork { get; set; }
        public float LearningAbility { get; set; }
    }

    public class LearningRoadmapItemDto
    {
        public string Topic { get; set; } = string.Empty;
        public string Resource { get; set; } = string.Empty;
    }
}
