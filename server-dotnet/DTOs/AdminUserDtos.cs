using System;
using System.Collections.Generic;

namespace InterviewPro.API.DTOs
{
    public class AdminUserOverviewDto
    {
        public int TotalUsers { get; set; }
        public int PremiumUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int LockedUsers { get; set; }
    }

    public class AdminUserListItemDto
    {
        public int Id { get; set; }
        public string UserCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string Plan { get; set; } = "Free";
        public string Status { get; set; } = "Active";
        public DateTime CreatedAt { get; set; }
    }

    public class AdminUserDetailDto
    {
        public int Id { get; set; }
        public string UserCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string Role { get; set; } = "User";
        public string Plan { get; set; } = "Free";
        public string Status { get; set; } = "Active";
        
        public int DailyInterviewUsed { get; set; }
        public int DailyGithubAnalysisUsed { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public List<SubscriptionHistoryDto> SubscriptionHistory { get; set; } = new();
        public UserInterviewStatsDto InterviewStats { get; set; } = new();
    }

    public class SubscriptionHistoryDto
    {
        public string Plan { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; } = string.Empty; // Active, Expired
    }

    public class UserInterviewStatsDto
    {
        public int TotalSessions { get; set; }
        public int TotalAttempts { get; set; }
        public double BestScore { get; set; }
        public double AverageLatestScore { get; set; }
    }

    public class AdminUserCreateDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Plan { get; set; } = "Free";
        public string Role { get; set; } = "User"; // User or Admin
    }

    public class AdminUserUpdateDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Plan { get; set; } = "Free";
        public string Status { get; set; } = "Active";
    }

    public class AdminUserLockDto
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class AdminUserReportDto
    {
        public string ReportTitle { get; set; } = "Báo cáo Quản lý Người dùng";
        public string GeneratedAt { get; set; } = string.Empty;
        public AdminUserOverviewDto Overview { get; set; } = new();
        public List<AdminUserListItemDto> Items { get; set; } = new();
    }
}
