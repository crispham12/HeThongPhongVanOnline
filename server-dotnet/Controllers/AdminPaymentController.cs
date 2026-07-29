using InterviewPro.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/admin/payments")]
    [Authorize]
    public class AdminPaymentController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AdminPaymentController(AppDbContext db) => _db = db;

        private bool IsAdmin() =>
            User.FindFirst(ClaimTypes.Role)?.Value == "1" ||
            User.FindFirst("role")?.Value == "1";

        // GET /api/admin/payments?status=WrongAmount&page=1
        [HttpGet]
        public async Task<IActionResult> GetOrders(
            [FromQuery] string? status,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            if (!IsAdmin()) return Forbid();

            var query = _db.PaymentOrders
                .Include(o => o.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(o => o.Status == status);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(o =>
                    o.OrderCode.Contains(search) ||
                    o.User.Email.Contains(search));

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new
                {
                    o.Id, o.OrderCode, o.PlanType, o.Amount,
                    o.ActualAmount, o.Status, o.CreatedAt, o.PaidAt,
                    User = new { o.User.Id, o.User.Email, o.User.FullName, o.User.Plan }
                })
                .ToListAsync();

            return Ok(new { total, page, pageSize, items });
        }

        // POST /api/admin/payments/{id}/manual-approve
        // Dùng khi user chuyển sai tiền, admin muốn cấp Premium thủ công
        [HttpPost("{id}/manual-approve")]
        public async Task<IActionResult> ManualApprove(int id, [FromQuery] string planType = "Monthly")
        {
            if (!IsAdmin()) return Forbid();

            var order = await _db.PaymentOrders
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();
            if (order.Status == "Completed")
                return BadRequest(new { message = "Đơn hàng đã được xử lý." });

            var plans = new Dictionary<string, int> { ["Monthly"] = 30, ["Yearly"] = 365 };
            if (!plans.TryGetValue(planType, out var days))
                return BadRequest(new { message = "Gói không hợp lệ." });

            order.Status = "Completed";
            order.PaidAt = DateTime.UtcNow;

            var user = order.User;
            var baseDate = (user.PremiumExpiresAt.HasValue && user.PremiumExpiresAt > DateTime.UtcNow)
                ? user.PremiumExpiresAt.Value
                : DateTime.UtcNow;

            user.Plan             = "Premium";
            user.PremiumExpiresAt = baseDate.AddDays(days);

            await _db.SaveChangesAsync();
            return Ok(new { message = $"Đã cấp Premium {days} ngày cho {user.Email}." });
        }
    }
}
