using System;
using System.ComponentModel.DataAnnotations;

namespace InterviewPro.API.Entities
{
    public class CreditPackage
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(256)]
        public string Name { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int Credits { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }

    public class CreditWallet
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public int UserId { get; set; }
        public User? User { get; set; }

        public int FreeCredits { get; set; } = 3;

        public int PaidCredits { get; set; } = 0;

        public int TotalCreditsUsed { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }

    public class CreditPaymentTransaction
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public int UserId { get; set; }
        public User? User { get; set; }

        public Guid PackageId { get; set; }
        public CreditPackage? Package { get; set; }

        public decimal Amount { get; set; }

        public int Credits { get; set; }

        [Required]
        [MaxLength(100)]
        public string PaymentCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = "SePay";

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Success, Failed, Expired

        public string? SePayTransactionId { get; set; }

        public string? BankCode { get; set; }

        public string? BankAccountNumber { get; set; }

        public string? TransferContent { get; set; }

        public DateTime? PaidAt { get; set; }

        public DateTime ExpiredAt { get; set; } = DateTime.UtcNow.AddMinutes(15);

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }


    public class CreditHistory
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public int UserId { get; set; }
        public User? User { get; set; }

        public int ChangeAmount { get; set; }

        public int BalanceAfter { get; set; }

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // FreeInitial, Purchase, Use, Refund, AdminAdjust

        public Guid? ReferenceId { get; set; }

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
