using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InterviewPro.API.Services
{
    public class AdminUserService : IAdminUserService
    {
        private readonly AppDbContext _db;

        public AdminUserService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<AdminUserOverviewDto> GetOverviewAsync()
        {
            var totalUsers = await _db.Users.CountAsync();
            var premiumUsers = await _db.Users.CountAsync(u => u.Plan == "Premium");
            var activeUsers = await _db.Users.CountAsync(u => u.Status == "Active");
            var lockedUsers = await _db.Users.CountAsync(u => u.Status == "Locked");

            return new AdminUserOverviewDto
            {
                TotalUsers = totalUsers,
                PremiumUsers = premiumUsers,
                ActiveUsers = activeUsers,
                LockedUsers = lockedUsers
            };
        }

        public async Task<PagedResult<AdminUserListItemDto>> GetUsersAsync(
            string? search, string? plan, string? status, int page, int pageSize)
        {
            var query = _db.Users.AsNoTracking().AsQueryable();

            // Lọc theo search (FullName, Email, hoặc UserCode)
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(u => u.FullName.ToLower().Contains(searchLower) ||
                                         u.Email.ToLower().Contains(searchLower) ||
                                         u.UserCode.ToLower().Contains(searchLower));
            }

            // Lọc theo Plan
            if (!string.IsNullOrWhiteSpace(plan) && !plan.Equals("Tất cả", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(u => u.Plan == plan);
            }

            // Lọc theo Status
            if (!string.IsNullOrWhiteSpace(status) && !status.Equals("Tất cả", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(u => u.Status == status);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new AdminUserListItemDto
                {
                    Id = u.Id,
                    UserCode = u.UserCode,
                    FullName = u.FullName,
                    Email = u.Email,
                    AvatarUrl = u.AvatarUrl,
                    Plan = u.Plan,
                    Status = u.Status,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return new PagedResult<AdminUserListItemDto>
            {
                Items = items,
                TotalItems = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<AdminUserDetailDto> GetUserDetailAsync(int userId)
        {
            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new KeyNotFoundException($"Không tìm thấy người dùng ID={userId}.");

            // Lấy thông tin thống kê phỏng vấn từ bảng PracticeSessions
            var sessions = await _db.PracticeSessions
                .AsNoTracking()
                .Where(s => s.UserId == userId)
                .ToListAsync();

            var stats = new UserInterviewStatsDto
            {
                TotalSessions = sessions.Count,
                TotalAttempts = sessions.Sum(s => s.AttemptCount),
                BestScore = sessions.Any() ? sessions.Max(s => s.BestScore) : 0,
                AverageLatestScore = sessions.Any() ? Math.Round(sessions.Average(s => s.LatestScore), 1) : 0
            };

            // Mock subscription history dựa trên gói hiện tại
            var subHistory = new List<SubscriptionHistoryDto>
            {
                new SubscriptionHistoryDto
                {
                    Plan = user.Plan,
                    StartDate = user.CreatedAt,
                    EndDate = user.Plan == "Premium" ? user.CreatedAt.AddYears(1) : null,
                    Status = "Active"
                }
            };

            return new AdminUserDetailDto
            {
                Id = user.Id,
                UserCode = user.UserCode,
                FullName = user.FullName,
                Email = user.Email,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role == 1 ? "Admin" : "User",
                Plan = user.Plan,
                Status = user.Status,
                DailyInterviewUsed = user.DailyInterviewUsed,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                UpdatedAt = user.UpdatedAt,
                SubscriptionHistory = subHistory,
                InterviewStats = stats
            };
        }

        public async Task<AdminUserListItemDto> CreateUserAsync(AdminUserCreateDto dto)
        {
            if (await _db.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
            {
                throw new InvalidOperationException("Email đã được sử dụng.");
            }

            var count = await _db.Users.CountAsync();
            var nextNum = count + 1;
            var userCode = $"US{nextNum:D2}";
            while (await _db.Users.AnyAsync(u => u.UserCode == userCode))
            {
                nextNum++;
                userCode = $"US{nextNum:D2}";
            }

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role.Equals("Admin", StringComparison.OrdinalIgnoreCase) ? 1 : 0,
                Plan = dto.Plan,
                Status = "Active",
                UserCode = userCode,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return new AdminUserListItemDto
            {
                Id = user.Id,
                UserCode = user.UserCode,
                FullName = user.FullName,
                Email = user.Email,
                AvatarUrl = user.AvatarUrl,
                Plan = user.Plan,
                Status = user.Status,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<AdminUserListItemDto> UpdateUserAsync(int userId, AdminUserUpdateDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new KeyNotFoundException($"Không tìm thấy người dùng ID={userId}.");

            user.FullName = dto.FullName;
            user.Plan = dto.Plan;
            user.Status = dto.Status;
            user.UpdatedAt = DateTime.UtcNow;

            if (dto.Status == "Locked")
            {
                user.IsLocked = true;
                user.LockReason ??= "Cập nhật thủ công bởi Admin";
            }
            else if (dto.Status == "Active")
            {
                user.IsLocked = false;
                user.LockReason = null;
            }

            await _db.SaveChangesAsync();

            return new AdminUserListItemDto
            {
                Id = user.Id,
                UserCode = user.UserCode,
                FullName = user.FullName,
                Email = user.Email,
                AvatarUrl = user.AvatarUrl,
                Plan = user.Plan,
                Status = user.Status,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<bool> LockUserAsync(int userId, string reason, int currentAdminId)
        {
            if (userId == currentAdminId)
            {
                throw new InvalidOperationException("Bạn không thể tự khóa tài khoản của chính mình.");
            }

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new KeyNotFoundException($"Không tìm thấy người dùng ID={userId}.");

            user.Status = "Locked";
            user.IsLocked = true;
            user.LockReason = reason;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnlockUserAsync(int userId)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new KeyNotFoundException($"Không tìm thấy người dùng ID={userId}.");

            user.Status = "Active";
            user.IsLocked = false;
            user.LockReason = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ResetDailyLimitAsync(int userId)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new KeyNotFoundException($"Không tìm thấy người dùng ID={userId}.");

            user.DailyInterviewUsed = 0;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdatePlanAsync(int userId, string plan)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new KeyNotFoundException($"Không tìm thấy người dùng ID={userId}.");

            user.Plan = plan;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<AdminUserReportDto> GetReportDataAsync(string? search, string? plan, string? status)
        {
            var overview = await GetOverviewAsync();

            var query = _db.Users.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(u => u.FullName.ToLower().Contains(searchLower) ||
                                         u.Email.ToLower().Contains(searchLower) ||
                                         u.UserCode.ToLower().Contains(searchLower));
            }

            if (!string.IsNullOrWhiteSpace(plan) && !plan.Equals("Tất cả", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(u => u.Plan == plan);
            }

            if (!string.IsNullOrWhiteSpace(status) && !status.Equals("Tất cả", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(u => u.Status == status);
            }

            var items = await query
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new AdminUserListItemDto
                {
                    Id = u.Id,
                    UserCode = u.UserCode,
                    FullName = u.FullName,
                    Email = u.Email,
                    AvatarUrl = u.AvatarUrl,
                    Plan = u.Plan,
                    Status = u.Status,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return new AdminUserReportDto
            {
                ReportTitle = "Báo cáo Danh sách Người dùng Hệ thống",
                GeneratedAt = DateTime.UtcNow.AddHours(7).ToString("dd/MM/yyyy HH:mm"),
                Overview = overview,
                Items = items
            };
        }
    }
}
