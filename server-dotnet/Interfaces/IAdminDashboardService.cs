using System.Threading.Tasks;
using InterviewPro.API.DTOs;

namespace InterviewPro.API.Interfaces
{
    public interface IAdminDashboardService
    {
        Task<AdminDashboardOverviewDto> GetDashboardDataAsync();
    }
}
