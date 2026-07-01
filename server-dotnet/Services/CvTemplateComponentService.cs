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
    public class CvTemplateComponentService : ICvTemplateComponentService
    {
        private readonly ICvTemplateComponentRepository _componentRepository;
        private readonly ICvTemplateSectionRepository _sectionRepository;
        private readonly ICvTemplateRepository _templateRepository;

        public CvTemplateComponentService(
            ICvTemplateComponentRepository componentRepository,
            ICvTemplateSectionRepository sectionRepository,
            ICvTemplateRepository templateRepository)
        {
            _componentRepository = componentRepository;
            _sectionRepository = sectionRepository;
            _templateRepository = templateRepository;
        }

        public async Task<ComponentLibraryResponseDto> GetComponentLibraryAsync(Guid templateId, Guid? sectionId)
        {
            // Verify template
            var template = await _templateRepository.GetByIdAsync(templateId, includeComponents: false);
            if (template == null) throw new KeyNotFoundException("Template not found");

            // Verify section if provided
            CvTemplateSection? section = null;
            if (sectionId.HasValue)
            {
                section = await _sectionRepository.GetSectionAsync(templateId, sectionId.Value);
                if (section == null)
                {
                    throw new KeyNotFoundException("Section not found in this template");
                }
            }

            var allDefs = await _componentRepository.GetAllDefinitionsAsync();
            var categories = new List<ComponentLibraryCategoryDto>();

            var grouped = allDefs.GroupBy(d => d.Category);
            foreach (var g in grouped)
            {
                var catDto = new ComponentLibraryCategoryDto(
                    Name: g.Key,
                    Items: g.Select(MapToDefinitionDto).ToList()
                );
                categories.Add(catDto);
            }

            // Optional: Filter compatible based on section if section is selected
            object? selectedSectionObj = null;
            if (section != null)
            {
                var sectionLibrary = await _sectionRepository.GetSectionLibraryAsync();
                var sectionDef = sectionLibrary.FirstOrDefault(d => d.Id == section.SectionDefinitionId);
                selectedSectionObj = new
                {
                    Id = section.Id,
                    SectionType = sectionDef?.SectionType ?? "Unknown"
                };
            }

            return new ComponentLibraryResponseDto(
                SelectedSection: selectedSectionObj,
                Categories: categories,
                Favorites: new List<ComponentDefinitionDto>(), // Mock empty
                RecentlyUsed: new List<ComponentDefinitionDto>() // Mock empty
            );
        }

        public async Task<IEnumerable<ComponentDto>> GetComponentsBySectionIdAsync(Guid templateId, Guid sectionId)
        {
            var section = await _sectionRepository.GetSectionAsync(templateId, sectionId);
            if (section == null || section.TemplateId != templateId)
            {
                throw new KeyNotFoundException("Section not found in this template");
            }

            var components = await _componentRepository.GetComponentsBySectionIdAsync(sectionId);
            return components.Select(MapToComponentDto).ToList();
        }

        public async Task<ComponentDto> AddComponentAsync(Guid templateId, Guid sectionId, AddComponentRequestDto dto)
        {
            var section = await _sectionRepository.GetSectionAsync(templateId, sectionId);
            if (section == null || section.TemplateId != templateId)
            {
                throw new KeyNotFoundException("Section not found in this template");
            }

            var definition = await _componentRepository.GetDefinitionByTypeAsync(dto.ComponentType);
            if (definition == null)
            {
                throw new ArgumentException($"Unknown component type: {dto.ComponentType}");
            }

            // Check if single instance
            if (definition.IsSingleInstance)
            {
                var existingComponents = await _componentRepository.GetComponentsBySectionIdAsync(sectionId);
                if (existingComponents.Any(c => c.ComponentDefinitionId == definition.Id))
                {
                    throw new InvalidOperationException($"Component {dto.ComponentType} only allows a single instance per section.");
                }
            }

            // Check ParentComponentId validity
            if (dto.ParentComponentId.HasValue)
            {
                var parent = await _componentRepository.GetComponentByIdAsync(dto.ParentComponentId.Value);
                if (parent == null || parent.SectionId != sectionId)
                {
                    throw new ArgumentException("Parent component not found in this section");
                }
                var parentDef = await _componentRepository.GetAllDefinitionsAsync(); // optimization needed, but fine for now
                var pd = parentDef.FirstOrDefault(d => d.Id == parent.ComponentDefinitionId);
                if (pd == null || !pd.IsContainer)
                {
                    throw new InvalidOperationException("Specified parent component is not a container");
                }
            }

            var components = await _componentRepository.GetComponentsBySectionIdAsync(sectionId);
            int newOrder = 0;
            if (components.Any())
            {
                var siblings = components.Where(c => c.ParentComponentId == dto.ParentComponentId);
                if (siblings.Any())
                {
                    newOrder = siblings.Max(c => c.OrderIndex) + 1;
                }
            }

            var component = new CvTemplateComponent
            {
                TemplateId = templateId,
                SectionId = sectionId,
                ParentComponentId = dto.ParentComponentId,
                ComponentDefinitionId = definition.Id,
                DisplayName = definition.Name,
                Variant = dto.Variant ?? definition.DefaultVariant,
                BindingPath = definition.DefaultBindingPath,
                OrderIndex = newOrder,
                PropertiesJson = "{}",
                IsHidden = false,
                IsLocked = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _componentRepository.AddComponentAsync(component);

            // Update template timestamp
            var template = await _templateRepository.GetByIdAsync(templateId, includeComponents: false);
            if (template != null)
            {
                template.UpdatedAt = DateTime.UtcNow;
                await _templateRepository.UpdateAsync(template);
            }

            await _componentRepository.SaveChangesAsync();

            // Populate navigation property manually for DTO mapping
            component.ComponentDefinition = definition;

            return MapToComponentDto(component);
        }

        public async Task<ComponentDto> UpdateComponentAsync(Guid templateId, Guid sectionId, Guid componentId, UpdateComponentRequestDto dto)
        {
            var component = await _componentRepository.GetComponentByIdAsync(componentId);
            if (component == null || component.TemplateId != templateId || component.SectionId != sectionId)
            {
                throw new KeyNotFoundException("Component not found");
            }

            if (dto.DisplayName != null) component.DisplayName = dto.DisplayName;
            if (dto.Variant != null) component.Variant = dto.Variant;
            if (dto.BindingPath != null) component.BindingPath = dto.BindingPath;
            if (dto.PropertiesJson != null)
            {
                ValidateJson(dto.PropertiesJson);
                component.PropertiesJson = dto.PropertiesJson;
            }
            if (dto.IsHidden.HasValue) component.IsHidden = dto.IsHidden.Value;
            if (dto.IsLocked.HasValue) component.IsLocked = dto.IsLocked.Value;

            if (dto.ParentComponentId.HasValue && dto.ParentComponentId.Value != Guid.Empty)
            {
                var parent = await _componentRepository.GetComponentByIdAsync(dto.ParentComponentId.Value);
                if (parent == null || parent.SectionId != sectionId)
                {
                    throw new ArgumentException("Parent component not found in this section");
                }
                component.ParentComponentId = dto.ParentComponentId.Value;
            }
            else if (dto.ParentComponentId.HasValue && dto.ParentComponentId.Value == Guid.Empty)
            {
                component.ParentComponentId = null;
            }

            component.UpdatedAt = DateTime.UtcNow;

            await _componentRepository.UpdateComponentAsync(component);

            // Update template timestamp
            var template = await _templateRepository.GetByIdAsync(templateId, includeComponents: false);
            if (template != null)
            {
                template.UpdatedAt = DateTime.UtcNow;
                await _templateRepository.UpdateAsync(template);
            }

            await _componentRepository.SaveChangesAsync();

            // Refetch to get ComponentDefinition
            var defs = await _componentRepository.GetAllDefinitionsAsync();
            component.ComponentDefinition = defs.First(d => d.Id == component.ComponentDefinitionId);

            return MapToComponentDto(component);
        }

        public async Task DeleteComponentAsync(Guid templateId, Guid sectionId, Guid componentId)
        {
            var component = await _componentRepository.GetComponentByIdAsync(componentId);
            if (component == null || component.TemplateId != templateId || component.SectionId != sectionId)
            {
                throw new KeyNotFoundException("Component not found");
            }

            // Soft delete logic handled by interceptor if implemented, or just mark IsDeleted = true
            // Here we do a physical delete or soft delete depending on EF Core config.
            component.IsDeleted = true;
            component.DeletedAt = DateTime.UtcNow;

            // Also delete children recursively
            await SoftDeleteChildren(componentId);

            await _componentRepository.UpdateComponentAsync(component);

            // Update template timestamp
            var template = await _templateRepository.GetByIdAsync(templateId, includeComponents: false);
            if (template != null)
            {
                template.UpdatedAt = DateTime.UtcNow;
                await _templateRepository.UpdateAsync(template);
            }

            await _componentRepository.SaveChangesAsync();
        }

        private async Task SoftDeleteChildren(Guid parentId)
        {
            var children = await _componentRepository.GetChildComponentsAsync(parentId);
            foreach(var child in children)
            {
                child.IsDeleted = true;
                child.DeletedAt = DateTime.UtcNow;
                await _componentRepository.UpdateComponentAsync(child);
                await SoftDeleteChildren(child.Id);
            }
        }

        public async Task ReorderComponentsAsync(Guid templateId, Guid sectionId, List<ReorderComponentItemDto> items)
        {
            var section = await _sectionRepository.GetSectionAsync(templateId, sectionId);
            if (section == null || section.TemplateId != templateId)
            {
                throw new KeyNotFoundException("Section not found in this template");
            }

            var components = await _componentRepository.GetComponentsBySectionIdAsync(sectionId);
            
            foreach (var item in items)
            {
                var comp = components.FirstOrDefault(c => c.Id == item.ComponentId);
                if (comp != null)
                {
                    comp.OrderIndex = item.OrderIndex;
                    if (item.ParentComponentId.HasValue && item.ParentComponentId.Value == Guid.Empty)
                    {
                        comp.ParentComponentId = null;
                    }
                    else if (item.ParentComponentId.HasValue)
                    {
                        comp.ParentComponentId = item.ParentComponentId;
                    }
                    
                    comp.UpdatedAt = DateTime.UtcNow;
                    await _componentRepository.UpdateComponentAsync(comp);
                }
            }

            // Update template timestamp
            var template = await _templateRepository.GetByIdAsync(templateId, includeComponents: false);
            if (template != null)
            {
                template.UpdatedAt = DateTime.UtcNow;
                await _templateRepository.UpdateAsync(template);
            }

            await _componentRepository.SaveChangesAsync();
        }

        private void ValidateJson(string json)
        {
            if (string.IsNullOrWhiteSpace(json)) return;
            try
            {
                using var document = JsonDocument.Parse(json);
            }
            catch (JsonException)
            {
                throw new ArgumentException("Invalid JSON format");
            }
        }

        private ComponentDefinitionDto MapToDefinitionDto(CvComponentDefinition d)
        {
            return new ComponentDefinitionDto(
                Id: d.Id,
                ComponentType: d.ComponentType,
                Name: d.Name,
                Description: d.Description,
                Category: d.Category,
                DefaultBindingPath: d.DefaultBindingPath,
                DefaultVariant: d.DefaultVariant,
                SupportedVariantsJson: ParseJsonSafe(d.SupportedVariantsJson),
                CompatibleSectionTypesJson: ParseJsonSafe(d.CompatibleSectionTypesJson),
                IsRepeatable: d.IsRepeatable,
                IsBindable: d.IsBindable,
                IsContainer: d.IsContainer,
                IsSingleInstance: d.IsSingleInstance,
                SortOrder: d.SortOrder,
                IsActive: d.IsActive
            );
        }

        private ComponentDto MapToComponentDto(CvTemplateComponent c)
        {
            return new ComponentDto(
                Id: c.Id,
                TemplateId: c.TemplateId,
                SectionId: c.SectionId,
                ParentComponentId: c.ParentComponentId,
                ComponentDefinitionId: c.ComponentDefinitionId,
                DisplayName: c.DisplayName,
                ComponentType: c.ComponentDefinition?.ComponentType ?? "Unknown", // Required navigation prop
                Variant: c.Variant,
                BindingPath: c.BindingPath,
                OrderIndex: c.OrderIndex,
                PropertiesJson: ParseJsonSafe(c.PropertiesJson),
                IsHidden: c.IsHidden,
                IsLocked: c.IsLocked,
                IsDeleted: c.IsDeleted,
                CreatedAt: c.CreatedAt,
                UpdatedAt: c.UpdatedAt
            );
        }

        private object ParseJsonSafe(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return new object();
            try
            {
                return JsonSerializer.Deserialize<object>(json) ?? new object();
            }
            catch
            {
                return new object();
            }
        }
    }
}
