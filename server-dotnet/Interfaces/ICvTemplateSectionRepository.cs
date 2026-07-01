using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using InterviewPro.API.Entities;

namespace InterviewPro.API.Interfaces
{
    public interface ICvTemplateSectionRepository
    {
        Task<IEnumerable<CvTemplateSection>> GetTemplateSectionsAsync(Guid templateId);
        Task<IEnumerable<CvTemplateSection>> GetTemplateSectionsIncludingDeletedAsync(Guid templateId);
        Task<IEnumerable<CvTemplateContainer>> GetTemplateContainersAsync(Guid templateId);
        Task<IEnumerable<CvSectionDefinition>> GetSectionLibraryAsync();
        Task<CvSectionDefinition?> GetSectionDefinitionByTypeAsync(string sectionType);
        Task<CvTemplateSection?> GetSectionAsync(Guid templateId, Guid sectionId);
        Task<CvTemplateSection?> GetSectionIncludingDeletedAsync(Guid templateId, Guid sectionId);
        Task<CvTemplateContainer?> GetContainerAsync(Guid templateId, Guid containerId);
        
        Task AddSectionAsync(CvTemplateSection section);
        Task AddContainerAsync(CvTemplateContainer container);
        void UpdateSection(CvTemplateSection section);
        void UpdateContainer(CvTemplateContainer container);
        void DeleteSection(CvTemplateSection section);
        
        Task UpdateSectionsOrderAsync(List<CvTemplateSection> sections);
        
        Task<bool> SaveChangesAsync();
        
        Task<CvTemplate?> GetTemplateByIdAsync(Guid templateId);
    }
}
