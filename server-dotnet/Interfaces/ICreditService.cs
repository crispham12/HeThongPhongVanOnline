using System;
using System.Threading.Tasks;
using InterviewPro.API.Entities;

namespace InterviewPro.API.Interfaces
{
    public interface ICreditService
    {
        Task<CreditWallet> GetWalletAsync(int userId);
        Task<CreditWallet> EnsureWalletExistsAsync(int userId);
        Task<bool> UseCreditAsync(int userId, string feature, Guid? referenceId = null);
        Task AddCreditsAsync(int userId, int amount, string type, Guid? referenceId = null, string description = "");
    }
}
