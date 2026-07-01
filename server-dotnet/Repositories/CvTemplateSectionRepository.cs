using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using InterviewPro.API.Data;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;

namespace InterviewPro.API.Repositories
{
    public class CvTemplateSectionRepository : ICvTemplateSectionRepository
    {
        private readonly AppDbContext _context;

        public CvTemplateSectionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CvTemplateSection>> GetTemplateSectionsAsync(Guid templateId)
        {
            return await _context.CvTemplateSections
                .Include(s => s.SectionDefinition)
                .Where(s => s.TemplateId == templateId)
                .OrderBy(s => s.OrderIndex)
                .ToListAsync();
        }

        public async Task<IEnumerable<CvTemplateSection>> GetTemplateSectionsIncludingDeletedAsync(Guid templateId)
        {
            return await _context.CvTemplateSections
                .IgnoreQueryFilters()
                .Include(s => s.SectionDefinition)
                .Where(s => s.TemplateId == templateId)
                .OrderBy(s => s.OrderIndex)
                .ToListAsync();
        }

        public async Task<IEnumerable<CvTemplateContainer>> GetTemplateContainersAsync(Guid templateId)
        {
            return await _context.CvTemplateContainers
                .Where(c => c.TemplateId == templateId)
                .OrderBy(c => c.OrderIndex)
                .ToListAsync();
        }

        public async Task<IEnumerable<CvSectionDefinition>> GetSectionLibraryAsync()
        {
            return await _context.CvSectionDefinitions
                .Where(d => d.IsActive)
                .OrderBy(d => d.SortOrder)
                .ToListAsync();
        }

        public async Task<CvSectionDefinition?> GetSectionDefinitionByTypeAsync(string sectionType)
        {
            return await _context.CvSectionDefinitions
                .FirstOrDefaultAsync(d => d.SectionType == sectionType && d.IsActive);
        }

        public async Task<CvTemplateSection?> GetSectionAsync(Guid templateId, Guid sectionId)
        {
            return await _context.CvTemplateSections
                .Include(s => s.SectionDefinition)
                .FirstOrDefaultAsync(s => s.Id == sectionId && s.TemplateId == templateId);
        }

        public async Task<CvTemplateSection?> GetSectionIncludingDeletedAsync(Guid templateId, Guid sectionId)
        {
            return await _context.CvTemplateSections
                .IgnoreQueryFilters()
                .Include(s => s.SectionDefinition)
                .FirstOrDefaultAsync(s => s.Id == sectionId && s.TemplateId == templateId);
        }

        public async Task<CvTemplateContainer?> GetContainerAsync(Guid templateId, Guid containerId)
        {
            return await _context.CvTemplateContainers
                .FirstOrDefaultAsync(c => c.Id == containerId && c.TemplateId == templateId);
        }

        public async Task AddSectionAsync(CvTemplateSection section)
        {
            await _context.CvTemplateSections.AddAsync(section);
        }

        public async Task AddContainerAsync(CvTemplateContainer container)
        {
            await _context.CvTemplateContainers.AddAsync(container);
        }

        public void UpdateSection(CvTemplateSection section)
        {
            _context.CvTemplateSections.Update(section);
        }

        public void UpdateContainer(CvTemplateContainer container)
        {
            _context.CvTemplateContainers.Update(container);
        }

        public void DeleteSection(CvTemplateSection section)
        {
            _context.CvTemplateSections.Update(section);
        }

        public async Task UpdateSectionsOrderAsync(List<CvTemplateSection> sections)
        {
            // Update inside a transaction to ensure integrity
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.CvTemplateSections.UpdateRange(sections);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> SaveChangesAsync()
        {
            return (await _context.SaveChangesAsync()) > 0;
        }

        public async Task<CvTemplate?> GetTemplateByIdAsync(Guid templateId)
        {
            return await _context.CvTemplates
                .Include(t => t.Sections)
                .FirstOrDefaultAsync(t => t.Id == templateId);
        }
    }
}
