using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IConfiguration _config;

        public PaymentController(IPaymentService paymentService, IConfiguration config)
        {
            _paymentService = paymentService;
            _config = config;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        // POST /api/payments/create-order
        [HttpPost("create-order")]
        [Authorize]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest req)
        {
            try
            {
                var result = await _paymentService.CreateOrderAsync(GetUserId(), req.PlanType);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /api/payments/status/{orderCode}
        [HttpGet("status/{orderCode}")]
        [Authorize]
        public async Task<IActionResult> GetStatus(string orderCode)
        {
            try
            {
                var result = await _paymentService.GetOrderStatusAsync(GetUserId(), orderCode);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // POST /api/payments/sepay-webhook
        // Không dùng [Authorize] — SePay gọi từ server của họ
        [HttpPost("sepay-webhook")]
        public async Task<IActionResult> SePayWebhook([FromBody] SePayWebhookRequest req)
        {
            // Xác thực webhook bằng secret token từ header
            var expectedToken = _config["SePay:WebhookSecret"] ?? "";
            if (!string.IsNullOrEmpty(expectedToken))
            {
                var receivedToken = Request.Headers["Authorization"].ToString()
                    .Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase)
                    .Replace("Apikey ", "", StringComparison.OrdinalIgnoreCase)
                    .Trim();
                if (receivedToken != expectedToken)
                    return Unauthorized();
            }

            await _paymentService.ProcessSePayWebhookAsync(req);
            return Ok(new { success = true }); // SePay cần nhận 200 OK
        }
    }
}
