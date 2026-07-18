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
        private const int FREE_DAILY_LIMIT = 3;

        public InterviewQuotaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task ConsumeQuotaAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new UnauthorizedAccessException("Không tìm thấy người dùng.");

            // Premium: bỏ qua hoàn toàn
            if (user.Plan == "Premium") return;

            // Free: kiểm tra giới hạn
            if (user.DailyInterviewUsed >= FREE_DAILY_LIMIT)
                throw new QuotaExceededException(
                    "Bạn đã sử dụng hết 3 buổi hôm nay. Vui lòng liên hệ để nâng cấp tài khoản Premium.");

            user.DailyInterviewUsed += 1;
            await _context.SaveChangesAsync();
        }

        public async Task<QuotaStatusDto> GetQuotaStatusAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new UnauthorizedAccessException("Không tìm thấy người dùng.");

            bool isPremium = user.Plan == "Premium";
            return new QuotaStatusDto
            {
                Plan = user.Plan,
                DailyUsed = user.DailyInterviewUsed,
                DailyLimit = isPremium ? -1 : FREE_DAILY_LIMIT,
                Remaining = isPremium ? -1 : Math.Max(0, FREE_DAILY_LIMIT - user.DailyInterviewUsed),
                IsUnlimited = isPremium
            };
        }
    }
}
