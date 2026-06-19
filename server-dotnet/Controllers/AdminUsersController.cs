using System;
using System.Security.Claims;
using System.Threading.Tasks;
using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = "Admin")]
    public class AdminUsersController : ControllerBase
    {
        private readonly IAdminUserService _service;

        public AdminUsersController(IAdminUserService service)
        {
            _service = service;
        }

        // GET /api/admin/users/overview
        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            try
            {
                var overview = await _service.GetOverviewAsync();
                return Ok(overview);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu tổng quan.", error = ex.Message });
            }
        }

        // GET /api/admin/users
        [HttpGet]
        public async Task<IActionResult> GetUsers(
            [FromQuery] string? search,
            [FromQuery] string? plan,
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;

                var result = await _service.GetUsersAsync(search, plan, status, page, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách người dùng.", error = ex.Message });
            }
        }

        // GET /api/admin/users/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetUserDetail(int id)
        {
            try
            {
                var detail = await _service.GetUserDetailAsync(id);
                return Ok(detail);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy chi tiết người dùng.", error = ex.Message });
            }
        }

        // POST /api/admin/users
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] AdminUserCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var created = await _service.CreateUserAsync(dto);
                return CreatedAtAction(nameof(GetUserDetail), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tạo người dùng.", error = ex.Message });
            }
        }

        // PUT /api/admin/users/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] AdminUserUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updated = await _service.UpdateUserAsync(id, dto);
                return Ok(updated);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi cập nhật người dùng.", error = ex.Message });
            }
        }

        // POST /api/admin/users/{id}/lock
        [HttpPost("{id:int}/lock")]
        public async Task<IActionResult> LockUser(int id, [FromBody] AdminUserLockDto dto)
        {
            var currentUserId = 0;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null)
            {
                int.TryParse(userIdClaim.Value, out currentUserId);
            }

            try
            {
                var success = await _service.LockUserAsync(id, dto.Reason, currentUserId);
                return Ok(new { message = "Khóa tài khoản thành công." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi khóa tài khoản.", error = ex.Message });
            }
        }

        // POST /api/admin/users/{id}/unlock
        [HttpPost("{id:int}/unlock")]
        public async Task<IActionResult> UnlockUser(int id)
        {
            try
            {
                var success = await _service.UnlockUserAsync(id);
                return Ok(new { message = "Mở khóa tài khoản thành công." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi mở khóa tài khoản.", error = ex.Message });
            }
        }

        // POST /api/admin/users/{id}/reset-daily-limit
        [HttpPost("{id:int}/reset-daily-limit")]
        public async Task<IActionResult> ResetDailyLimit(int id)
        {
            try
            {
                var success = await _service.ResetDailyLimitAsync(id);
                return Ok(new { message = "Khởi động lại giới hạn sử dụng trong ngày thành công." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi reset giới hạn sử dụng.", error = ex.Message });
            }
        }

        // GET /api/admin/users/export-pdf
        [HttpGet("export-pdf")]
        public async Task<IActionResult> ExportPdf(
            [FromQuery] string? search,
            [FromQuery] string? plan,
            [FromQuery] string? status)
        {
            try
            {
                var report = await _service.GetReportDataAsync(search, plan, status);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu báo cáo PDF.", error = ex.Message });
            }
        }
    }
}
