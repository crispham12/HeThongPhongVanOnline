using System.Threading.Tasks;
using InterviewPro.API.DTOs;

namespace InterviewPro.API.Interfaces
{
    public interface ICodingInterviewService
    {
        Task<CodingInterviewSessionResponse> StartInterviewAsync(int userId, StartCodingInterviewRequest request);
        Task<CodingInterviewSessionResponse> GetSessionAsync(int userId, string sessionId);
        Task<SubmitStageInputResponse> SubmitStageInputAsync(int userId, string sessionId, SubmitStageInputRequest request);
        Task<CodingSandboxRunResponse> RunSandboxCodeAsync(int userId, string sessionId, CodingSandboxRunRequest request);
        Task<CodingSandboxRunResponse> SubmitSandboxCodeAsync(int userId, string sessionId, CodingSandboxRunRequest request);
        Task<string> GetFinalReportAsync(int userId, string sessionId);
    }
}
