using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;

namespace InterviewPro.API.Interfaces
{
    public interface IPaymentService
    {
        Task<IEnumerable<CreditPackageDto>> GetActivePackagesAsync();
        Task<CreatePaymentResponse> CreateTransactionAsync(int userId, Guid packageId);
        Task<PaymentTransactionDto> GetTransactionByIdAsync(int userId, Guid transactionId);
        Task<(IEnumerable<CreditHistoryDto> items, int totalItems)> GetHistoryAsync(int userId, int page, int limit);
    }
}
