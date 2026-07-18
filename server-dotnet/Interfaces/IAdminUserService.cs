using System.Threading.Tasks;
using InterviewPro.API.DTOs;

namespace InterviewPro.API.Interfaces
{
    public interface IAdminUserService
    {
        Task<AdminUserOverviewDto> GetOverviewAsync();
        
        Task<PagedResult<AdminUserListItemDto>> GetUsersAsync(
            string? search, string? plan, string? status, int page, int pageSize);
            
        Task<AdminUserDetailDto> GetUserDetailAsync(int userId);
        
        Task<AdminUserListItemDto> CreateUserAsync(AdminUserCreateDto dto);
        
        Task<AdminUserListItemDto> UpdateUserAsync(int userId, AdminUserUpdateDto dto);
        
        Task<bool> LockUserAsync(int userId, string reason, int currentAdminId);
        
        Task<bool> UnlockUserAsync(int userId);
        
        Task<bool> ResetDailyLimitAsync(int userId);
        
        Task<bool> UpdatePlanAsync(int userId, string plan);
        
        Task<AdminUserReportDto> GetReportDataAsync(string? search, string? plan, string? status);
    }
}
