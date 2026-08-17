using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs.InterviewHistory;
using InterviewPro.API.Interfaces;
using InterviewPro.API.Entities;
using Microsoft.Extensions.Logging;

namespace InterviewPro.API.Services
{
    public class InterviewHistoryService : IInterviewHistoryService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<InterviewHistoryService> _logger;

        public InterviewHistoryService(AppDbContext context, ILogger<InterviewHistoryService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<InterviewHistoryResponseDto> GetHistoryAsync(int userId, InterviewHistoryQueryDto query, bool isAdmin)
        {
            var hrQuery = _context.HrInterviewSessions
                .Include(s => s.FinalResult)
                .AsNoTracking()
                .AsQueryable();

            if (!isAdmin)
            {
                hrQuery = hrQuery.Where(s => s.UserId == userId);
            }

            var hrSessionsList = await hrQuery.Select(s => new {
                SessionId = s.SessionGuid,
                UserId = s.UserId,
                InterviewType = "HR",
                Role = s.Role,
                Difficulty = s.Difficulty,
                CreatedAt = s.CreatedAt,
                CompletedAt = s.CompletedAt,
                HasResult = s.FinalResult != null,
                Score = s.FinalResult != null ? (double)s.FinalResult.OverallScore : 0.0,
                TotalQuestions = s.TotalQuestions,
                AnsweredQuestions = s.AnsweredQuestions,
                DurationMinutes = s.DurationMinutes
            }).ToListAsync();

            var fmQuery = _context.FullMockSessions
                .AsNoTracking()
                .Where(s => s.Status == "Completed")
                .AsQueryable();

            if (!isAdmin)
            {
                fmQuery = fmQuery.Where(s => s.UserId == userId);
            }

            var fullMockSessionsList = await fmQuery.Select(s => new {
                SessionId = s.SessionGuid,
                UserId = s.UserId,
                InterviewType = "FullMock",
                Role = s.Role,
                Difficulty = s.Difficulty,
                CreatedAt = s.CreatedAt,
                CompletedAt = s.CompletedAt,
                HasResult = _context.CandidateReports.Any(r => r.SessionGuid == s.SessionGuid),
                Score = (double)_context.CandidateReports.Where(r => r.SessionGuid == s.SessionGuid).Select(r => r.OverallScore).FirstOrDefault(),
                TotalQuestions = 3,
                AnsweredQuestions = 3,
                DurationMinutes = 120
            }).ToListAsync();

            var combinedSessions = hrSessionsList.Concat(fullMockSessionsList).AsEnumerable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                string searchTerm = query.Search.ToLower();
                combinedSessions = combinedSessions.Where(s => s.Role.ToLower().Contains(searchTerm) || s.Difficulty.ToLower().Contains(searchTerm));
            }

            if (!string.IsNullOrWhiteSpace(query.InterviewType) && !query.InterviewType.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                string typeLower = query.InterviewType.ToLower();
                if (typeLower == "hr")
                {
                    combinedSessions = combinedSessions.Where(s => s.InterviewType == "HR");
                }
                else if (typeLower == "fullmock")
                {
                    combinedSessions = combinedSessions.Where(s => s.InterviewType == "FullMock");
                }
                else
                {
                    combinedSessions = combinedSessions.Where(s => false);
                }
            }

            if (!string.IsNullOrWhiteSpace(query.DateRange) && !query.DateRange.Equals("all", StringComparison.OrdinalIgnoreCase))
            {
                DateTime? fromDate = query.DateRange.ToLower() switch
                {
                    "7days" => DateTime.UtcNow.AddDays(-7),
                    "30days" => DateTime.UtcNow.AddDays(-30),
                    "90days" => DateTime.UtcNow.AddDays(-90),
                    _ => null
                };

                if (fromDate.HasValue)
                {
                    combinedSessions = combinedSessions.Where(s => s.CompletedAt >= fromDate.Value || s.CreatedAt >= fromDate.Value);
                }
            }

            if (!string.IsNullOrWhiteSpace(query.Status) && !query.Status.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                string statusFilter = query.Status.ToLower();
                
                if (statusFilter == "ready")
                    combinedSessions = combinedSessions.Where(s => s.HasResult && s.Score >= 8.5);
                else if (statusFilter == "almostready")
                    combinedSessions = combinedSessions.Where(s => s.HasResult && s.Score >= 7.0 && s.Score < 8.5);
                else if (statusFilter == "needsimprovement")
                    combinedSessions = combinedSessions.Where(s => s.HasResult && s.Score < 7.0);
                else if (statusFilter == "pending" || statusFilter == "notready")
                    combinedSessions = combinedSessions.Where(s => !s.HasResult);
            }

            var summaryData = combinedSessions.Select(s => new { s.HasResult, s.Score }).ToList();

            int totalInterviews = summaryData.Count;
            var evaluatedSessions = summaryData.Where(x => x.HasResult).ToList();
            int evaluatedCount = evaluatedSessions.Count;
            
            double averageScore = evaluatedCount > 0 ? evaluatedSessions.Average(x => x.Score) : 0;
            double highestScore = evaluatedCount > 0 ? evaluatedSessions.Max(x => x.Score) : 0;
            int readySessionsCount = evaluatedSessions.Count(x => x.Score >= 8.5);
            int interviewReadyPercent = evaluatedCount > 0 ? (int)Math.Round((double)readySessionsCount / evaluatedCount * 100) : 0;

            var summary = new InterviewHistorySummaryDto
            {
                TotalInterviews = totalInterviews,
                AverageScore = Math.Round(averageScore, 1),
                HighestScore = Math.Round(highestScore, 1),
                InterviewReadyPercent = interviewReadyPercent,
                ReadySessions = readySessionsCount
            };

            var sortQuery = query.Sort?.ToLower() ?? "newest";
            switch (sortQuery)
            {
                case "oldest":
                    combinedSessions = combinedSessions.OrderBy(s => s.CompletedAt ?? s.CreatedAt);
                    break;
                case "highestscore":
                    combinedSessions = combinedSessions.OrderByDescending(s => s.Score).ThenByDescending(s => s.CompletedAt ?? s.CreatedAt);
                    break;
                case "lowestscore":
                    combinedSessions = combinedSessions.Where(s => s.HasResult).OrderBy(s => s.Score).ThenByDescending(s => s.CompletedAt ?? s.CreatedAt);
                    break;
                case "newest":
                default:
                    combinedSessions = combinedSessions.OrderByDescending(s => s.CompletedAt ?? s.CreatedAt);
                    break;
            }

            int page = query.Page < 1 ? 1 : query.Page;
            int pageSize = query.PageSize < 1 ? 10 : (query.PageSize > 50 ? 50 : query.PageSize);
            
            var pagedSessions = combinedSessions
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var items = pagedSessions.Select(s => {
                string statusMapped = "Pending";
                double score = s.Score;
                
                if (s.HasResult)
                {
                    score = Math.Round(s.Score, 1);
                    if (score >= 8.5) statusMapped = "Ready";
                    else if (score >= 7.0) statusMapped = "AlmostReady";
                    else statusMapped = "NeedsImprovement";
                }

                return new InterviewHistoryItemDto
                {
                    SessionId = s.SessionId,
                    InterviewType = s.InterviewType,
                    Role = s.Role,
                    Level = s.Difficulty,
                    Score = score,
                    Status = statusMapped,
                    QuestionsAnswered = s.AnsweredQuestions,
                    TotalQuestions = s.TotalQuestions,
                    DurationMinutes = s.DurationMinutes,
                    InterviewDate = s.CompletedAt ?? s.CreatedAt,
                    HasResult = s.HasResult
                };
            }).ToList();

            var pagination = new PaginationDto
            {
                Page = page,
                PageSize = pageSize,
                TotalItems = totalInterviews,
                TotalPages = (int)Math.Ceiling(totalInterviews / (double)pageSize)
            };

            return new InterviewHistoryResponseDto
            {
                Summary = summary,
                Items = items,
                Pagination = pagination
            };
        }

