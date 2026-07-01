using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;

namespace InterviewPro.API.Services
{
    public class CvTemplateSectionService : ICvTemplateSectionService
    {
        private readonly ICvTemplateSectionRepository _repository;
        private readonly ILogger<CvTemplateSectionService> _logger;

        public CvTemplateSectionService(
            ICvTemplateSectionRepository repository,
            ILogger<CvTemplateSectionService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<TemplateSectionsResponseDto> GetTemplateSectionsAsync(Guid templateId)
        {
            var template = await _repository.GetTemplateByIdAsync(templateId);
            if (template == null)
            {
                throw new KeyNotFoundException("Template not found");
            }

            var sections = await _repository.GetTemplateSectionsAsync(templateId);
            var containers = await _repository.GetTemplateContainersAsync(templateId);
            var library = await GetSectionLibraryAsync();
            var progress = await CalculateProgressAsync(templateId);
            var validation = await ValidateTemplateAsync(templateId);

            return new TemplateSectionsResponseDto
            {
                Containers = containers.Select(MapContainerToDto).ToList(),
                Sections = sections.Select(MapToDto).ToList(),
                Library = library,
                Progress = progress,
                Validation = validation
            };
        }

        public async Task<SectionLibraryDto> GetSectionLibraryAsync()
        {
            var definitions = await _repository.GetSectionLibraryAsync();
            var categories = definitions.GroupBy(d => d.Category)
                .Select(g => new SectionCategoryDto
                {
                    Category = g.Key,
                    Items = g.Select(d => new SectionLibraryItemDto
                    {
                        Id = d.Id,
                        SectionType = d.SectionType,
                        Name = d.Name,
                        Description = d.Description,
                        Category = d.Category,
                        DefaultBindingPath = d.DefaultBindingPath,
                        Icon = d.Icon,
                        SortOrder = d.SortOrder,
                        IsRequired = d.IsRequired,
                        IsRepeatable = d.IsRepeatable,
                        IsSingleInstance = d.IsSingleInstance,
                        IsATSFriendly = d.IsATSFriendly
                    }).ToList()
                }).ToList();

            return new SectionLibraryDto { Categories = categories };
        }

        public async Task<SectionDto> AddSectionAsync(Guid templateId, AddSectionRequestDto dto)
        {
            var template = await _repository.GetTemplateByIdAsync(templateId);
            if (template == null) throw new KeyNotFoundException("Template not found");

            var definition = await _repository.GetSectionDefinitionByTypeAsync(dto.SectionType);
            if (definition == null) throw new KeyNotFoundException("Section type not found in library");

            var allSections = (await _repository.GetTemplateSectionsIncludingDeletedAsync(templateId)).ToList();
            var activeSections = allSections.Where(s => !s.IsDeleted).ToList();

            if (definition.IsSingleInstance)
            {
                var existing = allSections.FirstOrDefault(s => s.SectionDefinitionId == definition.Id);
                if (existing != null)
                {
                    if (!existing.IsDeleted)
                    {
                        throw new InvalidOperationException($"Section {definition.Name} is single-instance and already exists in this template.");
                    }
                    else
                    {
                        // Restore instead of creating new
                        existing.IsDeleted = false;
                        existing.Status = "Added";
                        existing.UpdatedAt = DateTime.UtcNow;
                        existing.OrderIndex = activeSections.Any() ? activeSections.Max(s => s.OrderIndex) + 1 : 1;
                        // RestoredAt and RestoredBy should be updated but we don't have adminId here. We can skip or leave as null for Add.
                        
                        _repository.UpdateSection(existing);
                        await _repository.SaveChangesAsync();
                        await NormalizeSectionOrderAsync(templateId);
                        
                        _logger.LogInformation("Restored single-instance section {SectionType} to template {TemplateId}", dto.SectionType, templateId);
                        
                        existing.SectionDefinition = definition;
                        return MapToDto(existing);
                    }
                }
            }

            var newOrderIndex = activeSections.Any() ? activeSections.Max(s => s.OrderIndex) + 1 : 1;

            // Ensure a container exists
            var currentContainers = (await _repository.GetTemplateContainersAsync(templateId)).ToList();
            var targetContainer = currentContainers.LastOrDefault();
            if (targetContainer == null)
            {
                targetContainer = new CvTemplateContainer
                {
                    TemplateId = templateId,
                    LayoutType = "OneColumn",
                    OrderIndex = 1,
                    ConfigJson = "{}"
                };
                await _repository.AddContainerAsync(targetContainer);
                await _repository.SaveChangesAsync();
            }

            var newSection = new CvTemplateSection
            {
                TemplateId = templateId,
                SectionDefinitionId = definition.Id,
                ContainerId = targetContainer.Id,
                ColumnIndex = 0,
                LayoutConfigJson = "{}",
                DisplayName = definition.Name,
                Description = definition.Description,
                BindingPath = definition.DefaultBindingPath,
                OrderIndex = newOrderIndex,
                Status = "Added",
                IsRequired = definition.IsRequired,
                IsRepeatable = definition.IsRepeatable,
                IsHidden = false,
                IsLocked = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _repository.AddSectionAsync(newSection);
            await _repository.SaveChangesAsync();
            
            _logger.LogInformation("Added section {SectionType} to template {TemplateId}", dto.SectionType, templateId);

            newSection.SectionDefinition = definition;
            return MapToDto(newSection);
        }

        public async Task<SectionDto> UpdateSectionAsync(Guid templateId, Guid sectionId, UpdateSectionRequestDto dto)
        {
            var section = await _repository.GetSectionAsync(templateId, sectionId);
            if (section == null) throw new KeyNotFoundException("Section not found in template");

            if (dto.DisplayName != null) section.DisplayName = dto.DisplayName;
            if (dto.Description != null) section.Description = dto.Description;
            if (dto.BindingPath != null) section.BindingPath = dto.BindingPath;
            if (dto.IsHidden.HasValue) section.IsHidden = dto.IsHidden.Value;
            if (dto.IsLocked.HasValue) section.IsLocked = dto.IsLocked.Value;
            
            if (dto.ContainerId.HasValue) section.ContainerId = dto.ContainerId.Value;
            if (dto.ColumnIndex.HasValue) section.ColumnIndex = dto.ColumnIndex.Value;
            if (dto.LayoutConfigJson != null) section.LayoutConfigJson = dto.LayoutConfigJson;

            section.UpdatedAt = DateTime.UtcNow;

            _repository.UpdateSection(section);
            await _repository.SaveChangesAsync();
            
            _logger.LogInformation("Updated section {SectionId} in template {TemplateId}", sectionId, templateId);

            return MapToDto(section);
        }

        public async Task<ContainerDto> UpdateContainerAsync(Guid templateId, Guid containerId, UpdateContainerRequestDto dto)
        {
            var container = await _repository.GetContainerAsync(templateId, containerId);
            if (container == null) throw new KeyNotFoundException("Container not found in template");

            if (dto.LayoutType != null) container.LayoutType = dto.LayoutType;
            if (dto.ConfigJson != null) container.ConfigJson = dto.ConfigJson;

            container.UpdatedAt = DateTime.UtcNow;

            _repository.UpdateContainer(container);
            await _repository.SaveChangesAsync();

            return MapContainerToDto(container);
        }

        public async Task DeleteSectionAsync(Guid templateId, Guid sectionId, int adminId)
        {
            var section = await _repository.GetSectionAsync(templateId, sectionId);
            if (section == null) throw new KeyNotFoundException("Section not found in template");

            if (section.IsLocked)
            {
                throw new InvalidOperationException("Cannot delete a locked section");
            }

            section.IsDeleted = true;
            section.Status = "Deleted";
            section.DeletedAt = DateTime.UtcNow;
            section.DeletedBy = adminId.ToString();

            _repository.UpdateSection(section);
            await _repository.SaveChangesAsync();
            
            await NormalizeSectionOrderAsync(templateId);
            
            _logger.LogInformation("Deleted section {SectionId} from template {TemplateId} by Admin {AdminId}", sectionId, templateId, adminId);
        }

        public async Task<SectionDto> RestoreSectionAsync(Guid templateId, Guid sectionId, int adminId)
        {
            var section = await _repository.GetSectionIncludingDeletedAsync(templateId, sectionId);
            if (section == null) throw new KeyNotFoundException("Section not found in template");

            if (!section.IsDeleted)
            {
                return MapToDto(section); // already restored
            }

            section.IsDeleted = false;
            section.Status = "Added";
            section.RestoredAt = DateTime.UtcNow;
            section.RestoredBy = adminId.ToString();
            
            var currentSections = (await _repository.GetTemplateSectionsAsync(templateId)).ToList();
            if (currentSections.Any(s => s.OrderIndex == section.OrderIndex))
            {
                section.OrderIndex = currentSections.Any() ? currentSections.Max(s => s.OrderIndex) + 1 : 1;
            }

            _repository.UpdateSection(section);
            await _repository.SaveChangesAsync();
            
            await NormalizeSectionOrderAsync(templateId);
            
            _logger.LogInformation("Restored section {SectionId} in template {TemplateId} by Admin {AdminId}", sectionId, templateId, adminId);

            return MapToDto(section);
        }

        private async Task NormalizeSectionOrderAsync(Guid templateId)
        {
            var currentSections = (await _repository.GetTemplateSectionsAsync(templateId)).ToList();
            int currentOrder = 1;
            foreach (var s in currentSections)
            {
                s.OrderIndex = currentOrder++;
                s.UpdatedAt = DateTime.UtcNow;
            }
            await _repository.UpdateSectionsOrderAsync(currentSections);
        }

        public async Task<List<SectionDto>> ReorderSectionsAsync(Guid templateId, ReorderSectionDto dto)
        {
            var currentSections = (await _repository.GetTemplateSectionsAsync(templateId)).ToList();
            
            foreach (var orderDto in dto.Sections)
            {
                var section = currentSections.FirstOrDefault(s => s.Id == orderDto.SectionId);
                if (section != null)
                {
                    section.OrderIndex = orderDto.OrderIndex;
                    section.UpdatedAt = DateTime.UtcNow;
                }
            }

            // Validation: Ensure valid order sequence (optional based on exact business logic, here we just save)
            await _repository.UpdateSectionsOrderAsync(currentSections);
            
            _logger.LogInformation("Reordered sections for template {TemplateId}", templateId);

            return currentSections.OrderBy(s => s.OrderIndex).Select(MapToDto).ToList();
        }

        public async Task<ValidationResultDto> ValidateTemplateAsync(Guid templateId)
        {
            var sections = await _repository.GetTemplateSectionsAsync(templateId);
            var library = await _repository.GetSectionLibraryAsync();

            var errors = new List<ValidationIssueDto>();
            var warnings = new List<ValidationIssueDto>();

            var requiredDefs = library.Where(d => d.IsRequired).ToList();
            foreach (var req in requiredDefs)
            {
                var instances = sections.Where(s => s.SectionDefinitionId == req.Id).ToList();
                if (!instances.Any())
                {
                    errors.Add(new ValidationIssueDto { Severity = "Critical", Message = $"Required section missing: {req.Name}" });
                }
                else if (instances.All(i => i.IsHidden))
                {
                    errors.Add(new ValidationIssueDto { Severity = "Critical", Message = $"Required section {req.Name} is hidden." });
                }
            }

            foreach (var section in sections)
            {
                if (string.IsNullOrWhiteSpace(section.BindingPath))
                {
                    warnings.Add(new ValidationIssueDto { Severity = "Warning", Message = $"Binding path missing for {section.DisplayName}", SectionId = section.Id });
                }
            }

            // Check single instance duplicates just in case DB constraint was bypassed
            var duplicates = sections.GroupBy(s => s.SectionDefinitionId)
                .Where(g => g.Count() > 1 && g.First().SectionDefinition?.IsSingleInstance == true)
                .ToList();

            foreach (var dup in duplicates)
            {
                errors.Add(new ValidationIssueDto { Severity = "Critical", Message = $"Duplicate single-instance section: {dup.First().SectionDefinition?.Name}" });
            }

            return new ValidationResultDto
            {
                CanPublish = !errors.Any(),
                Errors = errors,
                Warnings = warnings
            };
        }

        public async Task<TemplateProgressDto> CalculateProgressAsync(Guid templateId)
        {
            var sections = await _repository.GetTemplateSectionsAsync(templateId);
            var library = await _repository.GetSectionLibraryAsync();

            var coreDefs = library.Where(d => d.Category == "Core").ToList();
            var optionalDefs = library.Where(d => d.Category == "Optional").ToList();
            
            var addedDefs = sections.Select(s => s.SectionDefinitionId).Distinct().ToList();

            int coreAdded = coreDefs.Count(d => addedDefs.Contains(d.Id));
            int optionalAdded = optionalDefs.Count(d => addedDefs.Contains(d.Id));

            var missingRequired = library.Where(d => d.IsRequired && !addedDefs.Contains(d.Id)).Select(d => d.Name).ToList();

            var atsReady = !missingRequired.Any() && sections.Any(s => s.SectionDefinition != null && s.SectionDefinition.IsATSFriendly);

            double completion = 0;
            if (coreDefs.Count > 0)
            {
                completion = (double)coreAdded / coreDefs.Count * 100;
            }

            return new TemplateProgressDto
            {
                SectionsAdded = sections.Count(),
                TotalSections = library.Count(),
                CoreAdded = coreAdded,
                CoreTotal = coreDefs.Count,
                OptionalAdded = optionalAdded,
                OptionalTotal = optionalDefs.Count,
                MissingRequired = missingRequired,
                ATSReady = atsReady,
                CompletionPercentage = completion
            };
        }

        private SectionDto MapToDto(CvTemplateSection section)
        {
            return new SectionDto
            {
                Id = section.Id,
                TemplateId = section.TemplateId,
                SectionDefinitionId = section.SectionDefinitionId,
                DisplayName = section.DisplayName,
                Description = section.Description,
                BindingPath = section.BindingPath,
                OrderIndex = section.OrderIndex,
                Status = section.Status,
                IsRequired = section.IsRequired,
                IsRepeatable = section.IsRepeatable,
                IsHidden = section.IsHidden,
                IsLocked = section.IsLocked,
                ContainerId = section.ContainerId,
                ColumnIndex = section.ColumnIndex,
                LayoutConfigJson = section.LayoutConfigJson,
                CreatedAt = section.CreatedAt,
                UpdatedAt = section.UpdatedAt,
                IsDeleted = section.IsDeleted,
                DeletedAt = section.DeletedAt,
                RestoredAt = section.RestoredAt
            };
        }

        private ContainerDto MapContainerToDto(CvTemplateContainer container)
        {
            return new ContainerDto
            {
                Id = container.Id,
                TemplateId = container.TemplateId,
                LayoutType = container.LayoutType,
                OrderIndex = container.OrderIndex,
                ConfigJson = container.ConfigJson
            };
        }
    }
}
