using System;

namespace InterviewPro.API.Entities
{
    public class FullMockSession
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string SessionGuid { get; set; } = Guid.NewGuid().ToString();
        public string Role { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string TechStackJson { get; set; } = "[]";
        public string Status { get; set; } = "InProgress"; // InProgress | Completed | Abandoned
        public string CompletedRoundsJson { get; set; } = "[]"; // ["HR","Technical","Coding"]

        // FK đến 3 session con — null cho đến khi vòng đó được tạo
        public string? HrSessionGuid { get; set; }
        public string? TechnicalSessionGuid { get; set; }
        public string? CodingSessionGuid { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
    }
}
