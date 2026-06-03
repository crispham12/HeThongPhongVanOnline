using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/admin/cv-templates")]
    [Authorize(Roles = "Admin")]
    public class AdminCvTemplatesController : ControllerBase
    {
        private readonly ICvTemplateService _service;

        public AdminCvTemplatesController(ICvTemplateService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetTemplates()
        {
            try
            {
                var templates = await _service.GetTemplatesAsync();
                return Ok(templates);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTemplateDetail(Guid id)
        {
            try
            {
                var template = await _service.GetTemplateDetailAsync(id);
                return Ok(template);
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
        public async Task<IActionResult> CreateTemplate([FromBody] CvTemplateCreateDto dto)
        {
            try
            {
                var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (adminIdClaim == null) return Unauthorized("Không xác định được Admin.");
                int adminId = int.Parse(adminIdClaim.Value);

                var template = await _service.CreateTemplateAsync(dto, adminId);
                return CreatedAtAction(nameof(GetTemplateDetail), new { id = template.Id }, template);
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

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTemplate(Guid id, [FromBody] CvTemplateUpdateDto dto)
        {
            try
            {
                var template = await _service.UpdateTemplateAsync(id, dto);
                return Ok(template);
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTemplate(Guid id)
        {
            try
            {
                await _service.DeleteTemplateAsync(id);
                return Ok(new { message = "Xóa mẫu CV thành công." });
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

        [HttpPost("{id}/publish")]
        public async Task<IActionResult> PublishTemplate(Guid id)
        {
            try
            {
                var template = await _service.PublishTemplateAsync(id);
                return Ok(template);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("{id}/unpublish")]
        public async Task<IActionResult> UnpublishTemplate(Guid id)
        {
            try
            {
                var template = await _service.UnpublishTemplateAsync(id);
                return Ok(template);
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

        [HttpPost("{id}/components")]
        public async Task<IActionResult> AddComponent(Guid id, [FromBody] CvTemplateComponentCreateDto dto)
        {
            try
            {
                if (dto.TemplateId != id)
                {
                    return BadRequest(new { message = "TemplateId trong body phải khớp với id trên URL." });
                }

                var component = await _service.AddComponentAsync(dto);
                return Ok(component); // Standard OK response containing the newly created component
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

        [HttpPut("{id}/components/{componentId}")]
        public async Task<IActionResult> UpdateComponent(Guid id, Guid componentId, [FromBody] CvTemplateComponentUpdateDto dto)
        {
            try
            {
                var component = await _service.UpdateComponentAsync(id, componentId, dto);
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

        [HttpDelete("{id}/components/{componentId}")]
        public async Task<IActionResult> DeleteComponent(Guid id, Guid componentId)
        {
            try
            {
                await _service.DeleteComponentAsync(id, componentId);
                return Ok(new { message = "Xóa component khỏi mẫu CV thành công." });
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

        [HttpPut("{id}/components/reorder")]
        public async Task<IActionResult> ReorderComponents(Guid id, [FromBody] ComponentReorderDto dto)
        {
            try
            {
                await _service.ReorderComponentsAsync(id, dto);
                return Ok(new { message = "Cập nhật zIndex / thứ tự layers thành công." });
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
