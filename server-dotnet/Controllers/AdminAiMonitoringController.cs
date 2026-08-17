using System;
using System.Threading.Tasks;
using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/admin/ai-monitoring")]
    [Authorize]
    public class AdminAiMonitoringController : ControllerBase
    {
        private readonly IAiRequestLogService _logService;

        public AdminAiMonitoringController(IAiRequestLogService logService)
        {
            _logService = logService;
        }

        private bool IsAdmin() =>
            User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value == "1" ||
            User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value == "Admin" ||
            User.HasClaim("role", "1") ||
            User.HasClaim("role", "Admin") ||
            User.IsInRole("Admin");

        // GET /api/admin/ai-monitoring/overview
        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview([FromQuery] string range = "24h")
        {
            if (!IsAdmin()) return Forbid();
            try
            {
                var overview = await _logService.GetOverviewAsync(range);
                return Ok(overview);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin overview.", error = ex.Message });
            }
        }

        // GET /api/admin/ai-monitoring/token-usage
        [HttpGet("token-usage")]
        public async Task<IActionResult> GetTokenUsage([FromQuery] string range = "24h")
        {
            if (!IsAdmin()) return Forbid();
            try
            {
                var usage = await _logService.GetTokenUsageAsync(range);
                return Ok(usage);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu biểu đồ token.", error = ex.Message });
            }
        }

        // GET /api/admin/ai-monitoring/feature-usage
        [HttpGet("feature-usage")]
        public async Task<IActionResult> GetFeatureUsage([FromQuery] string range = "24h")
        {
            if (!IsAdmin()) return Forbid();
            try
            {
                var features = await _logService.GetFeatureUsageAsync(range);
                return Ok(features);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu sử dụng theo tính năng.", error = ex.Message });
            }
        }

        // GET /api/admin/ai-monitoring/system-status
        [HttpGet("system-status")]
        public async Task<IActionResult> GetSystemStatus()
        {
            if (!IsAdmin()) return Forbid();
            try
            {
                var status = await _logService.GetSystemStatusAsync();
                return Ok(status);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy tình trạng hệ thống.", error = ex.Message });
            }
        }

        // GET /api/admin/ai-monitoring/recent-logs
        [HttpGet("recent-logs")]
        public async Task<IActionResult> GetRecentLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (!IsAdmin()) return Forbid();
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;
                var logs = await _logService.GetRecentLogsAsync(page, pageSize);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách nhật ký AI gần đây.", error = ex.Message });
            }
        }

        // GET /api/admin/ai-monitoring/errors
        [HttpGet("errors")]
        public async Task<IActionResult> GetErrors([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (!IsAdmin()) return Forbid();
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;
                var result = await _logService.GetErrorsAsync(page, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách logs lỗi.", error = ex.Message });
            }
        }
    }
}
