using System.Threading.Tasks;
using InterviewPro.API.DTOs;

namespace InterviewPro.API.Interfaces
{
    public interface ITechnicalAiClient
    {
        Task<AiGenerateQuestionResponse?> GenerateQuestionAsync(AiGenerateQuestionRequest request);
        Task<AiEvaluateAnswerResponse?> EvaluateAnswerAsync(AiEvaluateAnswerRequest request);
        Task<AiFinalEvaluationResponse?> FinalEvaluationAsync(AiFinalEvaluationRequest request);
    }
}
