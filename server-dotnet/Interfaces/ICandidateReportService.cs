using System.Threading.Tasks;
using InterviewPro.API.DTOs;

namespace InterviewPro.API.Interfaces
{
    public interface ICandidateReportService
    {
        Task<CandidateReportResponse> GetReportAsync(int userId, string sessionGuid);
        Task<HRReportDto> GetHrReportAsync(int userId, string sessionGuid);
        Task<TechnicalReportDto> GetTechnicalReportAsync(int userId, string sessionGuid);
        Task<CodingReportDto> GetCodingReportAsync(int userId, string sessionGuid);
        Task<CompetencyProfileDto> GetCompetencyProfileAsync(int userId, string sessionGuid);
    }
}
