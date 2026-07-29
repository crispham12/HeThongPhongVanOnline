using System;
using System.Collections.Generic;

namespace InterviewPro.API.DTOs
{
    public class StartCodingInterviewRequest
    {
        public string Role { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string TechStack { get; set; } = string.Empty;
        public string Language { get; set; } = "Python";
    }

    public class CodingInterviewSessionResponse
    {
        public string SessionId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int CurrentProblemIndex { get; set; }
        public string CurrentStage { get; set; } = string.Empty;
        public List<CodingInterviewProblemDto> Problems { get; set; } = new();
    }

    public class CodingInterviewProblemDto
    {
        public int ProblemIndex { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string ExpectedTimeComplexity { get; set; } = string.Empty;
        public string ExpectedSpaceComplexity { get; set; } = string.Empty;
        public List<CodingExampleDto> Examples { get; set; } = new();
        public List<CodingTestCaseDto> PublicTestCases { get; set; } = new();
        public string StarterCode { get; set; } = string.Empty;
        public string? SubmittedCode { get; set; }
        public int PassedTestCases { get; set; }
        public int TotalTestCases { get; set; }
        public string Status { get; set; } = "NotStarted"; // InProgress | Completed
    }

    public class SubmitStageInputRequest
    {
        public string Input { get; set; } = string.Empty; // Chat/Algorithm explanation/Written tests
    }

    public class SubmitStageInputResponse
    {
        public string AiResponse { get; set; } = string.Empty;
        public string NextStage { get; set; } = string.Empty;
        public string? StageEvaluationJson { get; set; }
    }

    public class CodingSandboxRunRequest
    {
        public string Code { get; set; } = string.Empty;
    }

    public class CodingSandboxRunResponse
    {
        public string Status { get; set; } = string.Empty; // Accepted | WrongAnswer | RuntimeError | CompileError | Timeout
        public int PassedTestCases { get; set; }
        public int TotalTestCases { get; set; }
        public int RuntimeMs { get; set; }
        public float MemoryUsageMb { get; set; }
        public List<TestCaseResultDto> TestResults { get; set; } = new();
    }
}
