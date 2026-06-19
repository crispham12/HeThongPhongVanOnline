using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace InterviewPro.API.Services
{
    public class AiRequestLogService : IAiRequestLogService
    {
        private readonly AppDbContext _db;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _config;
        private readonly ILogger<AiRequestLogService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AiRequestLogService(
            AppDbContext db,
            IHttpClientFactory httpClientFactory,
            IConfiguration config,
            ILogger<AiRequestLogService> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpClientFactory = httpClientFactory;
            _config = config;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        // ─────────────────────────────────────────────────────────────
        // LOG ASYNC
        // ─────────────────────────────────────────────────────────────
        public async Task LogAsync(AiRequestLogCreateDto dto)
        {
            try
            {
                var errMsg = dto.ErrorMessage;
                if (!string.IsNullOrEmpty(errMsg) && errMsg.Length > 1000)
                {
                    errMsg = errMsg.Substring(0, 1000) + "... (truncated)";
                }

                // Auto calculate cost if token usage is provided and cost is 0
                decimal cost = dto.EstimatedCost;
                if (cost == 0 && dto.TotalTokens > 0)
                {
                    cost = CalculateEstimatedCost(dto.Model ?? "gpt-4o-mini", dto.InputTokens, dto.OutputTokens);
                }

                int? userId = dto.UserId;
                string? userName = dto.UserName;

                if (!userId.HasValue || string.IsNullOrEmpty(userName))
                {
                    var user = _httpContextAccessor?.HttpContext?.User;
                    if (user != null)
                    {
                        var idClaim = user.FindFirst(ClaimTypes.NameIdentifier);
                        if (idClaim != null && int.TryParse(idClaim.Value, out var parsedId))
                        {
                            userId ??= parsedId;
                        }

                        var nameClaim = user.FindFirst(ClaimTypes.Name);
                        if (nameClaim != null)
                        {
                            userName ??= nameClaim.Value;
                        }
                    }
                }

                var log = new AiRequestLog
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    UserName = userName,
                    Feature = dto.Feature,
                    RequestType = dto.RequestType,
                    Model = dto.Model,
                    Status = dto.Status,
                    InputTokens = dto.InputTokens,
                    OutputTokens = dto.OutputTokens,
                    TotalTokens = dto.TotalTokens,
                    EstimatedCost = cost,
                    ResponseTimeMs = dto.ResponseTimeMs,
                    ErrorMessage = errMsg,
                    CreatedAt = DateTime.UtcNow
                };

                _db.AiRequestLogs.Add(log);
                await _db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to write AI request log.");
            }
        }

        // ─────────────────────────────────────────────────────────────
        // GET OVERVIEW
        // ─────────────────────────────────────────────────────────────
        public async Task<AiMonitoringOverviewDto> GetOverviewAsync(string range)
        {
            var startDate = GetStartDate(range);
            var query = _db.AiRequestLogs.AsNoTracking().Where(l => l.CreatedAt >= startDate);

            var list = await query.Select(l => new
            {
                l.Status,
                l.TotalTokens,
                l.EstimatedCost,
                l.ResponseTimeMs
            }).ToListAsync();

            if (list.Count == 0)
            {
                return new AiMonitoringOverviewDto
                {
                    TotalRequests = 0,
                    AverageResponseTime = 0,
                    AverageResponseTimeText = "0s",
                    TotalTokens = 0,
                    EstimatedCost = 0,
                    SuccessRate = 0,
                    ErrorRate = 0
                };
            }

            int total = list.Count;
            double avgResponseTime = list.Average(l => l.ResponseTimeMs);
            long totalTokens = list.Sum(l => (long)l.TotalTokens);
            decimal totalCost = list.Sum(l => l.EstimatedCost);

            int success = list.Count(l => l.Status == "Success");
            int errors = list.Count(l => l.Status == "Failed" || l.Status == "Timeout");

            double successRate = Math.Round((double)success / total * 100, 1);
            double errorRate = Math.Round((double)errors / total * 100, 1);

            return new AiMonitoringOverviewDto
            {
                TotalRequests = total,
                AverageResponseTime = avgResponseTime,
                AverageResponseTimeText = $"{(avgResponseTime / 1000.0):F1}s",
                TotalTokens = totalTokens,
                EstimatedCost = totalCost,
                SuccessRate = successRate,
                ErrorRate = errorRate
            };
        }

        // ─────────────────────────────────────────────────────────────
        // GET TOKEN USAGE (CHART)
        // ─────────────────────────────────────────────────────────────
        public async Task<List<AiTokenUsageDto>> GetTokenUsageAsync(string range)
        {
            var startDate = GetStartDate(range);
            var query = _db.AiRequestLogs.AsNoTracking()
                .Where(l => l.CreatedAt >= startDate)
                .OrderBy(l => l.CreatedAt);

            var rawData = await query.Select(l => new
            {
                l.CreatedAt,
                l.InputTokens,
                l.OutputTokens,
                l.TotalTokens
            }).ToListAsync();

            if (range == "24h")
            {
                // Group by hour
                return rawData
                    .GroupBy(x => x.CreatedAt.ToLocalTime().Hour)
                    .Select(g => new AiTokenUsageDto
                    {
                        Label = $"{g.Key:D2}:00",
                        InputTokens = g.Sum(x => x.InputTokens),
                        OutputTokens = g.Sum(x => x.OutputTokens),
                        TotalTokens = g.Sum(x => x.TotalTokens)
                    })
                    .ToList();
            }
            else
            {
                // Group by day (7d, 30d)
                return rawData
                    .GroupBy(x => x.CreatedAt.ToLocalTime().Date)
                    .Select(g => new AiTokenUsageDto
                    {
                        Label = g.Key.ToString("dd/MM"),
                        InputTokens = g.Sum(x => x.InputTokens),
                        OutputTokens = g.Sum(x => x.OutputTokens),
                        TotalTokens = g.Sum(x => x.TotalTokens)
                    })
                    .ToList();
            }
        }

        // ─────────────────────────────────────────────────────────────
        // GET FEATURE USAGE
        // ─────────────────────────────────────────────────────────────
        public async Task<List<AiFeatureUsageDto>> GetFeatureUsageAsync(string range)
        {
            var startDate = GetStartDate(range);
            var query = _db.AiRequestLogs.AsNoTracking().Where(l => l.CreatedAt >= startDate);

            var allLogs = await query.Select(l => l.Feature).ToListAsync();

            if (allLogs.Count == 0) return new List<AiFeatureUsageDto>();

            int totalCount = allLogs.Count;

            var result = allLogs
                .GroupBy(f => f)
                .Select(g => new AiFeatureUsageDto
                {
                    Feature = g.Key,
                    DisplayName = MapFeatureToDisplayName(g.Key),
                    RequestCount = g.Count(),
                    Percentage = Math.Round((double)g.Count() / totalCount * 100, 1)
                })
                .OrderByDescending(f => f.RequestCount)
                .ToList();

            return result;
        }

        // ─────────────────────────────────────────────────────────────
        // GET RECENT LOGS
        // ─────────────────────────────────────────────────────────────
        public async Task<PaginatedResult<AiRecentLogDto>> GetRecentLogsAsync(int page, int pageSize)
        {
            var query = _db.AiRequestLogs.AsNoTracking();
            var total = await query.CountAsync();

            var list = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new
                {
                    l.UserName,
                    l.Feature,
                    l.Status,
                    l.TotalTokens,
                    l.ResponseTimeMs,
                    l.CreatedAt
                })
                .ToListAsync();

            var items = list.Select(l => new AiRecentLogDto
            {
                UserName = l.UserName ?? "Hệ thống",
                Feature = l.Feature,
                FeatureDisplayName = MapFeatureToDisplayName(l.Feature),
                Status = l.Status,
                StatusText = MapStatusToVietnamese(l.Status),
                TotalTokens = l.TotalTokens,
                ResponseTimeMs = l.ResponseTimeMs,
                ResponseTimeText = $"{(l.ResponseTimeMs / 1000.0):F1}s",
                CreatedAt = l.CreatedAt,
                CreatedAtText = FormatTimeAgo(l.CreatedAt)
            }).ToList();

            return new PaginatedResult<AiRecentLogDto>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalItems = total
            };
        }

        // ─────────────────────────────────────────────────────────────
        // GET ERROR LOGS
        // ─────────────────────────────────────────────────────────────
        public async Task<List<AiErrorLogDto>> GetErrorsAsync(int page, int pageSize)
        {
            var list = await _db.AiRequestLogs.AsNoTracking()
                .Where(l => l.Status == "Failed" || l.Status == "Timeout")
                .OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new AiErrorLogDto
                {
                    Feature = l.Feature,
                    RequestType = l.RequestType,
                    Status = l.Status,
                    ErrorMessage = l.ErrorMessage ?? "Unknown error",
                    ResponseTimeMs = l.ResponseTimeMs,
                    CreatedAt = l.CreatedAt
                })
                .ToListAsync();

            return list;
        }

        // ─────────────────────────────────────────────────────────────
        // GET SYSTEM STATUS
        // ─────────────────────────────────────────────────────────────
        public async Task<AiSystemStatusDto> GetSystemStatusAsync()
        {
            var status = new AiSystemStatusDto
            {
                ApiStatus = "Hoạt động",
                AiServiceStatus = "Không khả dụng",
                GptLimitUsedPercent = 0,
                SystemLatencyMs = 0,
                Message = "Hệ thống đang hoạt động ổn định."
            };

            // 1. Check Python FastAPI health
            try
            {
                var baseUrl = _config["AiService:BaseUrl"] ?? "http://localhost:8000";
                var client = _httpClientFactory.CreateClient();
                client.Timeout = TimeSpan.FromSeconds(3);
                var response = await client.GetAsync($"{baseUrl}/health");
                if (response.IsSuccessStatusCode)
                {
                    status.AiServiceStatus = "Hoạt động";
                }
            }
            catch
            {
                status.AiServiceStatus = "Không khả dụng";
            }

            // 2. Latency: average of last 20 requests
            var last20 = await _db.AiRequestLogs.AsNoTracking()
                .OrderByDescending(l => l.CreatedAt)
                .Take(20)
                .Select(l => l.ResponseTimeMs)
                .ToListAsync();

            status.SystemLatencyMs = last20.Count > 0 ? (long)last20.Average() : 0;

            // 3. GPT Limit Percent
            long limit = 50_000_000;
            var limitStr = _config["AIModelPricing:MonthlyTokenLimit"];
            if (!string.IsNullOrEmpty(limitStr) && long.TryParse(limitStr, out var configuredLimit))
            {
                limit = configuredLimit;
            }

            var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var monthlyTokens = await _db.AiRequestLogs.AsNoTracking()
                .Where(l => l.CreatedAt >= startOfMonth)
                .SumAsync(l => (long?)l.TotalTokens) ?? 0;

            status.GptLimitUsedPercent = (int)Math.Min(100, Math.Round((double)monthlyTokens / limit * 100));

            // Set alert message based on status
            if (status.AiServiceStatus == "Không khả dụng")
            {
                status.Message = "Cảnh báo: Dịch vụ AI Service (Python FastAPI) đang không khả dụng!";
            }
            else if (status.GptLimitUsedPercent >= 90)
            {
                status.Message = "Cảnh báo: Hạn mức token tháng này sắp hết!";
            }
            else
            {
                status.Message = "Hệ thống đang hoạt động trong ngưỡng an toàn.";
            }

            return status;
        }

        // ─────────────────────────────────────────────────────────────
        // PRIVATE HELPERS
        // ─────────────────────────────────────────────────────────────

        private DateTime GetStartDate(string range)
        {
            return range switch
            {
                "24h" => DateTime.UtcNow.AddHours(-24),
                "7d" => DateTime.UtcNow.AddDays(-7),
                "30d" => DateTime.UtcNow.AddDays(-30),
                _ => DateTime.UtcNow.AddHours(-24)
            };
        }

        private decimal CalculateEstimatedCost(string model, int inputTokens, int outputTokens)
        {
            decimal inputPrice = 0.15m;  // Price per 1M tokens
            decimal outputPrice = 0.60m; // Price per 1M tokens

            var normalizedModel = model.ToLower();
            if (normalizedModel.Contains("gpt-4o-mini"))
            {
                inputPrice = _config.GetValue<decimal>("AIModelPricing:gpt-4o-mini:InputPer1MTokens", 0.15m);
                outputPrice = _config.GetValue<decimal>("AIModelPricing:gpt-4o-mini:OutputPer1MTokens", 0.60m);
            }
            else if (normalizedModel.Contains("gpt-4o"))
            {
                inputPrice = _config.GetValue<decimal>("AIModelPricing:gpt-4o:InputPer1MTokens", 2.50m);
                outputPrice = _config.GetValue<decimal>("AIModelPricing:gpt-4o:OutputPer1MTokens", 10.00m);
            }
            else
            {
                inputPrice = _config.GetValue<decimal>($"AIModelPricing:{model}:InputPer1MTokens", 0.15m);
                outputPrice = _config.GetValue<decimal>($"AIModelPricing:{model}:OutputPer1MTokens", 0.60m);
            }

            decimal inputCost = ((decimal)inputTokens / 1_000_000m) * inputPrice;
            decimal outputCost = ((decimal)outputTokens / 1_000_000m) * outputPrice;

            return inputCost + outputCost;
        }

        private string MapFeatureToDisplayName(string feature)
        {
            return feature switch
            {
                "InterviewQuestionGeneration" => "Tạo câu hỏi phỏng vấn",
                "HRStarScoring" => "Chấm HR STAR",
                "TechnicalScoring" => "Chấm kỹ thuật",
                "CVAnalysis" => "Phân tích CV",
                "CareerConsulting" => "Tư vấn nghề nghiệp",
                "CandidateEvaluation" => "Đánh giá ứng viên",
                "AutoScoring" => "Tự động chấm điểm",
                "GitHubAnalysis" => "Phân tích GitHub",
                "CodingAnalysis" => "Phân tích Coding",
                "RoadmapGeneration" => "Tạo lộ trình học tập",
                _ => feature
            };
        }

        private string MapStatusToVietnamese(string status)
        {
            return status switch
            {
                "Success" => "Thành công",
                "Failed" => "Lỗi",
                "Timeout" => "Hết giờ",
                _ => status
            };
        }

        private string FormatTimeAgo(DateTime utcDateTime)
        {
            var localTime = utcDateTime.ToLocalTime();
            return localTime.ToString("dd/MM/yyyy HH:mm");
        }
    }
}
