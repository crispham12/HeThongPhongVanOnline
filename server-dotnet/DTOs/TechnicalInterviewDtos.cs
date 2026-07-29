using System;
using System.Collections.Generic;
using InterviewPro.API.Entities;

namespace InterviewPro.API.DTOs
{
    public class StartTechnicalInterviewRequest
    {
        public string Role { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string TechStack { get; set; } = string.Empty;
    }

    public class TechnicalInterviewSessionResponse
    {
        public string SessionId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public List<TechnicalQuestionDto> CompletedQuestions { get; set; } = new();
        public TechnicalQuestionDto? CurrentQuestion { get; set; }
    }

    public class TechnicalQuestionDto
    {
        public int QuestionIndex { get; set; }
        public string Stage { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? CandidateAnswer { get; set; }
    }

    public class SubmitTechnicalAnswerRequest
    {
        public string Answer { get; set; } = string.Empty;
        public int DurationSeconds { get; set; } = 0;
    }

    public class AiGenerateQuestionRequest
    {
        public string role { get; set; } = string.Empty;
        public string difficulty { get; set; } = string.Empty;
        public string tech_stack { get; set; } = string.Empty;
        public string stage { get; set; } = string.Empty;
        public int question_index { get; set; }
        public string context { get; set; } = string.Empty;
    }

    public class AiGenerateQuestionResponse
    {
        public string questionText { get; set; } = string.Empty;
        public string expectedAnswerGuide { get; set; } = string.Empty;
    }

    public class AiEvaluateAnswerRequest
    {
        public string role { get; set; } = string.Empty;
        public string difficulty { get; set; } = string.Empty;
        public string tech_stack { get; set; } = string.Empty;
        public string stage { get; set; } = string.Empty;
        public string question { get; set; } = string.Empty;
        public string answer { get; set; } = string.Empty;
    }

    public class AiScores
    {
        public float technicalKnowledge { get; set; }
        public float problemSolving { get; set; }
        public float practicalExperience { get; set; }
        public float systemDesign { get; set; }
        public float communication { get; set; }
        public float bestPractices { get; set; }
    }

    public class AiEvaluateAnswerResponse
    {
        public AiScores scores { get; set; } = new();
        public string feedback { get; set; } = string.Empty;
        public List<string> strengths { get; set; } = new();
        public List<string> weaknesses { get; set; } = new();
        public string improvedAnswer { get; set; } = string.Empty;
    }

    public class AiFinalEvaluationRequest
    {
        public string role { get; set; } = string.Empty;
        public string difficulty { get; set; } = string.Empty;
        public string transcript { get; set; } = string.Empty;
    }

    public class AiFinalStrength
    {
        public string title { get; set; } = string.Empty;
        public string description { get; set; } = string.Empty;
    }

    public class AiFinalWeakness
    {
        public string title { get; set; } = string.Empty;
        public string description { get; set; } = string.Empty;
    }

    public class AiFinalEvaluationResponse
    {
        public float overallScore { get; set; }
        public AiScores scores { get; set; } = new();
        public string summary { get; set; } = string.Empty;
        public List<AiFinalStrength> strengths { get; set; } = new();
        public List<AiFinalWeakness> weaknesses { get; set; } = new();
        public string recommendation { get; set; } = string.Empty;
        public string recommendationReason { get; set; } = string.Empty;
    }
}
