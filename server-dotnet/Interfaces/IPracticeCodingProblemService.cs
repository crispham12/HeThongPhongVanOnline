using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using InterviewPro.API.DTOs;

namespace InterviewPro.API.Interfaces
{
    public interface IPracticeCodingProblemService
    {
        Task<PagedResult<CodingProblemListItemDto>> GetPracticeProblemsAsync(
            int userId,
            string? difficulty,
            string? category,
            string? recommendedLevel,
            string? search,
            int page,
            int pageSize);

        Task<CodingProblemDetailDto?> GetByIdAsync(Guid id, int userId);

        Task<CodingProblemDetailDto?> GetRandomCodingProblemAsync(string? difficulty, string? recommendedLevel);

        Task<SubmitCodeResult> RunCodeAsync(Guid id, int userId, SubmitCodeRequest request);

        Task<SubmitCodeResult> SubmitAnswerAsync(Guid id, int userId, SubmitCodeRequest request);

        Task<List<CodingPracticeAttemptDto>> GetPracticeHistoryAsync(int userId);

        Task<List<CodingPracticeAttemptDto>> GetProblemHistoryAsync(Guid id, int userId);

        Task<CodingProgressDto> GetPracticeProgressAsync(int userId);
    }
}
