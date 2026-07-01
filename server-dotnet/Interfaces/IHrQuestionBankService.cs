using System.Collections.Generic;
using System.Threading.Tasks;
using InterviewPro.API.Entities;

namespace InterviewPro.API.Interfaces
{
    public interface IHrQuestionBankService
    {
        Task<List<HrInterviewQuestion>> GenerateSessionQuestionsAsync(int sessionId, string role, string level, string questionMode);
        Task SeedDefaultQuestionsAsync();
    }
}
