using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using System.Threading.Tasks;
using InterviewPro.API.DTOs.InterviewHistory;
using InterviewPro.API.DTOs.InterviewCompare;
using InterviewPro.API.Exceptions;
using InterviewPro.API.Interfaces;

namespace InterviewPro.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InterviewsController : ControllerBase
    {
        private readonly IInterviewHistoryService _historyService;
        private readonly IInterviewDetailService _detailService;
        private readonly IInterviewCompareService _compareService;
        private readonly ILogger<InterviewsController> _logger;

        public InterviewsController(
            IInterviewHistoryService historyService, 
            IInterviewDetailService detailService,
            IInterviewCompareService compareService,
            ILogger<InterviewsController> logger)
        {
            _historyService = historyService;
            _detailService = detailService;
            _compareService = compareService;
            _logger = logger;
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] InterviewHistoryQueryDto query)
        {
            // Validate user identity
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new ProblemDetails
                {
                    Status = 401,
                    Title = "Unauthorized",
                    Detail = "Invalid or missing user identity."
                });
            }

            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            bool isAdmin = roleClaim == "1" || roleClaim == "Admin"; // Role 1 = Admin

            // Basic validation
            if (query.Page < 1)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Invalid Page",
                    Detail = "Page must be greater than or equal to 1."
                });
            }

            if (query.PageSize < 1 || query.PageSize > 50)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Invalid PageSize",
                    Detail = "PageSize must be between 1 and 50."
                });
            }

            try
            {
                var result = await _historyService.GetHistoryAsync(userId, query, isAdmin);
                return Ok(result);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error fetching interview history for user {UserId}", userId);
                return StatusCode(500, new ProblemDetails
                {
                    Status = 500,
                    Title = "Internal Server Error",
                    Detail = "An unexpected error occurred while fetching the interview history."
                });
            }
        }

        [HttpGet("{sessionId}/detail")]
        public async Task<IActionResult> GetInterviewDetail(string sessionId)
        {
            // Validate user identity
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new ProblemDetails
                {
                    Status = 401,
                    Title = "Unauthorized",
                    Detail = "Invalid or missing user identity."
                });
            }

            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            bool isAdmin = roleClaim == "1" || roleClaim == "Admin"; // Role 1 = Admin

            try
            {
                var result = await _detailService.GetInterviewDetailAsync(sessionId, userId, isAdmin);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new ProblemDetails { Status = 403, Title = "Forbidden", Detail = ex.Message });
            }
            catch (System.Collections.Generic.KeyNotFoundException ex)
            {
                return NotFound(new ProblemDetails { Status = 404, Title = "Not Found", Detail = ex.Message });
            }
            catch (InterviewArchivedException ex)
            {
                return StatusCode(410, new ProblemDetails { Status = 410, Title = "Gone", Detail = ex.Message });
            }
            catch (System.InvalidOperationException ex)
            {
                return Conflict(new ProblemDetails { Status = 409, Title = "Conflict", Detail = ex.Message });
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error fetching interview detail for session {SessionId}, user {UserId}", sessionId, userId);
                return StatusCode(500, new ProblemDetails
                {
                    Status = 500,
                    Title = "Internal Server Error",
                    Detail = "An unexpected error occurred while fetching the interview detail."
                });
            }
        }

        [HttpPost("history/compare")]
        public async Task<IActionResult> CompareInterviews([FromBody] CompareInterviewRequestDto request)
        {
            // Validate user identity
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new ProblemDetails
                {
                    Status = 401,
                    Title = "Unauthorized",
                    Detail = "Invalid or missing user identity."
                });
            }

            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            bool isAdmin = roleClaim == "1" || roleClaim == "Admin"; // Role 1 = Admin

            try
            {
                var result = await _compareService.CompareAsync(request, userId, isAdmin);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ProblemDetails { Status = 400, Title = "Bad Request", Detail = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new ProblemDetails { Status = 403, Title = "Forbidden", Detail = ex.Message });
            }
            catch (System.Collections.Generic.KeyNotFoundException ex)
            {
                return NotFound(new ProblemDetails { Status = 404, Title = "Not Found", Detail = ex.Message });
            }
            catch (System.InvalidOperationException ex)
            {
                return Conflict(new ProblemDetails { Status = 409, Title = "Conflict", Detail = ex.Message });
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error comparing interviews {A} and {B} for user {UserId}", request.InterviewAId, request.InterviewBId, userId);
                return StatusCode(500, new ProblemDetails
                {
                    Status = 500,
                    Title = "Internal Server Error",
                    Detail = "An unexpected error occurred while comparing the interviews."
                });
            }
        }

        [HttpDelete("history/{sessionId}")]
        public async Task<IActionResult> ArchiveInterview(string sessionId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new ProblemDetails { Status = 401, Title = "Unauthorized", Detail = "Invalid or missing user identity." });
            }

            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return BadRequest(new ProblemDetails { Status = 400, Title = "Bad Request", Detail = "Session ID is required." });
            }

            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            bool isAdmin = roleClaim == "1" || roleClaim == "Admin";

            try
            {
                var result = await _historyService.ArchiveAsync(sessionId, userId, isAdmin);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ProblemDetails { Status = 400, Title = "Bad Request", Detail = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new ProblemDetails { Status = 403, Title = "Forbidden", Detail = ex.Message });
            }
            catch (System.Collections.Generic.KeyNotFoundException ex)
            {
                return NotFound(new ProblemDetails { Status = 404, Title = "Not Found", Detail = ex.Message });
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error archiving session {SessionId} for user {UserId}", sessionId, userId);
                return StatusCode(500, new ProblemDetails { Status = 500, Title = "Internal Server Error", Detail = "An unexpected error occurred while archiving the interview." });
            }
        }

        [HttpPost("history/{sessionId}/restore")]
        public async Task<IActionResult> RestoreInterview(string sessionId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new ProblemDetails { Status = 401, Title = "Unauthorized", Detail = "Invalid or missing user identity." });
            }

            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return BadRequest(new ProblemDetails { Status = 400, Title = "Bad Request", Detail = "Session ID is required." });
            }

            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            bool isAdmin = roleClaim == "1" || roleClaim == "Admin";

            try
            {
                var result = await _historyService.RestoreAsync(sessionId, userId, isAdmin);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ProblemDetails { Status = 400, Title = "Bad Request", Detail = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new ProblemDetails { Status = 403, Title = "Forbidden", Detail = ex.Message });
            }
            catch (System.Collections.Generic.KeyNotFoundException ex)
            {
                return NotFound(new ProblemDetails { Status = 404, Title = "Not Found", Detail = ex.Message });
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error restoring session {SessionId} for user {UserId}", sessionId, userId);
                return StatusCode(500, new ProblemDetails { Status = 500, Title = "Internal Server Error", Detail = "An unexpected error occurred while restoring the interview." });
            }
        }
    }
}
