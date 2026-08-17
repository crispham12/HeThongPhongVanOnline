using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InterviewPro.API.Services
{
    public class FullMockService : IFullMockService
    {
        private readonly AppDbContext _context;
        private readonly IInterviewQuotaService _quotaService;

        public FullMockService(AppDbContext context, IInterviewQuotaService quotaService)
        {
            _context = context;
            _quotaService = quotaService;
        }

        public async Task<CreateFullMockResponse> CreateSessionAsync(int userId, CreateFullMockRequest request)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new UnauthorizedAccessException("Không tìm thấy người dùng.");

            if (user.Plan == "Free")
            {
                var hasEnough = await _quotaService.HasEnoughQuotaAsync(userId, 3);
                if (!hasEnough)
                {
                    int remaining = Math.Max(0, 3 - user.DailyInterviewUsed);
                    throw new QuotaExceededException($"Bạn cần 3 buổi trống để bắt đầu Full Mock. Hiện tại còn {remaining} buổi.");
                }
            }

            var session = new FullMockSession
            {
                UserId = userId,
                Role = request.Role,
                Difficulty = request.Difficulty,
                TechStackJson = JsonSerializer.Serialize(request.Stack ?? new List<string>()),
                Status = "InProgress",
                CompletedRoundsJson = "[]"
            };

            _context.FullMockSessions.Add(session);
            await _context.SaveChangesAsync();

            return new CreateFullMockResponse(session.SessionGuid, "Tạo phiên phỏng vấn thử đầy đủ thành công.");
        }

        public async Task CompleteRoundAsync(int userId, string fullMockGuid, CompleteRoundRequest request)
        {
            var session = await _context.FullMockSessions.FirstOrDefaultAsync(s => s.SessionGuid == fullMockGuid && s.UserId == userId)
                ?? throw new KeyNotFoundException("Không tìm thấy phiên phỏng vấn thử.");

            if (session.Status != "InProgress")
            {
                throw new InvalidOperationException("Session không ở trạng thái InProgress.");
            }

            var completedRounds = JsonSerializer.Deserialize<List<string>>(session.CompletedRoundsJson) ?? new List<string>();

            if (completedRounds.Contains(request.Round))
            {
                throw new InvalidOperationException($"Round {request.Round} đã được hoàn thành.");
            }

            // Trừ 1 quota
            await _quotaService.ConsumeQuotaAsync(userId);

            // Gán SessionGuid cho vòng tương ứng
            if (request.Round == "HR")
            {
                session.HrSessionGuid = request.RoundSessionGuid;
            }
            else if (request.Round == "Technical")
            {
                session.TechnicalSessionGuid = request.RoundSessionGuid;
            }
            else if (request.Round == "Coding")
            {
                session.CodingSessionGuid = request.RoundSessionGuid;
            }
            else
            {
                throw new InvalidOperationException("Vòng phỏng vấn không hợp lệ.");
            }

            completedRounds.Add(request.Round);
            session.CompletedRoundsJson = JsonSerializer.Serialize(completedRounds);

            if (completedRounds.Count == 3)
            {
                session.Status = "Completed";
                session.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        public async Task AbandonSessionAsync(int userId, string fullMockGuid)
        {
            var session = await _context.FullMockSessions.FirstOrDefaultAsync(s => s.SessionGuid == fullMockGuid && s.UserId == userId)
                ?? throw new KeyNotFoundException("Không tìm thấy phiên phỏng vấn thử.");

            if (session.Status != "InProgress")
            {
                throw new InvalidOperationException("Session không ở trạng thái InProgress.");
            }

            session.Status = "Abandoned";
            await _context.SaveChangesAsync();
        }

        public async Task<FullMockReportResponse> GetReportAsync(int userId, string fullMockGuid)
        {
            var session = await _context.FullMockSessions.FirstOrDefaultAsync(s => s.SessionGuid == fullMockGuid && s.UserId == userId)
                ?? throw new KeyNotFoundException("Không tìm thấy phiên phỏng vấn thử.");

            RoundSummary? hrSummary = null;
            RoundSummary? technicalSummary = null;
            RoundSummary? codingSummary = null;

            if (!string.IsNullOrEmpty(session.HrSessionGuid))
            {
                var hrSession = await _context.HrInterviewSessions.FirstOrDefaultAsync(h => h.SessionGuid == session.HrSessionGuid);
                if (hrSession != null)
                {
                    hrSummary = new RoundSummary("HR", hrSession.FinalScore ?? 0.0, hrSession.FinalSummary);
                }
            }

            if (!string.IsNullOrEmpty(session.TechnicalSessionGuid))
            {
                var techSession = await _context.TechnicalInterviewSessions.FirstOrDefaultAsync(ts => ts.SessionGuid == session.TechnicalSessionGuid);
                if (techSession != null)
                {
                    technicalSummary = new RoundSummary("Technical", techSession.OverallScore, techSession.FinalFeedbackJson);
                }
            }

            if (!string.IsNullOrEmpty(session.CodingSessionGuid))
            {
                var codingSession = await _context.CodingInterviewSessions.FirstOrDefaultAsync(cs => cs.SessionGuid == session.CodingSessionGuid);
                if (codingSession != null)
                {
                    codingSummary = new RoundSummary("Coding", codingSession.OverallScore, codingSession.FinalReportJson);
                }
            }

            double weightedScore = 0;
            double weightSum = 0;

            if (hrSummary != null)
            {
                weightedScore += hrSummary.Score * 0.3;
                weightSum += 0.3;
            }
            if (technicalSummary != null)
            {
                weightedScore += technicalSummary.Score * 0.4;
                weightSum += 0.4;
            }
            if (codingSummary != null)
            {
                weightedScore += codingSummary.Score * 0.3;
                weightSum += 0.3;
            }

            double totalScore = weightedScore;
            var completedRounds = JsonSerializer.Deserialize<List<string>>(session.CompletedRoundsJson) ?? new List<string>();

            return new FullMockReportResponse(
                session.SessionGuid,
                session.Role,
                session.Difficulty,
                completedRounds,
                hrSummary,
                technicalSummary,
                codingSummary,
                Math.Round(totalScore, 2),
                session.Status,
                session.CreatedAt,
                session.CompletedAt
            );
        }

        public async Task<FullMockSession?> GetActiveSessionAsync(int userId)
        {
            return await _context.FullMockSessions
                .FirstOrDefaultAsync(s => s.UserId == userId && s.Status == "InProgress");
        }
    }
}
