using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InterviewPro.API.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;

        public PaymentService(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public async Task<CreateOrderResponse> CreateOrderAsync(int userId, string planType)
        {
            var plans = PricingManager.GetPlans();
            if (!plans.TryGetValue(planType, out var plan))
                throw new ArgumentException("Gói không hợp lệ. Chỉ chấp nhận Monthly hoặc Yearly.");

            // Hủy đơn Pending cũ của user (nếu có)
            var oldOrders = await _db.PaymentOrders
                .Where(o => o.UserId == userId && o.Status == "Pending")
                .ToListAsync();
            oldOrders.ForEach(o => o.Status = "Expired");

            // Tạo đơn mới
            var orderCode = GenerateOrderCode();
            var order = new PaymentOrder
            {
                OrderCode  = orderCode,
                UserId     = userId,
                PlanType   = planType,
                Amount     = plan.Amount,
                Status     = "Pending",
                ExpiresAt  = DateTime.UtcNow.AddHours(24),
            };
            _db.PaymentOrders.Add(order);
            await _db.SaveChangesAsync();

            // Lấy config SePay từ appsettings
            var bankAccount  = _config["SePay:BankAccount"]  ?? "";
            var bankName     = _config["SePay:BankName"]     ?? "";
            var accountName  = _config["SePay:AccountName"]  ?? "";

            // Sử dụng VietQR để tự tạo mã QR chứa sẵn số tiền và nội dung chuyển khoản
            var accountNameEncoded = Uri.EscapeDataString(accountName);
            var qrUrl = $"https://img.vietqr.io/image/{bankName}-{bankAccount}-compact2.png?amount={plan.Amount}&addInfo={orderCode}&accountName={accountNameEncoded}";

            return new CreateOrderResponse(
                OrderCode:        orderCode,
                PlanType:         planType,
                Amount:           plan.Amount,
                BankAccount:      bankAccount,
                BankName:         bankName,
                AccountName:      accountName,
                TransferContent:  orderCode,
                QrUrl:            qrUrl,
                ExpiresAt:        order.ExpiresAt
            );
        }

        public async Task<OrderStatusResponse> GetOrderStatusAsync(int userId, string orderCode)
        {
            var order = await _db.PaymentOrders
                .Where(o => o.UserId == userId && o.OrderCode == orderCode)
                .FirstOrDefaultAsync()
                ?? throw new KeyNotFoundException("Không tìm thấy đơn hàng.");

            DateTime? premiumExpires = null;
            if (order.Status == "Completed")
            {
                var user = await _db.Users.FindAsync(userId);
                premiumExpires = user?.PremiumExpiresAt;
            }

            return new OrderStatusResponse(
                OrderCode:         order.OrderCode,
                Status:            order.Status,
                PlanType:          order.PlanType,
                Amount:            order.Amount,
                PaidAt:            order.PaidAt,
                PremiumExpiresAt:  premiumExpires,
                ActualAmount:      order.ActualAmount ?? 0
            );
        }

        public async Task ProcessSePayWebhookAsync(SePayWebhookRequest request)
        {
            // Tìm mã IPXXXXXX trong description
            var match = System.Text.RegularExpressions.Regex.Match(
                request.content ?? "",
                @"IP[A-Z0-9]{6}",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );
            if (!match.Success) return; // Không phải giao dịch của hệ thống

            var orderCode = match.Value.ToUpper();
            var order = await _db.PaymentOrders
                .Include(o => o.User)
                .Where(o => o.OrderCode == orderCode && (o.Status == "Pending" || o.Status == "PartiallyPaid"))
                .FirstOrDefaultAsync();

            if (order == null) return; // Đơn không tồn tại hoặc đã xử lý

            if (order.Status == "Pending")
            {
                order.ActualAmount = request.transferAmount;
                order.SePayTransactionId = request.referenceCode;
            }
            else if (order.Status == "PartiallyPaid")
            {
                order.ActualAmount += request.transferAmount;
                order.SePayTransactionId += $",{request.referenceCode}";
            }

            order.PaidAt = DateTime.UtcNow;

            if (order.ActualAmount < order.Amount)
            {
                // Thiếu tiền
                if (order.Status == "Pending")
                {
                    // Lần 1 chuyển thiếu
                    order.Status = "PartiallyPaid";
                }
                else
                {
                    // Lần 2 vẫn thiếu -> Khóa
                    order.Status = "WrongAmount";
                }
            }
            else
            {
                // Đủ hoặc dư tiền
                order.Status = "Completed";

                var plans = PricingManager.GetPlans();
                if (plans.TryGetValue(order.PlanType, out var plan))
                {
                    var user = order.User;
                    var baseDate = (user.PremiumExpiresAt.HasValue && user.PremiumExpiresAt > DateTime.UtcNow)
                        ? user.PremiumExpiresAt.Value
                        : DateTime.UtcNow;

                    user.Plan = "Premium";
                    user.PremiumExpiresAt = baseDate.AddDays(plan.Days);
                }
            }

            await _db.SaveChangesAsync();
        }

        // Sinh mã IP-XXXXXX (6 ký tự A-Z0-9)
        private static string GenerateOrderCode()
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Bỏ I, O, 0, 1 dễ nhầm
            var random = new Random();
            var code = new string(Enumerable.Range(0, 6)
                .Select(_ => chars[random.Next(chars.Length)])
                .ToArray());
            return $"IP{code}";
        }
    }
}
