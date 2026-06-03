using InterviewPro.API.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewPro.API.Interfaces
{
    public interface ICvTemplateService
    {
        Task<CvTemplateResponseDto> CreateTemplateAsync(CvTemplateCreateDto dto, int adminId);
        Task<CvTemplateResponseDto> UpdateTemplateAsync(Guid id, CvTemplateUpdateDto dto);
        Task DeleteTemplateAsync(Guid id);
        Task<IEnumerable<CvTemplateResponseDto>> GetTemplatesAsync();
        Task<CvTemplateResponseDto> GetTemplateDetailAsync(Guid id);
        Task<CvTemplateResponseDto> PublishTemplateAsync(Guid id);
        Task<CvTemplateResponseDto> UnpublishTemplateAsync(Guid id);
        
        Task<CvTemplateComponentResponseDto> AddComponentAsync(CvTemplateComponentCreateDto dto);
        Task<CvTemplateComponentResponseDto> UpdateComponentAsync(Guid templateId, Guid componentId, CvTemplateComponentUpdateDto dto);
        Task DeleteComponentAsync(Guid templateId, Guid componentId);
        Task ReorderComponentsAsync(Guid templateId, ComponentReorderDto dto);
    }
}
