using InterviewPro.API.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewPro.API.Interfaces
{
    public interface ICvTemplateRepository
    {
        Task<CvTemplate?> GetByIdAsync(Guid id, bool includeComponents = true);
        Task<IEnumerable<CvTemplate>> GetAllAsync();
        Task AddAsync(CvTemplate template);
        Task UpdateAsync(CvTemplate template);
        Task DeleteAsync(CvTemplate template);
        
        Task<CvTemplateComponent?> GetComponentByIdAsync(Guid componentId);
        Task AddComponentAsync(CvTemplateComponent component);
        Task UpdateComponentAsync(CvTemplateComponent component);
        Task DeleteComponentAsync(CvTemplateComponent component);
        
        Task SaveChangesAsync();
    }
}
