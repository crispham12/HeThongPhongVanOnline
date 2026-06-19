using System;
using System.Threading.Tasks;
using InterviewPro.API.DTOs;

namespace InterviewPro.API.Interfaces
{
    public interface IAdminCodingProblemService
    {
        Task<PagedResult<CodingProblemListItemDto>> GetProblemsAsync(
            string? difficulty,
            string? category,
            string? recommendedLevel,
            string? status,
            string? search,
            int page,
            int pageSize);

        Task<CodingProblemDetailDto?> GetByIdAsync(Guid id);

        Task<CodingProblemDetailDto> CreateAsync(CreateCodingProblemRequest request, Guid adminId, string adminName);

        Task<CodingProblemDetailDto?> UpdateAsync(Guid id, UpdateCodingProblemRequest request);

        Task<bool> DeleteAsync(Guid id);

        Task<CodingProblemDetailDto?> PublishAsync(Guid id);

        Task<CodingProblemDetailDto?> DraftAsync(Guid id);
    }
}
