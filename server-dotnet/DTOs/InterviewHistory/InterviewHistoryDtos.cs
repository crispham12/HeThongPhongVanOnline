using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace InterviewPro.API.DTOs.InterviewHistory
{
    public class InterviewHistoryQueryDto
    {
        public string? Search { get; set; }
        public string? InterviewType { get; set; } = "All"; // All, HR, Technical, Coding, GitHub
        public string? Status { get; set; } = "All"; // All, Ready, AlmostReady, NeedsImprovement, NotReady
        public string? DateRange { get; set; } = "all"; // 7days, 30days, 90days, all
        public string? Sort { get; set; } = "newest"; // newest, oldest, highestScore, lowestScore
        
        [Range(1, int.MaxValue)]
        public int Page { get; set; } = 1;
        
        [Range(1, 50)]
        public int PageSize { get; set; } = 10;
    }

    public class InterviewHistorySummaryDto
    {
        public int TotalInterviews { get; set; }
        public double AverageScore { get; set; }
        public double HighestScore { get; set; }
        public int InterviewReadyPercent { get; set; }
        public int ReadySessions { get; set; }
    }

    public class InterviewHistoryItemDto
    {
        public string SessionId { get; set; } = string.Empty; // SessionGuid
        public string InterviewType { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public double Score { get; set; }
        public string Status { get; set; } = string.Empty;
        public int QuestionsAnswered { get; set; }
        public int TotalQuestions { get; set; }
        public int DurationMinutes { get; set; }
        public DateTime? InterviewDate { get; set; } // CompletedAt or CreatedAt
        public bool HasResult { get; set; }
        
        public string? ProblemId { get; set; }
        public string? TechStack { get; set; }
    }

    public class PaginationDto
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
    }

    public class InterviewHistoryResponseDto
    {
        public InterviewHistorySummaryDto Summary { get; set; } = new InterviewHistorySummaryDto();
        public List<InterviewHistoryItemDto> Items { get; set; } = new List<InterviewHistoryItemDto>();
        public PaginationDto Pagination { get; set; } = new PaginationDto();
    }
}
