using System.Collections.Generic;

namespace InterviewPro.API.DTOs
{
    // Request: Tạo Full Mock session
    public record CreateFullMockRequest(
        string Role,
        string Difficulty,
        List<string> Stack
    );

    // Request: Hoàn thành 1 vòng
    public record CompleteRoundRequest(
        string Round,        // "HR" | "Technical" | "Coding"
        string RoundSessionGuid  // SessionGuid của vòng vừa hoàn thành
    );

    // Response: Trả về sau khi tạo session
    public record CreateFullMockResponse(
        string FullMockSessionGuid,
        string Message
    );

    // Response: Báo cáo tổng hợp
    public record FullMockReportResponse(
        string FullMockSessionGuid,
        string Role,
        string Difficulty,
        List<string> CompletedRounds,
        RoundSummary? HrSummary,
        RoundSummary? TechnicalSummary,
        RoundSummary? CodingSummary,
        double TotalScore,       // HR*0.3 + Technical*0.4 + Coding*0.3
        string Status,
        System.DateTime CreatedAt,
        System.DateTime? CompletedAt
    );

    public record RoundSummary(
        string Round,
        double Score,
        string? Summary
    );
}
