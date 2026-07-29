using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using InterviewPro.API.DTOs;

namespace InterviewPro.API.Interfaces
{
    public class StandardizedQuestionModel
    {
        public Guid? CodingProblemId { get; set; }
        public string Source { get; set; } = "Internal";
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Difficulty { get; set; } = "Medium";
        public string ExpectedTimeComplexity { get; set; } = "O(N)";
        public string ExpectedSpaceComplexity { get; set; } = "O(1)";
        public string PublicTestCasesJson { get; set; } = "[]";
        public string HiddenTestCasesJson { get; set; } = "[]";
        public string StarterCodeJson { get; set; } = "{}"; // {"Python": "...", "Java": "..."}
        public string ExamplesJson { get; set; } = "[]";
    }

    public class QuestionSelectionCriteria
    {
        public string Role { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string TechStack { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string TargetDifficulty { get; set; } = "Medium";
        public List<string> ExcludedTitles { get; set; } = new();
    }

    public interface ICodingQuestionProvider
    {
        string SourceName { get; }
        Task<StandardizedQuestionModel?> SelectQuestionAsync(QuestionSelectionCriteria criteria);
    }

    public interface ICodingQuestionSelectionEngine
    {
        Task<StandardizedQuestionModel> GetNextQuestionAsync(
            string role, 
            string level, 
            string techStack, 
            string language, 
            int problemIndex, 
            float? previousProblemScore);
    }
}
