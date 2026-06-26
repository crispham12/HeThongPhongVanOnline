using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/payments")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpGet("packages")]
        public async Task<ActionResult<IEnumerable<CreditPackageDto>>> GetPackages()
        {
            try
            {
                var packages = await _paymentService.GetActivePackagesAsync();
                return Ok(packages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách gói.", detail = ex.Message });
            }
        }

        [HttpPost("create")]
        public async Task<ActionResult<CreatePaymentResponse>> CreateTransaction([FromBody] CreatePaymentRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) return Unauthorized();
                int userId = int.Parse(userIdClaim.Value);

                var response = await _paymentService.CreateTransactionAsync(userId, request.PackageId);
                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi khởi tạo thanh toán.", detail = ex.Message });
            }
        }

        [HttpGet("{transactionId}")]
        public async Task<ActionResult<PaymentTransactionDto>> GetTransaction(Guid transactionId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) return Unauthorized();
                int userId = int.Parse(userIdClaim.Value);

                var transaction = await _paymentService.GetTransactionByIdAsync(userId, transactionId);
                return Ok(transaction);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tải thông tin giao dịch.", detail = ex.Message });
            }
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) return Unauthorized();
                int userId = int.Parse(userIdClaim.Value);

                var (items, totalItems) = await _paymentService.GetHistoryAsync(userId, page, limit);

                return Ok(new
                {
                    items = items,
                    totalItems = totalItems,
                    page = page,
                    limit = limit,
                    totalPages = (int)Math.Ceiling((double)totalItems / limit)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy lịch sử giao dịch.", detail = ex.Message });
            }
        }
    }
}
