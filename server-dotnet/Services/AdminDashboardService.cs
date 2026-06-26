using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InterviewPro.API.Services
{
    public class AdminDashboardService : IAdminDashboardService
    {
        private readonly AppDbContext _context;

        public AdminDashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<AdminDashboardOverviewDto> GetDashboardDataAsync()
        {
            var now = DateTime.UtcNow;
            var startOfToday = now.Date;
            var thirtyDaysAgo = startOfToday.AddDays(-30);
            var sevenDaysAgo = startOfToday.AddDays(-6);

            // 1. Kpis
            var totalUsers = await _context.Users.CountAsync();
            var newUsers = await _context.Users.CountAsync(u => u.CreatedAt >= thirtyDaysAgo);

            var totalInterviews = await _context.PracticeSessions.CountAsync();
            var newInterviews = await _context.PracticeSessions.CountAsync(s => s.CreatedAt >= thirtyDaysAgo);

            var totalAiRequests = await _context.AiRequestLogs.CountAsync();
            var newAiRequests = await _context.AiRequestLogs.CountAsync(l => l.CreatedAt >= thirtyDaysAgo);

            // Giả định doanh thu: mỗi phiên = 50.000đ
            double revenuePerSession = 50000;
            var totalRevenue = totalInterviews * revenuePerSession / 1000000.0; // triệu VNĐ
            var newRevenue = newInterviews * revenuePerSession / 1000000.0;

            var kpis = new AdminDashboardKpiDto
            {
                TotalUsers = new KpiMetric { Value = totalUsers.ToString("N0"), Trend = $"+{newUsers}", TrendUp = true },
                TotalInterviews = new KpiMetric { Value = totalInterviews.ToString("N0"), Trend = $"+{newInterviews}", TrendUp = true },
                TotalRevenue = new KpiMetric { Value = totalRevenue.ToString("F1") + "M", Trend = $"+{newRevenue.ToString("F1")}M", TrendUp = true },
                TotalAiRequests = new KpiMetric { Value = totalAiRequests.ToString("N0"), Trend = $"+{newAiRequests}", TrendUp = true }
            };

            // 2. ChartData (7 days)
            var chartData = new List<AdminDashboardChartItemDto>();
            for (int i = 0; i <= 6; i++)
            {
                var date = sevenDaysAgo.AddDays(i);
                var endOfDate = date.AddDays(1);
                var sessionsCount = await _context.PracticeSessions.CountAsync(s => s.CreatedAt >= date && s.CreatedAt < endOfDate);
                
                string dayName = date.ToString("dd/MM");
                if (date.Date == startOfToday) dayName = "Hôm nay";

                chartData.Add(new AdminDashboardChartItemDto
                {
                    Name = dayName,
                    PhongVan = sessionsCount,
                    DoanhThu = sessionsCount * revenuePerSession / 1000000.0
                });
            }

            // 3. RecentInterviews
            var recentSessions = await _context.PracticeSessions
                .OrderByDescending(s => s.CreatedAt)
                .Take(5)
                .Select(s => new AdminDashboardRecentInterviewDto
                {
                    Id = $"#IV-{s.Id}",
                    Name = string.IsNullOrEmpty(s.UserName) ? "Unknown" : s.UserName,
                    Role = s.Role,
                    Score = s.LatestScore > 0 ? $"{s.LatestScore}/100" : "--/100",
                    Live = s.Status == "Active"
                })
                .ToListAsync();

            // 4. SystemStatus
            var activeSessions = await _context.PracticeSessions.CountAsync(s => s.Status == "Active");
            var errorLogsLastHour = await _context.AiRequestLogs
                .Where(l => l.CreatedAt >= now.AddHours(-1) && l.Status == "Failed")
                .CountAsync();
            
            var systemStatus = new AdminDashboardSystemStatusDto
            {
                ActiveSessions = activeSessions,
                ServerLoad = 40 + (activeSessions * 2), // Mock logic
                UserRetention = 65, // Mock
                SystemHealth = errorLogsLastHour > 50 ? "Warning" : "OK"
            };

            return new AdminDashboardOverviewDto
            {
                Kpis = kpis,
                ChartData = chartData,
                RecentInterviews = recentSessions,
                SystemStatus = systemStatus
            };
        }
    }
}
