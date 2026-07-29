namespace InterviewPro.API.Entities
{
    public class PaymentOrder
    {
        public int Id { get; set; }
        public string OrderCode { get; set; } = string.Empty;    // IP-XXXXXX
        public int UserId { get; set; }
        public string PlanType { get; set; } = string.Empty;     // "Monthly" | "Yearly"
        public long Amount { get; set; }                          // 99000 | 1000000
        public string Status { get; set; } = "Pending";          // Pending | Completed | WrongAmount | Expired
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime ExpiresAt { get; set; }                  // Đơn hết hạn sau 24h nếu chưa thanh toán
        public DateTime? PaidAt { get; set; }
        public long? ActualAmount { get; set; }                  // Số tiền thực tế SePay gửi về
        public string? SePayTransactionId { get; set; }

        public User User { get; set; } = null!;
    }
}
