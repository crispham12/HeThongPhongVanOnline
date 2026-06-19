using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InterviewPro.API.Controllers
{
    /// <summary>
    /// AdminAiMonitorController: API Giám sát hệ thống AI cho Admin Panel.
    ///
    /// Chỉ Admin (Role = 1) mới được truy cập.
    ///
    /// Endpoints:
    ///   GET  /api/admin/ai-monitor/overview          — Tổng quan thống kê
    ///   GET  /api/admin/ai-monitor/feature-usage     — Breakdown theo Feature
    ///   GET  /api/admin/ai-monitor/daily-usage       — Usage theo ngày
    ///   GET  /api/admin/ai-monitor/error-logs        — Danh sách lỗi
    ///   GET  /api/admin/ai-monitor/logs              — Raw logs (phân trang)
    ///   GET  /api/admin/ai-monitor/top-users         — Top users theo token
    /// </summary>
    [ApiController]
    [Route("api/admin/ai-monitor")]
    [Authorize]
    public class AdminAiMonitorController : ControllerBase
    {
        private readonly IAiMonitorService _monitor;

        public AdminAiMonitorController(IAiMonitorService monitor)
        {
            _monitor = monitor;
        }

        // ─────────────────────────────────────────
        // Kiểm tra Admin role từ JWT claims
        // ─────────────────────────────────────────
        private bool IsAdmin()
        {
            var roleClaim = User.FindFirst(ClaimTypes.Role)
                         ?? User.FindFirst("role")
                         ?? User.FindFirst("Role");

            if (roleClaim == null)
            {
                // Fallback: check "role" value == "1" or "Admin"
                var altClaim = User.FindFirst("role");
                if (altClaim != null)
                    return altClaim.Value == "1" || altClaim.Value == "Admin";
                return false;
            }

            return roleClaim.Value == "1" || roleClaim.Value == "Admin";
        }

        // Helper để build filter từ query params
        private static AiMonitorFilterDto BuildFilter(
            DateTime? from, DateTime? to,
            string? feature, string? model, string? status)
        {
            return new AiMonitorFilterDto
            {
                From = from,
                To = to,
                Feature = feature,
                Model = model,
                Status = status
            };
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/admin/ai-monitor/overview
        // Tổng quan: total requests, tokens, cost, error rate, p95...
        // ─────────────────────────────────────────────────────────────
        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] string? feature = null,
            [FromQuery] string? model = null,
            [FromQuery] string? status = null)
        {
            if (!IsAdmin()) return Forbid();

            try
            {
                var result = await _monitor.GetOverviewAsync(
                    BuildFilter(from, to, feature, model, status));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy tổng quan AI.", detail = ex.Message });
            }
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/admin/ai-monitor/feature-usage
        // Thống kê usage breakdown theo từng Feature
        // ─────────────────────────────────────────────────────────────
        [HttpGet("feature-usage")]
        public async Task<IActionResult> GetFeatureUsage(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] string? model = null)
        {
            if (!IsAdmin()) return Forbid();

            try
            {
                var result = await _monitor.GetFeatureUsageAsync(
                    BuildFilter(from, to, null, model, null));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy feature usage.", detail = ex.Message });
            }
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/admin/ai-monitor/daily-usage
        // Time-series usage theo ngày (cho chart)
        // ─────────────────────────────────────────────────────────────
        [HttpGet("daily-usage")]
        public async Task<IActionResult> GetDailyUsage(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] string? feature = null)
        {
            if (!IsAdmin()) return Forbid();

            try
            {
                var result = await _monitor.GetDailyUsageAsync(
                    BuildFilter(from, to, feature, null, null));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy daily usage.", detail = ex.Message });
            }
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/admin/ai-monitor/error-logs
        // Danh sách request bị Failed / Timeout với phân trang
        // ─────────────────────────────────────────────────────────────
        [HttpGet("error-logs")]
        public async Task<IActionResult> GetErrorLogs(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] string? feature = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            if (!IsAdmin()) return Forbid();

            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            try
            {
                var result = await _monitor.GetErrorLogsAsync(
                    BuildFilter(from, to, feature, null, null), page, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy error logs.", detail = ex.Message });
            }
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/admin/ai-monitor/logs
        // Raw logs với đầy đủ filter và phân trang
        // ─────────────────────────────────────────────────────────────
        [HttpGet("logs")]
        public async Task<IActionResult> GetLogs(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] string? feature = null,
            [FromQuery] string? model = null,
            [FromQuery] string? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            if (!IsAdmin()) return Forbid();

            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 200) pageSize = 50;

            try
            {
                var result = await _monitor.GetLogsAsync(
                    BuildFilter(from, to, feature, model, status), page, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy logs.", detail = ex.Message });
            }
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/admin/ai-monitor/top-users
        // Top N users có token usage cao nhất
        // ─────────────────────────────────────────────────────────────
        [HttpGet("top-users")]
        public async Task<IActionResult> GetTopUsers(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] int top = 10)
        {
            if (!IsAdmin()) return Forbid();

            if (top < 1 || top > 100) top = 10;

            try
            {
                var result = await _monitor.GetTopUsersAsync(
                    BuildFilter(from, to, null, null, null), top);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy top users.", detail = ex.Message });
            }
        }
    }
}
