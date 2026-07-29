using System.Threading.Tasks;
using InterviewPro.API.DTOs;

namespace InterviewPro.API.Interfaces
{
    public interface ITechnicalInterviewService
    {
        Task<TechnicalInterviewSessionResponse> StartInterviewAsync(int userId, StartTechnicalInterviewRequest request);
        Task<TechnicalInterviewSessionResponse> GetSessionAsync(int userId, string sessionId);
        Task<TechnicalQuestionDto> SubmitAnswerAsync(int userId, string sessionId, SubmitTechnicalAnswerRequest request);
        Task<AiFinalEvaluationResponse> GetResultAsync(int userId, string sessionId);
    }
}
