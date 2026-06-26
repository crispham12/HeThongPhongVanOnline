using System;

namespace InterviewPro.API.DTOs
{
    public class CreditPackageDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Credits { get; set; }
    }

    public class CreatePaymentRequest
    {
        public Guid PackageId { get; set; }
    }

    public class CreatePaymentResponse
    {
        public Guid TransactionId { get; set; }
        public string PaymentCode { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int Credits { get; set; }
        public string BankAccountNumber { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string TransferContent { get; set; } = string.Empty;
        public string QrCodeUrl { get; set; } = string.Empty;
        public DateTime ExpiredAt { get; set; }
    }

    public class PaymentTransactionDto
    {
        public Guid TransactionId { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int Credits { get; set; }
        public string PaymentCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime ExpiredAt { get; set; }
    }

    public class CreditWalletDto
    {
        public int FreeCredits { get; set; }
        public int PaidCredits { get; set; }
        public int TotalCredits { get; set; }
        public int TotalCreditsUsed { get; set; }
    }

    public class CreditHistoryDto
    {
        public Guid Id { get; set; }
        public int ChangeAmount { get; set; }
        public int BalanceAfter { get; set; }
        public string Type { get; set; } = string.Empty;
        public Guid? ReferenceId { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class SePayWebhookRequest
    {
        public string Id { get; set; } = string.Empty; // Transaction ID from SePay
        public string GatewayId { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public string AccountNumber { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty; // SePay's code
        public string Content { get; set; } = string.Empty; // Transfer content (contains payment code)
        public decimal TransferAmount { get; set; } // Amount received
        public string TransferType { get; set; } = string.Empty; // in / out
        public string BankCode { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty;
    }

    public class AdminPaymentOverviewDto
    {
        public decimal TotalRevenue { get; set; }
        public int SuccessfulTransactions { get; set; }
        public int PendingTransactions { get; set; }
        public int FailedTransactions { get; set; }
        public int TotalCreditsSold { get; set; }
    }
}
