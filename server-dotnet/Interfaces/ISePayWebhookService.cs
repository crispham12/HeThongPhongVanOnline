using System.Threading.Tasks;
using InterviewPro.API.DTOs;

namespace InterviewPro.API.Interfaces
{
    public interface ISePayWebhookService
    {
        Task<bool> HandleWebhookAsync(SePayWebhookRequest request);
    }
}
