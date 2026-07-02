using System.Threading.Tasks;
using InterviewPro.API.DTOs.InterviewCompare;

namespace InterviewPro.API.Interfaces
{
    public interface IInterviewCompareService
    {
        Task<CompareInterviewResponseDto> CompareAsync(CompareInterviewRequestDto request, int currentUserId, bool isAdmin);
    }
}
