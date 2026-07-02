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
            // Logging query
            _logger.LogInformation("GetHistoryAsync called by UserId={UserId}, Admin={IsAdmin}. Filters: Search={Search}, Type={Type}, Status={Status}, DateRange={DateRange}, Sort={Sort}, Page={Page}, PageSize={PageSize}",
                userId, isAdmin, query.Search, query.InterviewType, query.Status, query.DateRange, query.Sort, query.Page, query.PageSize);

            // Start queryable (Currently focusing on HrInterviewSession as main source per requirements)
            var queryable = _context.HrInterviewSessions
                .Include(s => s.FinalResult)
                .AsNoTracking()
                .Where(s => !s.IsDeleted && (s.Status == "Completed" || s.FinalResult != null));

            if (!isAdmin)
            {
                queryable = queryable.Where(s => s.UserId == userId);
            }

            // Apply Search Filter (Role, Level/Difficulty)
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                string searchTerm = query.Search.ToLower();
                queryable = queryable.Where(s => s.Role.ToLower().Contains(searchTerm) || s.Difficulty.ToLower().Contains(searchTerm));
            }

            // Apply InterviewType Filter
            if (!string.IsNullOrWhiteSpace(query.InterviewType) && !query.InterviewType.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                // Current table is HrInterviewSessions, so if it's not HR/All, we might return empty if it doesn't match
                if (query.InterviewType.Equals("HR", StringComparison.OrdinalIgnoreCase))
                {
                    // Everything here is HR implicitly
                }
                else
                {
                    // Unsupported types for this table for now, return empty
                    queryable = queryable.Where(s => false);
                }
            }

            // Apply DateRange Filter
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
                    queryable = queryable.Where(s => s.CompletedAt >= fromDate.Value || s.CreatedAt >= fromDate.Value);
                }
            }

            // To support status filtering, we fetch data or compute it. 
            // Because status mapping is based on FinalResult.OverallScore and EF can translate some conditional logic:
            // Ready: 8.5 - 10.0
            // AlmostReady: 7.0 - 8.4
            // NeedsImprovement: 0.0 - 6.9
            // Pending: No Evaluation

            if (!string.IsNullOrWhiteSpace(query.Status) && !query.Status.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                string statusFilter = query.Status.ToLower();
                
                if (statusFilter == "ready")
                {
                    queryable = queryable.Where(s => s.FinalResult != null && s.FinalResult.OverallScore >= 8.5);
                }
                else if (statusFilter == "almostready")
                {
                    queryable = queryable.Where(s => s.FinalResult != null && s.FinalResult.OverallScore >= 7.0 && s.FinalResult.OverallScore < 8.5);
                }
                else if (statusFilter == "needsimprovement")
                {
                    queryable = queryable.Where(s => s.FinalResult != null && s.FinalResult.OverallScore < 7.0);
                }
                else if (statusFilter == "pending" || statusFilter == "notready")
                {
                    queryable = queryable.Where(s => s.FinalResult == null);
                }
            }

            // Calculate Summary Before Pagination
            var summaryData = await queryable
                .Select(s => new {
                    HasResult = s.FinalResult != null,
                    Score = s.FinalResult != null ? s.FinalResult.OverallScore : 0
                })
                .ToListAsync();

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

            // Apply Sorting
            var sortQuery = query.Sort?.ToLower() ?? "newest";
            switch (sortQuery)
            {
                case "oldest":
                    queryable = queryable.OrderBy(s => s.CompletedAt ?? s.CreatedAt);
                    break;
                case "highestscore":
                    queryable = queryable.OrderByDescending(s => s.FinalResult != null ? s.FinalResult.OverallScore : 0)
                                         .ThenByDescending(s => s.CompletedAt ?? s.CreatedAt);
                    break;
                case "lowestscore":
                    // To sort lowest, we might want to put nulls last or first. Let's assume evaluated first
                    queryable = queryable.Where(s => s.FinalResult != null)
                                         .OrderBy(s => s.FinalResult!.OverallScore)
                                         .ThenByDescending(s => s.CompletedAt ?? s.CreatedAt);
                    break;
                case "newest":
                default:
                    queryable = queryable.OrderByDescending(s => s.CompletedAt ?? s.CreatedAt);
                    break;
            }

            // Pagination
            int page = query.Page < 1 ? 1 : query.Page;
            int pageSize = query.PageSize < 1 ? 10 : (query.PageSize > 50 ? 50 : query.PageSize);
            
            var pagedSessions = await queryable
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = pagedSessions.Select(s => {
                string statusMapped = "Pending";
                double score = 0;
                
                if (s.FinalResult != null)
                {
                    score = Math.Round(s.FinalResult.OverallScore, 1);
                    if (score >= 8.5) statusMapped = "Ready";
                    else if (score >= 7.0) statusMapped = "AlmostReady";
                    else statusMapped = "NeedsImprovement";
                }

                return new InterviewHistoryItemDto
                {
                    SessionId = s.SessionGuid,
                    InterviewType = "HR", // Default for HrInterviewSession
                    Role = s.Role,
                    Level = s.Difficulty,
                    Score = score,
                    Status = statusMapped,
                    QuestionsAnswered = s.AnsweredQuestions, // From new field
                    TotalQuestions = s.TotalQuestions,
                    DurationMinutes = s.DurationMinutes, // From new field
                    InterviewDate = s.CompletedAt ?? s.CreatedAt,
                    HasResult = s.FinalResult != null
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
