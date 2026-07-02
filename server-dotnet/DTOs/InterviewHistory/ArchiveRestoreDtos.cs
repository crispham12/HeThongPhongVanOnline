using System;

namespace InterviewPro.API.DTOs.InterviewHistory
{
    public class ArchiveInterviewResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string SessionId { get; set; } = string.Empty;
        public DateTime? ArchivedAt { get; set; }
    }

    public class RestoreInterviewResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string SessionId { get; set; } = string.Empty;
        public DateTime RestoredAt { get; set; }
    }
}
