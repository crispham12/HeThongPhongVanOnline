using System;
using System.Threading.Tasks;
using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/payment/sepay")]
    public class SePayWebhookController : ControllerBase
    {
        private readonly ISePayWebhookService _webhookService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<SePayWebhookController> _logger;

        public SePayWebhookController(
            ISePayWebhookService webhookService, 
            IConfiguration configuration,
            ILogger<SePayWebhookController> logger)
        {
            _webhookService = webhookService;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> ReceiveWebhook([FromBody] SePayWebhookRequest request)
        {
            // Optional Webhook secret verification (via Authorization header or query parameter)
            var expectedSecret = _configuration["SePay:WebhookSecret"];
            if (!string.IsNullOrEmpty(expectedSecret))
            {
                var authHeader = Request.Headers["Authorization"].ToString();
                var token = authHeader.Replace("Bearer ", "").Trim();
                if (token != expectedSecret)
                {
                    _logger.LogWarning("Webhook SePay: Xác thực API Key thất bại.");
                    return Unauthorized(new { message = "Không có quyền truy cập." });
                }
            }

            try
            {
                // Process the payment
                var result = await _webhookService.HandleWebhookAsync(request);

                // SePay expects a HTTP 200 status response to confirm receipt
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xử lý Webhook SePay.");
                // Return 200 to prevent SePay from spamming retries for code-level failures
                return Ok(new { success = false, error = ex.Message });
            }
        }
    }
}