        public async Task<ArchiveInterviewResponseDto> ArchiveAsync(string sessionId, int currentUserId, bool isAdmin)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            _logger.LogInformation("ArchiveAsync: SessionId={SessionId}, UserId={UserId}, IsAdmin={IsAdmin}", sessionId, currentUserId, isAdmin);

            if (string.IsNullOrWhiteSpace(sessionId))
                throw new ArgumentException("Session ID is required.");

            var session = await _context.HrInterviewSessions
                .FirstOrDefaultAsync(s => s.SessionGuid == sessionId);

            if (session == null)
                throw new KeyNotFoundException("Interview session not found.");

            if (!isAdmin && session.UserId != currentUserId)
                throw new UnauthorizedAccessException("You do not have permission to archive this interview.");

            // Idempotent: already archived → return success immediately
            if (session.IsDeleted)
            {
                sw.Stop();
                _logger.LogInformation("ArchiveAsync (idempotent): Session {SessionId} already archived. Elapsed={Elapsed}ms", sessionId, sw.ElapsedMilliseconds);
                return new ArchiveInterviewResponseDto
                {
                    Success = true,
                    Message = "Interview archived successfully.",
                    SessionId = sessionId,
                    ArchivedAt = session.DeletedAt
                };
            }

            // Soft delete — never call Remove()
            session.IsDeleted = true;
            session.DeletedAt = DateTime.UtcNow;
            session.DeletedBy = currentUserId.ToString();

