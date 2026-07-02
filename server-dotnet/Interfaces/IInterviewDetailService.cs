using System.Threading.Tasks;
using InterviewPro.API.DTOs.InterviewDetail;

namespace InterviewPro.API.Interfaces
{
    public interface IInterviewDetailService
    {
        Task<InterviewDetailResponseDto> GetInterviewDetailAsync(string sessionId, int userId, bool isAdmin);
    }
}
