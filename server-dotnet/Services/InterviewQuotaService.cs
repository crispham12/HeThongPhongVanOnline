using System;
using System.Threading.Tasks;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InterviewPro.API.Services
{
    public class InterviewQuotaService : IInterviewQuotaService
    {
        private readonly AppDbContext _context;
        private const int FREE_DAILY_LIMIT = 100;

        public InterviewQuotaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task ConsumeQuotaAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new UnauthorizedAccessException("Không tìm thấy người dùng.");

            // Premium hợp lệ: Plan=Premium VÀ chưa hết hạn
            var isPremiumActive = user.Plan == "Premium"
                && user.PremiumExpiresAt.HasValue
                && user.PremiumExpiresAt.Value > DateTime.UtcNow;

            if (isPremiumActive) return; // Không trừ quota

            // Free: kiểm tra giới hạn
            if (user.DailyInterviewUsed >= FREE_DAILY_LIMIT)
                throw new QuotaExceededException(
                    "Bạn đã sử dụng hết 100 buổi hôm nay. Vui lòng liên hệ để nâng cấp tài khoản Premium.");

            user.DailyInterviewUsed += 1;
            await _context.SaveChangesAsync();
        }

        public async Task<QuotaStatusDto> GetQuotaStatusAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new UnauthorizedAccessException("Không tìm thấy người dùng.");

            var isPremiumActive = user.Plan == "Premium"
                && user.PremiumExpiresAt.HasValue
                && user.PremiumExpiresAt.Value > DateTime.UtcNow;

            return new QuotaStatusDto
            {
                Plan = isPremiumActive ? "Premium" : "Free",
                DailyUsed = user.DailyInterviewUsed,
                DailyLimit = isPremiumActive ? -1 : FREE_DAILY_LIMIT,
                Remaining = isPremiumActive ? -1 : Math.Max(0, FREE_DAILY_LIMIT - user.DailyInterviewUsed),
                IsUnlimited = isPremiumActive,
                PremiumExpiresAt = user.PremiumExpiresAt
            };
        }

        public async Task<bool> HasEnoughQuotaAsync(int userId, int required)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;
            if (user.Plan == "Premium") return true;
            return (user.DailyInterviewUsed + required) <= FREE_DAILY_LIMIT;
        }
    }
}
