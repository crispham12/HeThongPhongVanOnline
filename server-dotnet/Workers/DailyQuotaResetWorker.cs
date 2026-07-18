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

            try
            {
                // Sử dụng ExecuteUpdateAsync nếu hỗ trợ (EF Core 7+), ngược lại có thể thay bằng vòng lặp.
                // Ở đây dùng ExecuteUpdateAsync vì project dùng .NET 8 / EF Core 8.
                var affected = await context.Users
                    .Where(u => u.Plan == "Free" && u.DailyInterviewUsed > 0)
                    .ExecuteUpdateAsync(u => u.SetProperty(x => x.DailyInterviewUsed, 0));

                _logger.LogInformation("[QuotaReset] Reset thành công lúc {Time}. Số user được reset: {Count}", 
                    DateTime.UtcNow, affected);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[QuotaReset] Lỗi khi reset quota.");
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
