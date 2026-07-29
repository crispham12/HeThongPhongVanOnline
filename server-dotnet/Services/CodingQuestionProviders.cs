using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InterviewPro.API.Data;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InterviewPro.API.Services
{
    public class InternalQuestionProvider : ICodingQuestionProvider
    {
        private readonly AppDbContext _db;
        public string SourceName => "Internal";

        public InternalQuestionProvider(AppDbContext db)
        {
            _db = db;
        }

        public async Task<StandardizedQuestionModel?> SelectQuestionAsync(QuestionSelectionCriteria criteria)
        {
            var problems = await _db.CodingProblems
                .Where(p => p.Status == "Published" && p.Difficulty == criteria.TargetDifficulty)
                .ToListAsync();

            var filtered = problems
                .Where(p => !criteria.ExcludedTitles.Contains(p.Title, StringComparer.OrdinalIgnoreCase))
                .ToList();

            if (!filtered.Any()) return null;

            var rand = new Random();
            var p = filtered[rand.Next(filtered.Count)];

            return new StandardizedQuestionModel
            {
                CodingProblemId = p.Id,
                Source = "Internal",
                Title = p.Title,
                Description = p.Description,
                Difficulty = p.Difficulty,
                ExpectedTimeComplexity = "O(N)",
                ExpectedSpaceComplexity = "O(1)",
                PublicTestCasesJson = p.PublicTestCasesJson,
                HiddenTestCasesJson = p.HiddenTestCasesJson,
                StarterCodeJson = p.StarterCodeJson,
                ExamplesJson = p.ExamplesJson
            };
        }
    }

    public class LeetCodeProvider : ICodingQuestionProvider
    {
        public string SourceName => "LeetCode";

        public Task<StandardizedQuestionModel?> SelectQuestionAsync(QuestionSelectionCriteria criteria)
        {
            // Standard fallback mock representing Leetcode collection
            var title = criteria.TargetDifficulty == "Easy" ? "Two Sum" : (criteria.TargetDifficulty == "Medium" ? "Add Two Numbers" : "Median of Two Sorted Arrays");
            var desc = criteria.TargetDifficulty == "Easy" 
                ? "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
                : "Given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order.";

            var model = new StandardizedQuestionModel
            {
                Source = "LeetCode",
                Title = title,
                Description = desc,
                Difficulty = criteria.TargetDifficulty,
                ExpectedTimeComplexity = "O(N)",
                ExpectedSpaceComplexity = "O(N)",
                PublicTestCasesJson = "[]",
                HiddenTestCasesJson = "[]",
                StarterCodeJson = "{}",
                ExamplesJson = "[]"
            };
            return Task.FromResult<StandardizedQuestionModel?>(model);
        }
    }

    public class HackerRankProvider : ICodingQuestionProvider
    {
        public string SourceName => "HackerRank";
        public Task<StandardizedQuestionModel?> SelectQuestionAsync(QuestionSelectionCriteria criteria) => 
            Task.FromResult<StandardizedQuestionModel?>(null);
    }

    public class CodeSignalProvider : ICodingQuestionProvider
    {
        public string SourceName => "CodeSignal";
        public Task<StandardizedQuestionModel?> SelectQuestionAsync(QuestionSelectionCriteria criteria) => 
            Task.FromResult<StandardizedQuestionModel?>(null);
    }

    public class CompanyQuestionProvider : ICodingQuestionProvider
    {
        public string SourceName => "Company";
        public Task<StandardizedQuestionModel?> SelectQuestionAsync(QuestionSelectionCriteria criteria) => 
            Task.FromResult<StandardizedQuestionModel?>(null);
    }

    public class AIGeneratedQuestionProvider : ICodingQuestionProvider
    {
        public string SourceName => "AIGenerated";
        public Task<StandardizedQuestionModel?> SelectQuestionAsync(QuestionSelectionCriteria criteria)
        {
            // AI generated dynamic question model stub
            var title = $"Dynamic AI {criteria.TargetDifficulty} Coding Question";
            var desc = $"Analyze and write a clean function solving a specialized problem for {criteria.Role} in {criteria.Language}.";
            
            var model = new StandardizedQuestionModel
            {
                Source = "AIGenerated",
                Title = title,
                Description = desc,
                Difficulty = criteria.TargetDifficulty,
                ExpectedTimeComplexity = "O(N)",
                ExpectedSpaceComplexity = "O(1)",
                PublicTestCasesJson = "[]",
                HiddenTestCasesJson = "[]",
                StarterCodeJson = "{}",
                ExamplesJson = "[]"
            };
            return Task.FromResult<StandardizedQuestionModel?>(model);
        }
    }
}
