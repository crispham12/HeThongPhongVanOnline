using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using InterviewPro.API.DTOs;

namespace InterviewPro.API.Interfaces
{
    public interface ICvTemplateSectionService
    {
        Task<TemplateSectionsResponseDto> GetTemplateSectionsAsync(Guid templateId);
        Task<SectionLibraryDto> GetSectionLibraryAsync();
        Task<SectionDto> AddSectionAsync(Guid templateId, AddSectionRequestDto dto);
        Task<SectionDto> UpdateSectionAsync(Guid templateId, Guid sectionId, UpdateSectionRequestDto dto);
        Task<ContainerDto> UpdateContainerAsync(Guid templateId, Guid containerId, UpdateContainerRequestDto dto);
        Task DeleteSectionAsync(Guid templateId, Guid sectionId, int adminId);
        Task<SectionDto> RestoreSectionAsync(Guid templateId, Guid sectionId, int adminId);
        Task<List<SectionDto>> ReorderSectionsAsync(Guid templateId, ReorderSectionDto dto);
        Task<ValidationResultDto> ValidateTemplateAsync(Guid templateId);
        Task<TemplateProgressDto> CalculateProgressAsync(Guid templateId);
    }
}
