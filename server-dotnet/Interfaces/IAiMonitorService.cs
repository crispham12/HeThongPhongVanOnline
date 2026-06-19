using InterviewPro.API.DTOs;

namespace InterviewPro.API.Interfaces
{
    /// <summary>
    /// IAiMonitorService: Contract cho chức năng Giám sát hệ thống AI.
    /// Chỉ Admin được gọi các method này (enforced tại Controller layer).
    /// </summary>
    public interface IAiMonitorService
    {
        /// <summary>
        /// Lấy tổng quan thống kê AI: tổng request, token, chi phí, response time TB.
        /// </summary>
        Task<AiMonitorOverviewDto> GetOverviewAsync(AiMonitorFilterDto filter);

        /// <summary>
        /// Lấy usage breakdown theo Feature (HR, CV, Coding...).
        /// </summary>
        Task<List<AiMonitorFeatureUsageDto>> GetFeatureUsageAsync(AiMonitorFilterDto filter);

        /// <summary>
        /// Lấy usage theo ngày (time series cho chart).
        /// </summary>
        Task<List<AiDailyUsageDto>> GetDailyUsageAsync(AiMonitorFilterDto filter);

        /// <summary>
        /// Lấy error logs (Status = Failed hoặc Timeout).
        /// </summary>
        Task<PagedResult<AiErrorLogDto>> GetErrorLogsAsync(AiMonitorFilterDto filter, int page, int pageSize);

        /// <summary>
        /// Lấy danh sách logs raw với phân trang + filter.
        /// </summary>
        Task<PagedResult<AiRequestLogDto>> GetLogsAsync(AiMonitorFilterDto filter, int page, int pageSize);

        /// <summary>
        /// Top users theo token usage.
        /// </summary>
        Task<List<AiTopUserDto>> GetTopUsersAsync(AiMonitorFilterDto filter, int top);
    }
}
