using InterviewPro.API.Data;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InterviewPro.API.Repositories
{
    public class InterviewRepository : IInterviewRepository
    {
        private readonly AppDbContext _context;

        public InterviewRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<InterviewSession> CreateSession(InterviewSession session)
        {
            _context.InterviewSessions.Add(session);
            await _context.SaveChangesAsync();
            return session;
        }

        public async Task<InterviewSession> GetSessionByGuid(string guid)
        {
            return await _context.InterviewSessions
                .Include(s => s.Questions)
                .FirstOrDefaultAsync(s => s.SessionGuid == guid);
        }

        public async Task<IEnumerable<InterviewSession>> GetUserHistory(int userId)
        {
            return await _context.InterviewSessions
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<InterviewQuestion> AddQuestion(InterviewQuestion question)
        {
            _context.InterviewQuestions.Add(question);
            await _context.SaveChangesAsync();
            return question;
        }
    }
}
