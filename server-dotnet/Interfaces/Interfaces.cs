using InterviewPro.API.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewPro.API.Interfaces
{
    public interface IAuthRepository
    {
        Task<User> Register(User user, string password);
        Task<User> Login(string email, string password);
        Task<bool> UserExists(string email);
    }

    public interface IInterviewRepository
    {
        Task<InterviewSession> CreateSession(InterviewSession session);
        Task<InterviewSession> GetSessionByGuid(string guid);
        Task<IEnumerable<InterviewSession>> GetUserHistory(int userId);
        Task<InterviewQuestion> AddQuestion(InterviewQuestion question);
        Task UpdateSession(InterviewSession session);
    }
}
