using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InterviewPro.API.Interfaces;

namespace InterviewPro.API.Services
{
    public class CodingQuestionSelectionEngine : ICodingQuestionSelectionEngine
    {
        private readonly IEnumerable<ICodingQuestionProvider> _providers;

        public CodingQuestionSelectionEngine(IEnumerable<ICodingQuestionProvider> providers)
        {
            _providers = providers;
        }

        private string GetBaseDifficulty(string level, int problemIndex)
        {
            string lvl = level.ToLower().Trim();
            if (problemIndex == 1)
            {
                if (lvl.Contains("intern")) return "Easy";
                if (lvl.Contains("junior")) return "Easy";
                if (lvl.Contains("senior")) return "Medium";
                if (lvl.Contains("lead")) return "Hard";
                return "Medium"; // Middle / Fresher default
            }
            else
            {
                if (lvl.Contains("intern")) return "Easy";
                if (lvl.Contains("junior")) return "Medium";
                if (lvl.Contains("senior")) return "Hard";
                if (lvl.Contains("lead")) return "Hard";
                return "Medium"; // Middle / Fresher default
            }
        }

        private string AdjustDifficulty(string currentDiff, float score)
        {
            if (score >= 8.0f) // Excellent performance
            {
                if (currentDiff == "Easy") return "Medium";
                if (currentDiff == "Medium") return "Hard";
            }
            else if (score <= 5.0f) // Weak performance
            {
                if (currentDiff == "Hard") return "Medium";
                if (currentDiff == "Medium") return "Easy";
            }
            return currentDiff;
        }

        public async Task<StandardizedQuestionModel> GetNextQuestionAsync(
            string role, 
            string level, 
            string techStack, 
            string language, 
            int problemIndex, 
            float? previousProblemScore)
        {
            string targetDiff = GetBaseDifficulty(level, problemIndex);
            if (problemIndex == 2 && previousProblemScore.HasValue)
            {
                targetDiff = AdjustDifficulty(targetDiff, previousProblemScore.Value);
            }

            var criteria = new QuestionSelectionCriteria
            {
                Role = role,
                Level = level,
                TechStack = techStack,
                Language = language,
                TargetDifficulty = targetDiff
            };

            // Query Internal Provider first, then fallback to others
            var internalProvider = _providers.FirstOrDefault(p => p.SourceName == "Internal");
            if (internalProvider != null)
            {
                var q = await internalProvider.SelectQuestionAsync(criteria);
                if (q != null) return q;
            }

            foreach (var provider in _providers.Where(p => p.SourceName != "Internal"))
            {
                var q = await provider.SelectQuestionAsync(criteria);
                if (q != null) return q;
            }

            throw new Exception("Không thể tìm thấy bài toán mã hóa phù hợp cho tiêu chí này.");
        }
    }
}
