using System.Threading.Tasks;
using InterviewPro.API.DTOs.InterviewHistory;

namespace InterviewPro.API.Interfaces
{
    public interface IInterviewHistoryService
    {
        Task<InterviewHistoryResponseDto> GetHistoryAsync(int userId, InterviewHistoryQueryDto query, bool isAdmin);
        Task<ArchiveInterviewResponseDto> ArchiveAsync(string sessionId, int currentUserId, bool isAdmin);
        Task<RestoreInterviewResponseDto> RestoreAsync(string sessionId, int currentUserId, bool isAdmin);
    }
}
