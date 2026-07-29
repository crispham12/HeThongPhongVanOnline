using InterviewPro.API.DTOs;
using System.Threading.Tasks;

namespace InterviewPro.API.Interfaces
{
    public interface IPaymentService
    {
        Task<CreateOrderResponse> CreateOrderAsync(int userId, string planType);
        Task<OrderStatusResponse> GetOrderStatusAsync(int userId, string orderCode);
        Task ProcessSePayWebhookAsync(SePayWebhookRequest request);
    }
}
