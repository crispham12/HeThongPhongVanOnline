using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using InterviewPro.API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace InterviewPro.API.Workers
{
    public class DailyQuotaResetWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<DailyQuotaResetWorker> _logger;

        private static TimeZoneInfo GetVietnamTimeZone()
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            }
            catch
            {
                return TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");
            }
        }

        public DailyQuotaResetWorker(IServiceScopeFactory scopeFactory, ILogger<DailyQuotaResetWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var delay = GetDelayUntilMidnightVietnam();
                _logger.LogInformation("[QuotaReset] Lần reset tiếp theo sau {Hours} giờ {Minutes} phút.", 
                    delay.Hours, delay.Minutes);

                await Task.Delay(delay, stoppingToken);

                await ResetDailyQuotaAsync();
            }
        }

        private async Task ResetDailyQuotaAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var now = DateTime.UtcNow;

            try
            {
                // 1. Downgrade user Premium hết hạn về Free
                var expiredPremiumCount = await context.Users
                    .Where(u => u.Plan == "Premium"
                             && u.PremiumExpiresAt.HasValue
                             && u.PremiumExpiresAt.Value <= now)
                    .ExecuteUpdateAsync(u => u
                        .SetProperty(x => x.Plan, "Free")
                        .SetProperty(x => x.PremiumExpiresAt, (DateTime?)null)
                        .SetProperty(x => x.DailyInterviewUsed, 0));

                // 2. Reset quota cho Free user
                var resetCount = await context.Users
                    .Where(u => u.Plan == "Free" && u.DailyInterviewUsed > 0)
                    .ExecuteUpdateAsync(u => u.SetProperty(x => x.DailyInterviewUsed, 0));

                // 3. Expire đơn hàng Pending quá 24h
                await context.PaymentOrders
                    .Where(o => o.Status == "Pending" && o.ExpiresAt <= now)
                    .ExecuteUpdateAsync(o => o.SetProperty(x => x.Status, "Expired"));

                _logger.LogInformation(
                    "[QuotaReset] {Time} | Expired Premium: {Exp} | Reset quota: {Reset}",
                    now, expiredPremiumCount, resetCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[QuotaReset] Lỗi khi reset.");
            }
        }

        private TimeSpan GetDelayUntilMidnightVietnam()
        {
            var nowUtc = DateTime.UtcNow;
            var vietnamTz = GetVietnamTimeZone();
            var nowVn = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, vietnamTz);
            var nextMidnightVn = nowVn.Date.AddDays(1); // 00:00 ngày hôm sau
            var nextMidnightUtc = TimeZoneInfo.ConvertTimeToUtc(nextMidnightVn, vietnamTz);
            var delay = nextMidnightUtc - nowUtc;
            return delay > TimeSpan.Zero ? delay : TimeSpan.FromHours(24);
        }
    }
}
