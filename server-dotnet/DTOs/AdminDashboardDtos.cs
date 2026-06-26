namespace InterviewPro.API.DTOs
{
    public class AdminDashboardOverviewDto
    {
        public AdminDashboardKpiDto Kpis { get; set; } = new();
        public List<AdminDashboardChartItemDto> ChartData { get; set; } = new();
        public List<AdminDashboardRecentInterviewDto> RecentInterviews { get; set; } = new();
        public AdminDashboardSystemStatusDto SystemStatus { get; set; } = new();
    }

    public class AdminDashboardKpiDto
    {
        public KpiMetric TotalUsers { get; set; } = new();
        public KpiMetric TotalInterviews { get; set; } = new();
        public KpiMetric TotalRevenue { get; set; } = new();
        public KpiMetric TotalAiRequests { get; set; } = new();
    }

    public class KpiMetric
    {
        public string Value { get; set; } = string.Empty;
        public string Trend { get; set; } = string.Empty;
        public bool TrendUp { get; set; }
    }

    public class AdminDashboardChartItemDto
    {
        public string Name { get; set; } = string.Empty;
        public int PhongVan { get; set; }
        public double DoanhThu { get; set; }
    }

    public class AdminDashboardRecentInterviewDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Score { get; set; } = string.Empty;
        public bool Live { get; set; }
    }

    public class AdminDashboardSystemStatusDto
    {
        public int ActiveSessions { get; set; }
        public int ServerLoad { get; set; }
        public int UserRetention { get; set; }
        public string SystemHealth { get; set; } = "OK";
    }
}
