using System.Threading.Tasks;
using InterviewPro.API.DTOs;

namespace InterviewPro.API.Interfaces
{
    // ─────────────────────────────────────────────────────
    // IHrAiClient: Giao tiếp với Python FastAPI AI Service
    // Tách riêng để dễ mock trong unit test và thay thế provider
    // ─────────────────────────────────────────────────────
    public interface IHrAiClient
    {
        /// <summary>
        /// Gọi AI sinh 10 câu hỏi HR phù hợp với Role, Difficulty, TechStack.
        /// </summary>
        Task<AiGeneratedQuestionsResult> GenerateHrQuestionsAsync(
            string role, string difficulty, List<string> techStack);


        /// <summary>
        /// Gọi AI đánh giá câu trả lời theo 5 tiêu chí với rubric chuẩn.
        /// </summary>
        Task<AiEvaluationResult> EvaluateHrAnswerAsync(
            string role, string difficulty, List<string> techStack,
            string question, string answer);

        /// <summary>
        /// Gọi AI tổng hợp kết quả cuối sau khi hoàn thành 10 câu.
        /// </summary>
        Task<HrFinalResultResponse> GenerateHrFinalResultAsync(
            string sessionId, string role, string difficulty,
            List<AiAnswerSummary> answers);
    }

    // ─────────────────────────────────────────────────────
    // IHrInterviewService: Business logic HR Interview
    // ─────────────────────────────────────────────────────
    public interface IHrInterviewService
    {
        Task<StartHrInterviewResponse> StartInterviewAsync(
            int userId, StartHrInterviewRequest request);

        Task<HrSessionDetailResponse> GetInterviewAsync(
            int userId, string sessionId);

        Task SaveDraftAsync(
            int userId, string sessionId, string questionId, SubmitHrAnswerRequest request);

        Task<SubmitHrAnswerRequest?> GetDraftAsync(
            int userId, string sessionId, string questionId);

        Task DeleteDraftAsync(
            int userId, string sessionId, string questionId);

        Task<SubmitHrAnswerResponse> SubmitAnswerAsync(
            int userId, string sessionId, SubmitHrAnswerRequest request);

        Task<HrFinalResultResponse> GetFinalResultAsync(
            int userId, string sessionId);

        Task<List<HrSessionHistoryItem>> GetHistoryAsync(int userId);
    }

    // ─────────────────────────────────────────────────────
    // Data transfer models giữa service và AI client
    // ─────────────────────────────────────────────────────
    public class AiGeneratedQuestionsResult
    {
        public List<AiGeneratedQuestion> Questions { get; set; } = new();
    }

    public class AiGeneratedQuestion
    {
        public int QuestionIndex { get; set; }
        public string Category { get; set; } = string.Empty;
        public string QuestionText { get; set; } = string.Empty;
        public string ExpectedAnswerGuide { get; set; } = string.Empty;
    }


    public class AiEvaluationResult
    {
        public string Summary { get; set; } = string.Empty;
        public int StarCompletion { get; set; }
        public StarChecklist StarChecklist { get; set; } = new();
        public StarAnalysisResult StarAnalysis { get; set; } = new();
        public List<string> Strengths { get; set; } = new();
        public List<string> Weaknesses { get; set; } = new();
        public List<string> ImprovementSuggestions { get; set; } = new();
        public ImprovedAnswerResult ImprovedAnswer { get; set; } = new();
        public string NextRecommendation { get; set; } = string.Empty;
    }

    public class StarChecklist
    {
        public bool Situation { get; set; }
        public bool Task { get; set; }
        public bool Action { get; set; }
        public bool Result { get; set; }
    }

    public class StarScoreItem
    {
        public double Score { get; set; }
        public string Feedback { get; set; } = string.Empty;
    }

    public class StarAnalysisResult
    {
        public StarScoreItem Situation { get; set; } = new();
        public StarScoreItem Task { get; set; } = new();
        public StarScoreItem Action { get; set; } = new();
        public StarScoreItem Result { get; set; } = new();
    }

    public class ImprovedAnswerResult
    {
        public string Situation { get; set; } = string.Empty;
        public string Task { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Result { get; set; } = string.Empty;
    }

    public class AiAnswerSummary
    {
        public string Question { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
        public string Transcript { get; set; } = string.Empty;
        public int DurationSeconds { get; set; }
        public int WordCount { get; set; }
        public int FillerWords { get; set; }
        public double Score { get; set; }
        public string Feedback { get; set; } = string.Empty;
    }
}
