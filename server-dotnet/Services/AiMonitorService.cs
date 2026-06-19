using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InterviewPro.API.Services
{
    /// <summary>
    /// AiMonitorService: Cung cấp thống kê và log giám sát toàn bộ AI requests.
    /// Chỉ dành cho Admin Panel — không chứa business logic phỏng vấn.
    /// </summary>
    public class AiMonitorService : IAiMonitorService
    {
        private readonly AppDbContext _db;

        public AiMonitorService(AppDbContext db)
        {
            _db = db;
        }

        // ─────────────────────────────────────────────────────
        // OVERVIEW
        // ─────────────────────────────────────────────────────

        public async Task<AiMonitorOverviewDto> GetOverviewAsync(AiMonitorFilterDto filter)
        {
            var query = ApplyFilter(_db.AiRequestLogs.AsNoTracking(), filter);

            var all = await query
                .Select(l => new
                {
                    l.Status,
                    l.TotalTokens,
                    l.InputTokens,
                    l.OutputTokens,
                    l.EstimatedCost,
                    l.ResponseTimeMs,
                    l.UserId,
                    l.Model
                })
                .ToListAsync();

            if (all.Count == 0)
                return new AiMonitorOverviewDto();

            var total = all.Count;
            var success = all.Count(r => r.Status == "Success");
            var failed = all.Count(r => r.Status == "Failed");
            var timeout = all.Count(r => r.Status == "Timeout");

            // P95 response time
            var sorted = all.Select(r => r.ResponseTimeMs).OrderBy(t => t).ToList();
            var p95Index = (int)Math.Ceiling(sorted.Count * 0.95) - 1;
            var p95 = sorted.Count > 0 ? sorted[Math.Max(0, p95Index)] : 0;

            // Model breakdown
            var modelBreakdown = all
                .GroupBy(r => r.Model)
                .Select(g => new AiModelUsageDto
                {
                    Model = g.Key,
                    Requests = g.Count(),
                    TotalTokens = g.Sum(r => (long)r.TotalTokens),
                    TotalCost = g.Sum(r => r.EstimatedCost)
                })
                .OrderByDescending(m => m.Requests)
                .ToList();

            return new AiMonitorOverviewDto
            {
                TotalRequests = total,
                SuccessCount = success,
                FailedCount = failed,
                TimeoutCount = timeout,
                SuccessRate = total > 0 ? Math.Round((double)success / total * 100, 2) : 0,
                TotalInputTokens = all.Sum(r => (long)r.InputTokens),
                TotalOutputTokens = all.Sum(r => (long)r.OutputTokens),
                TotalTokens = all.Sum(r => (long)r.TotalTokens),
                TotalEstimatedCost = all.Sum(r => r.EstimatedCost),
                AvgResponseTimeMs = all.Average(r => (double)r.ResponseTimeMs),
                P95ResponseTimeMs = p95,
                UniqueUsers = all.Where(r => r.UserId.HasValue).Select(r => r.UserId!.Value).Distinct().Count(),
                ModelBreakdown = modelBreakdown
            };
        }

        // ─────────────────────────────────────────────────────
        // FEATURE USAGE
        // ─────────────────────────────────────────────────────

        public async Task<List<AiMonitorFeatureUsageDto>> GetFeatureUsageAsync(AiMonitorFilterDto filter)
        {
            var query = ApplyFilter(_db.AiRequestLogs.AsNoTracking(), filter);

            var grouped = await query
                .GroupBy(l => l.Feature)
                .Select(g => new AiMonitorFeatureUsageDto
                {
                    Feature = g.Key,
                    TotalRequests = g.Count(),
                    SuccessCount = g.Count(r => r.Status == "Success"),
                    FailedCount = g.Count(r => r.Status == "Failed" || r.Status == "Timeout"),
                    TotalTokens = g.Sum(r => (long)r.TotalTokens),
                    TotalCost = g.Sum(r => r.EstimatedCost),
                    AvgResponseTimeMs = g.Average(r => (double)r.ResponseTimeMs)
                })
                .ToListAsync();

            // Tính SuccessRate sau khi query (tránh lỗi EF translation)
            foreach (var item in grouped)
            {
                item.SuccessRate = item.TotalRequests > 0
                    ? Math.Round((double)item.SuccessCount / item.TotalRequests * 100, 2)
                    : 0;
            }

            return grouped.OrderByDescending(f => f.TotalRequests).ToList();
        }

        // ─────────────────────────────────────────────────────
        // DAILY USAGE
        // ─────────────────────────────────────────────────────

        public async Task<List<AiDailyUsageDto>> GetDailyUsageAsync(AiMonitorFilterDto filter)
        {
            var query = ApplyFilter(_db.AiRequestLogs.AsNoTracking(), filter);

            var raw = await query
                .Select(l => new
                {
                    Date = l.CreatedAt.Date,
                    l.Status,
                    l.TotalTokens,
                    l.EstimatedCost,
                    l.ResponseTimeMs
                })
                .ToListAsync();

            var grouped = raw
                .GroupBy(r => r.Date)
                .OrderBy(g => g.Key)
                .Select(g => new AiDailyUsageDto
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    TotalRequests = g.Count(),
                    SuccessCount = g.Count(r => r.Status == "Success"),
                    FailedCount = g.Count(r => r.Status is "Failed" or "Timeout"),
                    TotalTokens = g.Sum(r => (long)r.TotalTokens),
                    TotalCost = g.Sum(r => r.EstimatedCost),
                    AvgResponseTimeMs = g.Average(r => (double)r.ResponseTimeMs)
                })
                .ToList();

            return grouped;
        }

        // ─────────────────────────────────────────────────────
        // ERROR LOGS
        // ─────────────────────────────────────────────────────

        public async Task<PagedResult<AiErrorLogDto>> GetErrorLogsAsync(
            AiMonitorFilterDto filter, int page, int pageSize)
        {
            var query = ApplyFilter(_db.AiRequestLogs.AsNoTracking(), filter)
                .Where(l => l.Status == "Failed" || l.Status == "Timeout")
                .OrderByDescending(l => l.CreatedAt);

            var total = await query.CountAsync();

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new AiErrorLogDto
                {
                    Id = l.Id,
                    UserId = l.UserId,
                    Feature = l.Feature,
                    RequestType = l.RequestType,
                    Model = l.Model,
                    Status = l.Status,
                    ErrorMessage = l.ErrorMessage ?? string.Empty,
                    ResponseTimeMs = l.ResponseTimeMs,
                    CreatedAt = l.CreatedAt
                })
                .ToListAsync();

            return new PagedResult<AiErrorLogDto>
            {
                Items = items,
                TotalItems = total,
                Page = page,
                PageSize = pageSize
            };
        }

        // ─────────────────────────────────────────────────────
        // RAW LOGS
        // ─────────────────────────────────────────────────────

        public async Task<PagedResult<AiRequestLogDto>> GetLogsAsync(
            AiMonitorFilterDto filter, int page, int pageSize)
        {
            var query = ApplyFilter(_db.AiRequestLogs.AsNoTracking(), filter)
                .OrderByDescending(l => l.CreatedAt);

            var total = await query.CountAsync();

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new AiRequestLogDto
                {
                    Id = l.Id,
                    UserId = l.UserId,
                    Feature = l.Feature,
                    RequestType = l.RequestType,
                    Model = l.Model,
                    Status = l.Status,
                    InputTokens = l.InputTokens,
                    OutputTokens = l.OutputTokens,
                    TotalTokens = l.TotalTokens,
                    EstimatedCost = l.EstimatedCost,
                    ResponseTimeMs = l.ResponseTimeMs,
                    ErrorMessage = l.ErrorMessage,
                    CreatedAt = l.CreatedAt
                })
                .ToListAsync();

            return new PagedResult<AiRequestLogDto>
            {
                Items = items,
                TotalItems = total,
                Page = page,
                PageSize = pageSize
            };
        }

        // ─────────────────────────────────────────────────────
        // TOP USERS
        // ─────────────────────────────────────────────────────

        public async Task<List<AiTopUserDto>> GetTopUsersAsync(AiMonitorFilterDto filter, int top)
        {
            var query = ApplyFilter(_db.AiRequestLogs.AsNoTracking(), filter)
                .Where(l => l.UserId.HasValue);

            var grouped = await query
                .GroupBy(l => l.UserId!.Value)
                .Select(g => new AiTopUserDto
                {
                    UserId = g.Key,
                    TotalRequests = g.Count(),
                    TotalTokens = g.Sum(r => (long)r.TotalTokens),
                    TotalCost = g.Sum(r => r.EstimatedCost),
                    FailedRequests = g.Count(r => r.Status == "Failed" || r.Status == "Timeout")
                })
                .OrderByDescending(u => u.TotalTokens)
                .Take(top)
                .ToListAsync();

            return grouped;
        }

        // ─────────────────────────────────────────────────────
        // PRIVATE: Apply common filters
        // ─────────────────────────────────────────────────────

        private static IQueryable<Entities.AiRequestLog> ApplyFilter(
            IQueryable<Entities.AiRequestLog> query,
            AiMonitorFilterDto filter)
        {
            if (filter.From.HasValue)
                query = query.Where(l => l.CreatedAt >= filter.From.Value);

            if (filter.To.HasValue)
                query = query.Where(l => l.CreatedAt <= filter.To.Value);

            if (!string.IsNullOrWhiteSpace(filter.Feature))
                query = query.Where(l => l.Feature == filter.Feature);

            if (!string.IsNullOrWhiteSpace(filter.Model))
                query = query.Where(l => l.Model == filter.Model);

            if (!string.IsNullOrWhiteSpace(filter.Status))
                query = query.Where(l => l.Status == filter.Status);

            return query;
        }
    }
}
