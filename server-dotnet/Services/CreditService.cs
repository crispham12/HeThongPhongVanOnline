using System;
using System.Threading.Tasks;
using InterviewPro.API.Data;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InterviewPro.API.Services
{
    public class NotEnoughCreditsException : Exception
    {
        public NotEnoughCreditsException() : base("Bạn đã hết lượt luyện tập. Vui lòng mua thêm lượt để tiếp tục.") { }
    }

    public class CreditService : ICreditService
    {
        private readonly AppDbContext _context;

        public CreditService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CreditWallet> GetWalletAsync(int userId)
        {
            return await EnsureWalletExistsAsync(userId);
        }

        public async Task<CreditWallet> EnsureWalletExistsAsync(int userId)
        {
            var wallet = await _context.CreditWallets
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null)
            {
                wallet = new CreditWallet
                {
                    UserId = userId,
                    FreeCredits = 3,
                    PaidCredits = 0,
                    TotalCreditsUsed = 0,
                    CreatedAt = DateTime.UtcNow
                };

                _context.CreditWallets.Add(wallet);
                await _context.SaveChangesAsync();

                // Record history for free credits
                var history = new CreditHistory
                {
                    UserId = userId,
                    ChangeAmount = 3,
                    BalanceAfter = 3,
                    Type = "FreeInitial",
                    Description = "Nhận 3 lượt phỏng vấn miễn phí ban đầu",
                    CreatedAt = DateTime.UtcNow
                };
                _context.CreditHistories.Add(history);
                await _context.SaveChangesAsync();
            }

            return wallet;
        }

        public async Task<bool> UseCreditAsync(int userId, string feature, Guid? referenceId = null)
        {
            // Execute in transaction to ensure atomicity
            using var dbTransaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var wallet = await EnsureWalletExistsAsync(userId);

                int change = -1;
                if (wallet.FreeCredits > 0)
                {
                    wallet.FreeCredits -= 1;
                }
                else if (wallet.PaidCredits > 0)
                {
                    wallet.PaidCredits -= 1;
                }
                else
                {
                    throw new NotEnoughCreditsException();
                }

                wallet.TotalCreditsUsed += 1;
                wallet.UpdatedAt = DateTime.UtcNow;

                var totalBalance = wallet.FreeCredits + wallet.PaidCredits;

                var history = new CreditHistory
                {
                    UserId = userId,
                    ChangeAmount = change,
                    BalanceAfter = totalBalance,
                    Type = "Use",
                    ReferenceId = referenceId,
                    Description = $"Sử dụng 1 lượt cho chức năng: {feature}",
                    CreatedAt = DateTime.UtcNow
                };

                _context.CreditHistories.Add(history);
                await _context.SaveChangesAsync();
                await dbTransaction.CommitAsync();

                return true;
            }
            catch (Exception)
            {
                await dbTransaction.RollbackAsync();
                throw;
            }
        }

        public async Task AddCreditsAsync(int userId, int amount, string type, Guid? referenceId = null, string description = "")
        {
            var wallet = await EnsureWalletExistsAsync(userId);

            wallet.PaidCredits += amount;
            wallet.UpdatedAt = DateTime.UtcNow;

            var totalBalance = wallet.FreeCredits + wallet.PaidCredits;

            var history = new CreditHistory
            {
                UserId = userId,
                ChangeAmount = amount,
                BalanceAfter = totalBalance,
                Type = type,
                ReferenceId = referenceId,
                Description = string.IsNullOrEmpty(description) ? $"Nạp {amount} lượt" : description,
                CreatedAt = DateTime.UtcNow
            };

            _context.CreditHistories.Add(history);
            await _context.SaveChangesAsync();
        }
    }
}
