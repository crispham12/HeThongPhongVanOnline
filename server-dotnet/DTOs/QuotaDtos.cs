namespace InterviewPro.API.DTOs
{
    public class QuotaStatusDto
    {
        public string Plan { get; set; } = "Free";
        public int DailyUsed { get; set; }
        public int DailyLimit { get; set; } // 3 với Free, -1 với Premium (không giới hạn)
        public int Remaining { get; set; }  // DailyLimit - DailyUsed, -1 nếu Premium
        public bool IsUnlimited { get; set; }
    }
}
