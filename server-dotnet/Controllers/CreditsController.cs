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
    [Route("api/credits")]
    [Authorize]
    public class CreditsController : ControllerBase
    {
        private readonly ICreditService _creditService;

        public CreditsController(ICreditService creditService)
        {
            _creditService = creditService;
        }

        [HttpGet("wallet")]
        public async Task<ActionResult<CreditWalletDto>> GetWallet()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) return Unauthorized();
                int userId = int.Parse(userIdClaim.Value);

                var wallet = await _creditService.GetWalletAsync(userId);
                
                return Ok(new CreditWalletDto
                {
                    FreeCredits = wallet.FreeCredits,
                    PaidCredits = wallet.PaidCredits,
                    TotalCredits = wallet.FreeCredits + wallet.PaidCredits,
                    TotalCreditsUsed = wallet.TotalCreditsUsed
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin ví.", detail = ex.Message });
            }
        }
    }
}
