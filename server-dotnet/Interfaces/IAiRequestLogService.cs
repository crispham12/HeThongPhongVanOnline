using System.Collections.Generic;
using System.Threading.Tasks;
using InterviewPro.API.DTOs;

namespace InterviewPro.API.Interfaces
{
    public interface IAiRequestLogService
    {
        Task LogAsync(AiRequestLogCreateDto dto);
        Task<AiMonitoringOverviewDto> GetOverviewAsync(string range);
        Task<List<AiTokenUsageDto>> GetTokenUsageAsync(string range);
        Task<List<AiFeatureUsageDto>> GetFeatureUsageAsync(string range);
        Task<PaginatedResult<AiRecentLogDto>> GetRecentLogsAsync(int page, int pageSize);
        Task<PaginatedResult<AiErrorLogDto>> GetErrorsAsync(int page, int pageSize);
        Task<AiSystemStatusDto> GetSystemStatusAsync();
    }
}
