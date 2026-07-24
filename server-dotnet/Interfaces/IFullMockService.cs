using System.Threading.Tasks;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;

namespace InterviewPro.API.Interfaces
{
    public interface IFullMockService
    {
        Task<CreateFullMockResponse> CreateSessionAsync(int userId, CreateFullMockRequest request);
        Task CompleteRoundAsync(int userId, string fullMockGuid, CompleteRoundRequest request);
        Task AbandonSessionAsync(int userId, string fullMockGuid);
        Task<FullMockReportResponse> GetReportAsync(int userId, string fullMockGuid);
        Task<FullMockSession?> GetActiveSessionAsync(int userId);
    }
}
