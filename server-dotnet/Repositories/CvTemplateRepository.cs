using InterviewPro.API.Data;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewPro.API.Repositories
{
    public class CvTemplateRepository : ICvTemplateRepository
    {
        private readonly AppDbContext _context;

        public CvTemplateRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CvTemplate?> GetByIdAsync(Guid id, bool includeComponents = true)
        {
            if (includeComponents)
            {
                return await _context.CvTemplates
                    .Include(t => t.Components)
                    .FirstOrDefaultAsync(t => t.Id == id);
            }
            return await _context.CvTemplates.FindAsync(id);
        }

        public async Task<IEnumerable<CvTemplate>> GetAllAsync()
        {
            return await _context.CvTemplates
                .Include(t => t.Components)
                .ToListAsync();
        }

        public async Task AddAsync(CvTemplate template)
        {
            await _context.CvTemplates.AddAsync(template);
        }

        public async Task UpdateAsync(CvTemplate template)
        {
            _context.CvTemplates.Update(template);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(CvTemplate template)
        {
            _context.CvTemplates.Remove(template);
            await Task.CompletedTask;
        }



        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
