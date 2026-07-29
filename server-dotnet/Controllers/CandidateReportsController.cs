using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/candidate-reports")]
    [Authorize]
    public class CandidateReportsController : ControllerBase
    {
        private readonly ICandidateReportService _service;

        public CandidateReportsController(ICandidateReportService service)
        {
            _service = service;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();
            return int.Parse(claim.Value);
        }

        [HttpGet("{sessionId}")]
        public async Task<IActionResult> GetReport(string sessionId)
        {
            try
            {
                var report = await _service.GetReportAsync(GetUserId(), sessionId);
                return Ok(report);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tải báo cáo phỏng vấn.", detail = ex.Message });
            }
        }

        [HttpGet("{sessionId}/hr")]
        public async Task<IActionResult> GetHrReport(string sessionId)
        {
            try
            {
                var report = await _service.GetHrReportAsync(GetUserId(), sessionId);
                return Ok(report);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("{sessionId}/technical")]
        public async Task<IActionResult> GetTechnicalReport(string sessionId)
        {
            try
            {
                var report = await _service.GetTechnicalReportAsync(GetUserId(), sessionId);
                return Ok(report);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("{sessionId}/coding")]
        public async Task<IActionResult> GetCodingReport(string sessionId)
        {
            try
            {
                var report = await _service.GetCodingReportAsync(GetUserId(), sessionId);
                return Ok(report);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("{sessionId}/competency-profile")]
        public async Task<IActionResult> GetCompetencyProfile(string sessionId)
        {
            try
            {
                var profile = await _service.GetCompetencyProfileAsync(GetUserId(), sessionId);
                return Ok(profile);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
