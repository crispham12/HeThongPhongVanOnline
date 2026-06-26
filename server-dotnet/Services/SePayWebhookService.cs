using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InterviewPro.API.Services
{
    public class SePayWebhookService : ISePayWebhookService
    {
        private readonly AppDbContext _context;
        private readonly ICreditService _creditService;
        private readonly ILogger<SePayWebhookService> _logger;

        public SePayWebhookService(
            AppDbContext context, 
            ICreditService creditService,
            ILogger<SePayWebhookService> logger)
        {
            _context = context;
            _creditService = creditService;
            _logger = logger;
        }

        public async Task<bool> HandleWebhookAsync(SePayWebhookRequest request)
        {
            _logger.LogInformation("Nhận webhook SePay. Mã GD: {Id}, Nội dung: {Content}, Số tiền: {TransferAmount}", 
                request.Id, request.Content, request.TransferAmount);

            // 1. Extract PaymentCode (e.g. IPAI123456) using Regex from content
            var match = Regex.Match(request.Content, @"IPAI\d+", RegexOptions.IgnoreCase);
            if (!match.Success)
            {
                _logger.LogWarning("Nội dung chuyển khoản '{Content}' không chứa mã PaymentCode hợp lệ.", request.Content);
                return false; // Return false but controller will return 200 to prevent infinite retry
            }

            var paymentCode = match.Value.ToUpper();

            // 2. Open DB Transaction to ensure ACID & Idempotency
            using var dbTransaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Check if the SePayTransactionId already exists (idempotency safety check)
                if (!string.IsNullOrEmpty(request.Id))
                {
                    var duplicateTx = await _context.CreditPaymentTransactions
                        .AnyAsync(t => t.SePayTransactionId == request.Id && t.Status == "Success");

                    if (duplicateTx)
                    {
                        _logger.LogWarning("Giao dịch SePay {Id} đã được xử lý thành công trước đó (Idempotent).", request.Id);
                        await dbTransaction.CommitAsync();
                        return true;
                    }
                }

                // Find transaction by PaymentCode
                var transaction = await _context.CreditPaymentTransactions
                    .Include(t => t.Package)
                    .FirstOrDefaultAsync(t => t.PaymentCode == paymentCode);

                if (transaction == null)
                {
                    _logger.LogWarning("Không tìm thấy PaymentTransaction tương ứng với PaymentCode: {PaymentCode}", paymentCode);
                    await dbTransaction.CommitAsync();
                    return false;
                }

                // If already success, return true immediately
                if (transaction.Status == "Success")
                {
                    _logger.LogInformation("Giao dịch {PaymentCode} đã có trạng thái Success trước đó.", paymentCode);
                    await dbTransaction.CommitAsync();
                    return true;
                }

                // Check expired status
                if (DateTime.UtcNow > transaction.ExpiredAt)
                {
                    _logger.LogWarning("Giao dịch {PaymentCode} đã hết hạn vào lúc {ExpiredAt}.", paymentCode, transaction.ExpiredAt);
                    transaction.Status = "Expired";
                    transaction.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    await dbTransaction.CommitAsync();
                    return false;
                }

                // Check amount
                if (request.TransferAmount != transaction.Amount)
                {
                    _logger.LogWarning("Số tiền thanh toán của giao dịch {PaymentCode} không khớp. Yêu cầu: {Expected}, Nhận được: {Received}", 
                        paymentCode, transaction.Amount, request.TransferAmount);
                    
                    transaction.Status = "Failed";
                    transaction.SePayTransactionId = request.Id;
                    transaction.BankCode = request.BankCode;
                    transaction.BankAccountNumber = request.AccountNumber;
                    transaction.TransferContent = request.Content;
                    transaction.UpdatedAt = DateTime.UtcNow;
                    
                    await _context.SaveChangesAsync();
                    await dbTransaction.CommitAsync();
                    return false;
                }

                // 3. Mark transaction as Success
                transaction.Status = "Success";
                transaction.PaidAt = request.TransactionDate == default ? DateTime.UtcNow : request.TransactionDate;
                transaction.SePayTransactionId = request.Id;
                transaction.BankCode = request.BankCode;
                transaction.BankAccountNumber = request.AccountNumber;
                transaction.TransferContent = request.Content;
                transaction.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // 4. Increment User Credits
                await _creditService.AddCreditsAsync(
                    userId: transaction.UserId,
                    amount: transaction.Credits,
                    type: "Purchase",
                    referenceId: transaction.Id,
                    description: $"Mua {transaction.Credits} lượt luyện tập (Gói: {transaction.Package?.Name ?? "Lẻ"}) qua SePay"
                );

                await dbTransaction.CommitAsync();
                _logger.LogInformation("Xử lý webhook thành công! Đã cộng {Credits} lượt cho User {UserId}.", transaction.Credits, transaction.UserId);
                
                return true;
            }
            catch (Exception ex)
            {
                await dbTransaction.RollbackAsync();
                _logger.LogError(ex, "Lỗi xảy ra khi xử lý webhook thanh toán SePay cho mã: {PaymentCode}", paymentCode);
                throw;
            }
        }
    }
}
