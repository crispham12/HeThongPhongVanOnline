using System;
using System.Linq;
using System.Threading.Tasks;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/admin/payments")]
    [Authorize(Roles = "Admin")]
    public class AdminPaymentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminPaymentsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            try
            {
                var successfulTransactions = await _context.CreditPaymentTransactions
                    .Where(t => t.Status == "Success")
                    .CountAsync();

                var totalRevenue = await _context.CreditPaymentTransactions
                    .Where(t => t.Status == "Success")
                    .SumAsync(t => t.Amount);

                var pendingTransactions = await _context.CreditPaymentTransactions
                    .Where(t => t.Status == "Pending")
                    .CountAsync();

                var failedTransactions = await _context.CreditPaymentTransactions
                    .Where(t => t.Status == "Failed")
                    .CountAsync();

                var totalCreditsSold = await _context.CreditPaymentTransactions
                    .Where(t => t.Status == "Success")
                    .SumAsync(t => t.Credits);

                return Ok(new AdminPaymentOverviewDto
                {
                    TotalRevenue = totalRevenue,
                    SuccessfulTransactions = successfulTransactions,
                    PendingTransactions = pendingTransactions,
                    FailedTransactions = failedTransactions,
                    TotalCreditsSold = totalCreditsSold
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu tổng quan.", error = ex.Message });
            }
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions(
            [FromQuery] string? status = null,
            [FromQuery] int? userId = null,
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var query = _context.CreditPaymentTransactions
                    .Include(t => t.User)
                    .Include(t => t.Package)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(t => t.Status == status);
                }

                if (userId.HasValue)
                {
                    query = query.Where(t => t.UserId == userId.Value);
                }

                if (dateFrom.HasValue)
                {
                    query = query.Where(t => t.CreatedAt >= dateFrom.Value);
                }

                if (dateTo.HasValue)
                {
                    query = query.Where(t => t.CreatedAt <= dateTo.Value);
                }

                query = query.OrderByDescending(t => t.CreatedAt);

                var totalItems = await query.CountAsync();
                var items = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(t => new
                    {
                        id = t.Id,
                        userId = t.UserId,
                        userName = t.User != null ? t.User.FullName : "Unknown",
                        userEmail = t.User != null ? t.User.Email : "",
                        packageName = t.Package != null ? t.Package.Name : "Lẻ",
                        amount = t.Amount,
                        credits = t.Credits,
                        paymentCode = t.PaymentCode,
                        paymentMethod = t.PaymentMethod,
                        status = t.Status,
                        sePayTransactionId = t.SePayTransactionId,
                        bankCode = t.BankCode,
                        bankAccountNumber = t.BankAccountNumber,
                        transferContent = t.TransferContent,
                        createdAt = t.CreatedAt,
                        paidAt = t.PaidAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    items = items,
                    totalItems = totalItems,
                    page = page,
                    pageSize = pageSize,
                    totalPages = (int)Math.Ceiling((double)totalItems / pageSize)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy lịch sử giao dịch.", error = ex.Message });
            }
        }

        [HttpGet("packages")]
        public async Task<IActionResult> GetPackages()
        {
            try
            {
                var packages = await _context.CreditPackages
                    .OrderBy(p => p.Price)
                    .ToListAsync();
                return Ok(packages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách gói.", error = ex.Message });
            }
        }

        [HttpPost("packages")]
        public async Task<IActionResult> CreatePackage([FromBody] CreditPackage package)
        {
            try
            {
                package.Id = Guid.NewGuid();
                package.CreatedAt = DateTime.UtcNow;
                
                _context.CreditPackages.Add(package);
                await _context.SaveChangesAsync();
                
                return CreatedAtAction(nameof(GetPackages), new { id = package.Id }, package);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tạo gói mới.", error = ex.Message });
            }
        }

        [Obsolete]
        [HttpPut("packages/{id}")]
        public async Task<IActionResult> UpdatePackage(Guid id, [FromBody] CreditPackage updated)
        {
            try
            {
                var package = await _context.CreditPackages.FindAsync(id);
                if (package == null) return NotFound(new { message = "Không tìm thấy gói." });

                package.Name = updated.Name;
                package.Price = updated.Price;
                package.Credits = updated.Credits;
                package.IsActive = updated.IsActive;
                package.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(package);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi cập nhật gói.", error = ex.Message });
            }
        }

        [HttpPatch("packages/{id}/toggle-active")]
        public async Task<IActionResult> ToggleActive(Guid id)
        {
            try
            {
                var package = await _context.CreditPackages.FindAsync(id);
                if (package == null) return NotFound(new { message = "Không tìm thấy gói." });

                package.IsActive = !package.IsActive;
                package.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(new { success = true, isActive = package.IsActive });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi thay đổi trạng thái gói.", error = ex.Message });
            }
        }
    }
}
