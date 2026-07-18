using System;
using System.Threading.Tasks;
using InterviewPro.API.DTOs;

namespace InterviewPro.API.Interfaces
{
    public interface IInterviewQuotaService
    {
        /// <summary>
        /// Kiểm tra user còn quota không. Nếu không đủ → throw QuotaExceededException.
        /// Nếu đủ → tăng DailyInterviewUsed lên 1 và lưu DB.
        /// </summary>
        Task ConsumeQuotaAsync(int userId);

        /// <summary>
        /// Lấy thông tin quota hiện tại của user.
        /// </summary>
        Task<QuotaStatusDto> GetQuotaStatusAsync(int userId);
    }

    public class QuotaExceededException : Exception
    {
        public QuotaExceededException(string message) : base(message) { }
    }
}
