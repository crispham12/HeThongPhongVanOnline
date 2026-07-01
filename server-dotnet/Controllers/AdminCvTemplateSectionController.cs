using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/admin/cv-templates")]
    [Authorize(Roles = "Admin")] // Admin Role
    public class AdminCvTemplateSectionController : ControllerBase
    {
        private readonly ICvTemplateSectionService _sectionService;
        private readonly ILogger<AdminCvTemplateSectionController> _logger;

        public AdminCvTemplateSectionController(
            ICvTemplateSectionService sectionService,
            ILogger<AdminCvTemplateSectionController> logger)
        {
            _sectionService = sectionService;
            _logger = logger;
        }

        [HttpGet("{templateId:guid}/sections")]
        public async Task<IActionResult> GetTemplateSections(Guid templateId)
        {
            try
            {
                var response = await _sectionService.GetTemplateSectionsAsync(templateId);
                return Ok(response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ProblemDetails { Title = "Not Found", Detail = ex.Message, Status = 404 });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sections for template {TemplateId}", templateId);
                return StatusCode(500, new ProblemDetails { Title = "Internal Server Error", Detail = "An unexpected error occurred.", Status = 500 });
            }
        }

        [HttpPost("{templateId:guid}/sections")]
        public async Task<IActionResult> AddSection(Guid templateId, [FromBody] AddSectionRequestDto dto)
        {
            try
            {
                var response = await _sectionService.AddSectionAsync(templateId, dto);
                return CreatedAtAction(nameof(GetTemplateSections), new { templateId = templateId }, response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ProblemDetails { Title = "Not Found", Detail = ex.Message, Status = 404 });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new ProblemDetails { Title = "Conflict", Detail = ex.Message, Status = 409 });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding section to template {TemplateId}", templateId);
                return StatusCode(500, new ProblemDetails { Title = "Internal Server Error", Detail = "An unexpected error occurred.", Status = 500 });
            }
        }

        [HttpPut("{templateId:guid}/sections/{sectionId:guid}")]
        public async Task<IActionResult> UpdateSection(Guid templateId, Guid sectionId, [FromBody] UpdateSectionRequestDto dto)
        {
            try
            {
                var response = await _sectionService.UpdateSectionAsync(templateId, sectionId, dto);
                return Ok(response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ProblemDetails { Title = "Not Found", Detail = ex.Message, Status = 404 });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating section {SectionId} for template {TemplateId}", sectionId, templateId);
                return StatusCode(500, new ProblemDetails { Title = "Internal Server Error", Detail = "An unexpected error occurred.", Status = 500 });
            }
        }

        [HttpPut("{templateId:guid}/containers/{containerId:guid}")]
        public async Task<IActionResult> UpdateContainer(Guid templateId, Guid containerId, [FromBody] UpdateContainerRequestDto dto)
        {
            try
            {
                var response = await _sectionService.UpdateContainerAsync(templateId, containerId, dto);
                return Ok(response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ProblemDetails { Title = "Not Found", Detail = ex.Message, Status = 404 });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating container {ContainerId} for template {TemplateId}", containerId, templateId);
                return StatusCode(500, new ProblemDetails { Title = "Internal Server Error", Detail = "An unexpected error occurred.", Status = 500 });
            }
        }

        [HttpPut("{templateId:guid}/sections/reorder")]
        public async Task<IActionResult> ReorderSections(Guid templateId, [FromBody] ReorderSectionDto dto)
        {
            try
            {
                var response = await _sectionService.ReorderSectionsAsync(templateId, dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reordering sections for template {TemplateId}", templateId);
                return StatusCode(500, new ProblemDetails { Title = "Internal Server Error", Detail = "An unexpected error occurred.", Status = 500 });
            }
        }

        [HttpDelete("{templateId:guid}/sections/{sectionId:guid}")]
        public async Task<IActionResult> DeleteSection(Guid templateId, Guid sectionId)
        {
            try
            {
                var adminIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0";
                int.TryParse(adminIdStr, out int adminId);
                
                await _sectionService.DeleteSectionAsync(templateId, sectionId, adminId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ProblemDetails { Title = "Not Found", Detail = ex.Message, Status = 404 });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ProblemDetails { Title = "Bad Request", Detail = ex.Message, Status = 400 });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting section {SectionId} from template {TemplateId}", sectionId, templateId);
                return StatusCode(500, new ProblemDetails { Title = "Internal Server Error", Detail = "An unexpected error occurred.", Status = 500 });
            }
        }

        [HttpPost("{templateId:guid}/sections/{sectionId:guid}/restore")]
        public async Task<IActionResult> RestoreSection(Guid templateId, Guid sectionId)
        {
            try
            {
                var adminIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0";
                int.TryParse(adminIdStr, out int adminId);
                
                var response = await _sectionService.RestoreSectionAsync(templateId, sectionId, adminId);
                return Ok(response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ProblemDetails { Title = "Not Found", Detail = ex.Message, Status = 404 });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new ProblemDetails { Title = "Conflict", Detail = ex.Message, Status = 409 });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restoring section {SectionId} in template {TemplateId}", sectionId, templateId);
                return StatusCode(500, new ProblemDetails { Title = "Internal Server Error", Detail = "An unexpected error occurred.", Status = 500 });
            }
        }

        [HttpPost("{templateId:guid}/validate")]
        public async Task<IActionResult> ValidateTemplate(Guid templateId)
        {
            try
            {
                var response = await _sectionService.ValidateTemplateAsync(templateId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating template {TemplateId}", templateId);
                return StatusCode(500, new ProblemDetails { Title = "Internal Server Error", Detail = "An unexpected error occurred.", Status = 500 });
            }
        }
    }
}
