using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace InterviewPro.API.Services
{
    public class CvTemplateService : ICvTemplateService
    {
        private readonly ICvTemplateRepository _repository;
        private static readonly HashSet<string> ValidComponentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "label", "image", "shape", "line", "section"
        };

        public CvTemplateService(ICvTemplateRepository repository)
        {
            _repository = repository;
        }

        public async Task<CvTemplateResponseDto> CreateTemplateAsync(CvTemplateCreateDto dto, int adminId)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ArgumentException("Tên mẫu CV không được để trống.");
            }

            if (dto.Width <= 0 || dto.Height <= 0)
            {
                throw new ArgumentException("Kích thước chiều rộng và chiều cao phải lớn hơn 0.");
            }

            var template = new CvTemplate
            {
                Name = dto.Name.Trim(),
                Description = dto.Description?.Trim() ?? string.Empty,
                Width = dto.Width,
                Height = dto.Height,
                BackgroundColor = string.IsNullOrWhiteSpace(dto.BackgroundColor) ? "#FFFFFF" : dto.BackgroundColor.Trim(),
                IsPublished = false,
                CreatedByAdminId = adminId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _repository.AddAsync(template);
            await _repository.SaveChangesAsync();

            return MapToResponseDto(template);
        }

        public async Task<CvTemplateResponseDto> UpdateTemplateAsync(Guid id, CvTemplateUpdateDto dto)
        {
            var template = await _repository.GetByIdAsync(id, includeComponents: true);
            if (template == null)
            {
                throw new KeyNotFoundException("Không tìm thấy mẫu CV này.");
            }

            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ArgumentException("Tên mẫu CV không được để trống.");
            }

            if (dto.Width <= 0 || dto.Height <= 0)
            {
                throw new ArgumentException("Kích thước chiều rộng và chiều cao phải lớn hơn 0.");
            }

            template.Name = dto.Name.Trim();
            template.Description = dto.Description?.Trim() ?? string.Empty;
            template.Width = dto.Width;
            template.Height = dto.Height;
            template.BackgroundColor = string.IsNullOrWhiteSpace(dto.BackgroundColor) ? "#FFFFFF" : dto.BackgroundColor.Trim();
            template.ThumbnailUrl = dto.ThumbnailUrl?.Trim() ?? string.Empty;
            template.IsPublished = dto.IsPublished;
            template.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(template);
            await _repository.SaveChangesAsync();

            return MapToResponseDto(template);
        }

        public async Task DeleteTemplateAsync(Guid id)
        {
            var template = await _repository.GetByIdAsync(id, includeComponents: false);
            if (template == null)
            {
                throw new KeyNotFoundException("Không tìm thấy mẫu CV này.");
            }

            await _repository.DeleteAsync(template);
            await _repository.SaveChangesAsync();
        }

        public async Task<IEnumerable<CvTemplateResponseDto>> GetTemplatesAsync()
        {
            var templates = await _repository.GetAllAsync();
            return templates.Select(MapToResponseDto);
        }

        public async Task<CvTemplateResponseDto> GetTemplateDetailAsync(Guid id)
        {
            var template = await _repository.GetByIdAsync(id, includeComponents: true);
            if (template == null)
            {
                throw new KeyNotFoundException("Không tìm thấy mẫu CV này.");
            }

            return MapToResponseDto(template);
        }

        public async Task<CvTemplateResponseDto> PublishTemplateAsync(Guid id)
        {
            var template = await _repository.GetByIdAsync(id, includeComponents: true);
            if (template == null)
            {
                throw new KeyNotFoundException("Không tìm thấy mẫu CV này.");
            }

            if (!template.Components.Any())
            {
                throw new InvalidOperationException("Không thể xuất bản mẫu CV trống (phải có ít nhất 1 component).");
            }

            template.IsPublished = true;
            template.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(template);
            await _repository.SaveChangesAsync();

            return MapToResponseDto(template);
        }

        public async Task<CvTemplateResponseDto> UnpublishTemplateAsync(Guid id)
        {
            var template = await _repository.GetByIdAsync(id, includeComponents: false);
            if (template == null)
            {
                throw new KeyNotFoundException("Không tìm thấy mẫu CV này.");
            }

            template.IsPublished = false;
            template.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(template);
            await _repository.SaveChangesAsync();

            return MapToResponseDto(template);
        }

        public async Task<CvTemplateComponentResponseDto> AddComponentAsync(CvTemplateComponentCreateDto dto)
        {
            var template = await _repository.GetByIdAsync(dto.TemplateId, includeComponents: false);
            if (template == null)
            {
                throw new KeyNotFoundException("Không tìm thấy mẫu CV liên quan.");
            }

            if (!ValidComponentTypes.Contains(dto.Type))
            {
                throw new ArgumentException($"Loại component '{dto.Type}' không hợp lệ.");
            }

            if (dto.Width < 0 || dto.Height < 0)
            {
                throw new ArgumentException("Kích thước component phải lớn hơn hoặc bằng 0.");
            }

            ValidateStyleJson(dto.StyleJson);

            var component = new CvTemplateComponent
            {
                TemplateId = dto.TemplateId,
                Type = dto.Type.ToLowerInvariant(),
                Content = dto.Content ?? string.Empty,
                X = dto.X,
                Y = dto.Y,
                Width = dto.Width,
                Height = dto.Height,
                Rotation = dto.Rotation,
                ZIndex = dto.ZIndex,
                StyleJson = string.IsNullOrWhiteSpace(dto.StyleJson) ? "{}" : dto.StyleJson.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _repository.AddComponentAsync(component);
            
            // Touch template update time
            template.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(template);

            await _repository.SaveChangesAsync();

            return MapToComponentResponseDto(component);
        }

        public async Task<CvTemplateComponentResponseDto> UpdateComponentAsync(Guid templateId, Guid componentId, CvTemplateComponentUpdateDto dto)
        {
            var component = await _repository.GetComponentByIdAsync(componentId);
            if (component == null || component.TemplateId != templateId)
            {
                throw new KeyNotFoundException("Không tìm thấy component này trong mẫu CV đã chỉ định.");
            }

            if (dto.Width < 0 || dto.Height < 0)
            {
                throw new ArgumentException("Kích thước component phải lớn hơn hoặc bằng 0.");
            }

            ValidateStyleJson(dto.StyleJson);

            component.Content = dto.Content ?? string.Empty;
            component.X = dto.X;
            component.Y = dto.Y;
            component.Width = dto.Width;
            component.Height = dto.Height;
            component.Rotation = dto.Rotation;
            component.ZIndex = dto.ZIndex;
            component.StyleJson = string.IsNullOrWhiteSpace(dto.StyleJson) ? "{}" : dto.StyleJson.Trim();
            component.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateComponentAsync(component);

            // Touch template update time
            var template = await _repository.GetByIdAsync(templateId, includeComponents: false);
            if (template != null)
            {
                template.UpdatedAt = DateTime.UtcNow;
                await _repository.UpdateAsync(template);
            }

            await _repository.SaveChangesAsync();

            return MapToComponentResponseDto(component);
        }

        public async Task DeleteComponentAsync(Guid templateId, Guid componentId)
        {
            var component = await _repository.GetComponentByIdAsync(componentId);
            if (component == null || component.TemplateId != templateId)
            {
                throw new KeyNotFoundException("Không tìm thấy component này trong mẫu CV đã chỉ định.");
            }

            await _repository.DeleteComponentAsync(component);

            // Touch template update time
            var template = await _repository.GetByIdAsync(templateId, includeComponents: false);
            if (template != null)
            {
                template.UpdatedAt = DateTime.UtcNow;
                await _repository.UpdateAsync(template);
            }

            await _repository.SaveChangesAsync();
        }

        public async Task ReorderComponentsAsync(Guid templateId, ComponentReorderDto dto)
        {
            var template = await _repository.GetByIdAsync(templateId, includeComponents: true);
            if (template == null)
            {
                throw new KeyNotFoundException("Không tìm thấy mẫu CV này.");
            }

            foreach (var reorderItem in dto.Reorders)
            {
                var component = template.Components.FirstOrDefault(c => c.Id == reorderItem.ComponentId);
                if (component != null)
                {
                    component.ZIndex = reorderItem.ZIndex;
                    component.UpdatedAt = DateTime.UtcNow;
                    await _repository.UpdateComponentAsync(component);
                }
            }

            template.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(template);

            await _repository.SaveChangesAsync();
        }

        private void ValidateStyleJson(string json)
        {
            if (string.IsNullOrWhiteSpace(json)) return;
            try
            {
                using var document = JsonDocument.Parse(json);
            }
            catch (JsonException)
            {
                throw new ArgumentException("StyleJson không phải là chuỗi JSON hợp lệ.");
            }
        }

        private static CvTemplateResponseDto MapToResponseDto(CvTemplate template)
        {
            return new CvTemplateResponseDto(
                template.Id,
                template.Name,
                template.Description,
                template.Width,
                template.Height,
                template.BackgroundColor,
                template.ThumbnailUrl,
                template.IsPublished,
                template.Components?.Select(MapToComponentResponseDto).OrderBy(c => c.ZIndex) ?? Enumerable.Empty<CvTemplateComponentResponseDto>(),
                template.CreatedAt,
                template.UpdatedAt
            );
        }

        private static CvTemplateComponentResponseDto MapToComponentResponseDto(CvTemplateComponent component)
        {
            object parsedStyle;
            try
            {
                parsedStyle = JsonSerializer.Deserialize<object>(component.StyleJson) ?? new object();
            }
            catch
            {
                parsedStyle = new object();
            }

            return new CvTemplateComponentResponseDto(
                component.Id,
                component.TemplateId,
                component.Type,
                component.Content,
                component.X,
                component.Y,
                component.Width,
                component.Height,
                component.Rotation,
                component.ZIndex,
                parsedStyle,
                component.CreatedAt,
                component.UpdatedAt
            );
        }
    }
}
