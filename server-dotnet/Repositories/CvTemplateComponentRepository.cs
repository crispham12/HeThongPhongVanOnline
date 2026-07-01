using InterviewPro.API.Data;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InterviewPro.API.Repositories
{
    public class CvTemplateComponentRepository : ICvTemplateComponentRepository
    {
        private readonly AppDbContext _context;

        public CvTemplateComponentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CvComponentDefinition>> GetAllDefinitionsAsync()
        {
            return await _context.CvComponentDefinitions
                .Where(d => d.IsActive)
                .OrderBy(d => d.SortOrder)
                .ToListAsync();
        }

        public async Task<CvComponentDefinition?> GetDefinitionByTypeAsync(string componentType)
        {
            return await _context.CvComponentDefinitions
                .FirstOrDefaultAsync(d => d.ComponentType == componentType && d.IsActive);
        }

        public async Task<IEnumerable<CvTemplateComponent>> GetComponentsBySectionIdAsync(Guid sectionId, bool includeDeleted = false)
        {
            var query = _context.CvTemplateComponents.AsQueryable();
            if (includeDeleted)
            {
                query = query.IgnoreQueryFilters();
            }

            return await query
                .Where(c => c.SectionId == sectionId)
                .OrderBy(c => c.OrderIndex)
                .ToListAsync();
        }

        public async Task<CvTemplateComponent?> GetComponentByIdAsync(Guid id, bool includeDeleted = false)
        {
            var query = _context.CvTemplateComponents.AsQueryable();
            if (includeDeleted)
            {
                query = query.IgnoreQueryFilters();
            }

            return await query.FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<IEnumerable<CvTemplateComponent>> GetChildComponentsAsync(Guid parentComponentId)
        {
            return await _context.CvTemplateComponents
                .Where(c => c.ParentComponentId == parentComponentId)
                .OrderBy(c => c.OrderIndex)
                .ToListAsync();
        }

        public async Task AddComponentAsync(CvTemplateComponent component)
        {
            await _context.CvTemplateComponents.AddAsync(component);
        }

        public async Task AddComponentsAsync(IEnumerable<CvTemplateComponent> components)
        {
            await _context.CvTemplateComponents.AddRangeAsync(components);
        }

        public async Task UpdateComponentAsync(CvTemplateComponent component)
        {
            _context.CvTemplateComponents.Update(component);
            await Task.CompletedTask;
        }

        public async Task UpdateComponentsAsync(IEnumerable<CvTemplateComponent> components)
        {
            _context.CvTemplateComponents.UpdateRange(components);
            await Task.CompletedTask;
        }

        public async Task DeleteComponentAsync(CvTemplateComponent component)
        {
            _context.CvTemplateComponents.Remove(component);
            await Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
