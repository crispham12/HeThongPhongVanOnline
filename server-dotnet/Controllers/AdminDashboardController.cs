using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/admin/dashboard")]
    [Authorize]
    public class AdminDashboardController : ControllerBase
    {
        private readonly IAdminDashboardService _service;

        public AdminDashboardController(IAdminDashboardService service)
        {
            _service = service;
        }

        private bool IsAdmin() =>
            User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value == "1" ||
            User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value == "Admin" ||
            User.HasClaim("role", "1") ||
            User.HasClaim("role", "Admin") ||
            User.IsInRole("Admin");

        [HttpGet]
        public async Task<IActionResult> GetDashboardData()
        {
            if (!IsAdmin()) return Forbid();
            try
            {
                var result = await _service.GetDashboardDataAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu dashboard.", detail = ex.Message });
            }
        }
    }
}
