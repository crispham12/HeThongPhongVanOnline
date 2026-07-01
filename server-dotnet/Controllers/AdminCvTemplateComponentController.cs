using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/admin/cv-templates/{templateId}/sections/{sectionId}/components")]
    [Authorize(Roles = "Admin")]
    public class AdminCvTemplateComponentController : ControllerBase
    {
        private readonly ICvTemplateComponentService _componentService;

        public AdminCvTemplateComponentController(ICvTemplateComponentService componentService)
        {
            _componentService = componentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetComponents(Guid templateId, Guid sectionId)
        {
            try
            {
                var components = await _componentService.GetComponentsBySectionIdAsync(templateId, sectionId);
                return Ok(components);
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

        [HttpPost]
        public async Task<IActionResult> AddComponent(Guid templateId, Guid sectionId, [FromBody] AddComponentRequestDto dto)
        {
            try
            {
                var component = await _componentService.AddComponentAsync(templateId, sectionId, dto);
                return Ok(component);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{componentId}")]
        public async Task<IActionResult> UpdateComponent(Guid templateId, Guid sectionId, Guid componentId, [FromBody] UpdateComponentRequestDto dto)
        {
            try
            {
                var component = await _componentService.UpdateComponentAsync(templateId, sectionId, componentId, dto);
                return Ok(component);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("{componentId}")]
        public async Task<IActionResult> DeleteComponent(Guid templateId, Guid sectionId, Guid componentId)
        {
            try
            {
                await _componentService.DeleteComponentAsync(templateId, sectionId, componentId);
                return Ok(new { message = "Component deleted successfully." });
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

        [HttpPut("reorder")]
        public async Task<IActionResult> ReorderComponents(Guid templateId, Guid sectionId, [FromBody] List<ReorderComponentItemDto> dtos)
        {
            try
            {
                await _componentService.ReorderComponentsAsync(templateId, sectionId, dtos);
                return Ok(new { message = "Components reordered successfully." });
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

    [ApiController]
    [Route("api/admin/cv-templates/{templateId}/component-library")]
    [Authorize(Roles = "Admin")]
    public class AdminComponentLibraryController : ControllerBase
    {
        private readonly ICvTemplateComponentService _componentService;

        public AdminComponentLibraryController(ICvTemplateComponentService componentService)
        {
            _componentService = componentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetComponentLibrary(Guid templateId, [FromQuery] Guid? sectionId)
        {
            try
            {
                var library = await _componentService.GetComponentLibraryAsync(templateId, sectionId);
                return Ok(library);
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
