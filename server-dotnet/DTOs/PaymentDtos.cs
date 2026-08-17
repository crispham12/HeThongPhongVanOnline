namespace InterviewPro.API.DTOs
{
    public record CreateOrderRequest(string PlanType); // "Monthly" | "Yearly"

    public record CreateOrderResponse(
        string OrderCode,
        string PlanType,
        long Amount,
        string BankAccount,      // Số tài khoản ngân hàng SePay
        string BankName,         // Tên ngân hàng
        string AccountName,      // Tên chủ tài khoản
        string TransferContent,  // Nội dung CK: "IP-XXXXXX"
        string QrUrl,            // URL ảnh QR từ SePay
        DateTime ExpiresAt
    );

    public record OrderStatusResponse(
        string OrderCode,
        string Status,           // Pending | Completed | WrongAmount | Expired
        string PlanType,
        long Amount,
        DateTime? PaidAt,
        DateTime? PremiumExpiresAt,  // Chỉ có khi Status=Completed
        long ActualAmount = 0
    );

    // Webhook từ SePay — chỉ lấy những field cần thiết
    public record SePayWebhookRequest(
        long transferAmount,
        string content,
        string referenceCode,
        string transactionDate
    );
}
