using InterviewPro.API.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewPro.API.Interfaces
{
    public interface ICvTemplateComponentRepository
    {
        Task<IEnumerable<CvComponentDefinition>> GetAllDefinitionsAsync();
        Task<CvComponentDefinition?> GetDefinitionByTypeAsync(string componentType);
        
        Task<IEnumerable<CvTemplateComponent>> GetComponentsBySectionIdAsync(Guid sectionId, bool includeDeleted = false);
        Task<CvTemplateComponent?> GetComponentByIdAsync(Guid id, bool includeDeleted = false);
        Task<IEnumerable<CvTemplateComponent>> GetChildComponentsAsync(Guid parentComponentId);
        
        Task AddComponentAsync(CvTemplateComponent component);
        Task AddComponentsAsync(IEnumerable<CvTemplateComponent> components);
        
        Task UpdateComponentAsync(CvTemplateComponent component);
        Task UpdateComponentsAsync(IEnumerable<CvTemplateComponent> components);
        
        Task DeleteComponentAsync(CvTemplateComponent component);
        
        Task SaveChangesAsync();
    }
}
