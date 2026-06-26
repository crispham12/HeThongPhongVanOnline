using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace InterviewPro.API.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public PaymentService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<IEnumerable<CreditPackageDto>> GetActivePackagesAsync()
        {
            return await _context.CreditPackages
                .Where(p => p.IsActive)
                .OrderBy(p => p.Price)
                .Select(p => new CreditPackageDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    Credits = p.Credits
                })
                .ToListAsync();
        }

        public async Task<CreatePaymentResponse> CreateTransactionAsync(int userId, Guid packageId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new ArgumentException("Không tìm thấy người dùng.");

            var package = await _context.CreditPackages.FindAsync(packageId);
            if (package == null || !package.IsActive)
            {
                throw new ArgumentException("Gói lượt tập không tồn tại hoặc đã bị ẩn.");
            }

            // Generate unique payment code: IPAI + random digits + timestamp segment to guarantee uniqueness
            var random = new Random();
            var paymentCode = $"IPAI{random.Next(100, 999)}{DateTime.UtcNow:MMddHHmmss}";

            var transaction = new CreditPaymentTransaction
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                PackageId = packageId,
                Amount = package.Price,
                Credits = package.Credits,
                PaymentCode = paymentCode,
                PaymentMethod = "SePay",
                Status = "Pending",
                ExpiredAt = DateTime.UtcNow.AddMinutes(15),
                CreatedAt = DateTime.UtcNow
            };

            _context.CreditPaymentTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            var bankAccountNumber = _configuration["SePay:BankAccountNumber"] ?? "190366889999";
            var bankName = _configuration["SePay:BankName"] ?? "Techcombank";
            
            // Build SePay Quick QR Code link
            var qrCodeUrl = $"https://qr.sepay.vn/img?acc={bankAccountNumber}&bank={bankName}&amount={package.Price:F0}&des={paymentCode}";

            return new CreatePaymentResponse
            {
                TransactionId = transaction.Id,
                PaymentCode = paymentCode,
                Amount = package.Price,
                Credits = package.Credits,
                BankAccountNumber = bankAccountNumber,
                BankName = bankName,
                TransferContent = paymentCode,
                QrCodeUrl = qrCodeUrl,
                ExpiredAt = transaction.ExpiredAt
            };
        }

        public async Task<PaymentTransactionDto> GetTransactionByIdAsync(int userId, Guid transactionId)
        {
            var tx = await _context.CreditPaymentTransactions
                .FirstOrDefaultAsync(t => t.Id == transactionId && t.UserId == userId);

            if (tx == null) throw new KeyNotFoundException("Không tìm thấy giao dịch hoặc bạn không có quyền truy cập.");

            return new PaymentTransactionDto
            {
                TransactionId = tx.Id,
                Status = tx.Status,
                Amount = tx.Amount,
                Credits = tx.Credits,
                PaymentCode = tx.PaymentCode,
                CreatedAt = tx.CreatedAt,
                PaidAt = tx.PaidAt,
                ExpiredAt = tx.ExpiredAt
            };
        }

        public async Task<(IEnumerable<CreditHistoryDto> items, int totalItems)> GetHistoryAsync(int userId, int page, int limit)
        {
            var query = _context.CreditHistories
                .Where(h => h.UserId == userId)
                .OrderByDescending(h => h.CreatedAt);

            var totalItems = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(h => new CreditHistoryDto
                {
                    Id = h.Id,
                    ChangeAmount = h.ChangeAmount,
                    BalanceAfter = h.BalanceAfter,
                    Type = h.Type,
                    ReferenceId = h.ReferenceId,
                    Description = h.Description,
                    CreatedAt = h.CreatedAt
                })
                .ToListAsync();

            return (items, totalItems);
        }
    }
}
