using InterviewPro.API.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewPro.API.Interfaces
{
    public interface ICvTemplateComponentService
    {
        Task<ComponentLibraryResponseDto> GetComponentLibraryAsync(Guid templateId, Guid? sectionId);
        
        Task<IEnumerable<ComponentDto>> GetComponentsBySectionIdAsync(Guid templateId, Guid sectionId);
        
        Task<ComponentDto> AddComponentAsync(Guid templateId, Guid sectionId, AddComponentRequestDto dto);
        
        Task<ComponentDto> UpdateComponentAsync(Guid templateId, Guid sectionId, Guid componentId, UpdateComponentRequestDto dto);
        
        Task DeleteComponentAsync(Guid templateId, Guid sectionId, Guid componentId);
        
        Task ReorderComponentsAsync(Guid templateId, Guid sectionId, List<ReorderComponentItemDto> items);
    }
}