            await _context.SaveChangesAsync();

            sw.Stop();
            _logger.LogInformation("ArchiveAsync: Session {SessionId} archived by UserId={UserId}. Elapsed={Elapsed}ms", sessionId, currentUserId, sw.ElapsedMilliseconds);

            return new ArchiveInterviewResponseDto
            {
                Success = true,
                Message = "Interview archived successfully.",
                SessionId = sessionId,
                ArchivedAt = session.DeletedAt
            };
        }

        public async Task<RestoreInterviewResponseDto> RestoreAsync(string sessionId, int currentUserId, bool isAdmin)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            _logger.LogInformation("RestoreAsync: SessionId={SessionId}, UserId={UserId}, IsAdmin={IsAdmin}", sessionId, currentUserId, isAdmin);

            if (string.IsNullOrWhiteSpace(sessionId))
                throw new ArgumentException("Session ID is required.");

            // Must include archived sessions when restoring (no IsDeleted filter)
            var session = await _context.HrInterviewSessions
                .FirstOrDefaultAsync(s => s.SessionGuid == sessionId);

            if (session == null)
                throw new KeyNotFoundException("Interview session not found.");

            if (!isAdmin && session.UserId != currentUserId)
                throw new UnauthorizedAccessException("You do not have permission to restore this interview.");

            // Idempotent: not deleted → return success immediately
            if (!session.IsDeleted)
            {
                sw.Stop();
                _logger.LogInformation("RestoreAsync (idempotent): Session {SessionId} is already active. Elapsed={Elapsed}ms", sessionId, sw.ElapsedMilliseconds);
                return new RestoreInterviewResponseDto
                {
                    Success = true,
                    Message = "Interview restored successfully.",
                    SessionId = sessionId,
                    RestoredAt = DateTime.UtcNow
                };
            }

            // Restore
            session.IsDeleted = false;
            session.DeletedAt = null;
            session.DeletedBy = null;

            await _context.SaveChangesAsync();

            sw.Stop();
            _logger.LogInformation("RestoreAsync: Session {SessionId} restored by UserId={UserId}. Elapsed={Elapsed}ms", sessionId, currentUserId, sw.ElapsedMilliseconds);

            return new RestoreInterviewResponseDto
            {
                Success = true,
                Message = "Interview restored successfully.",
                SessionId = sessionId,
                RestoredAt = DateTime.UtcNow
            };
        }
    }
}
