using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InterviewPro.API.Services
{
    public class CandidateReportService : ICandidateReportService
    {
        private readonly AppDbContext _db;

        public CandidateReportService(AppDbContext db)
        {
            _db = db;
        }

        private static T Deserialize<T>(string? json, T defaultVal)
        {
            if (string.IsNullOrEmpty(json)) return defaultVal;
            try { return JsonSerializer.Deserialize<T>(json) ?? defaultVal; }
            catch { return defaultVal; }
        }

        public async Task<CandidateReportResponse> GetReportAsync(int userId, string sessionGuid)
        {
            if (sessionGuid == "test-mock")
            {
                return GetTestMockReport();
            }

            var report = await _db.CandidateReports
                .Include(r => r.HrReport)
                .Include(r => r.TechnicalReport)
                .Include(r => r.CodingReport)
                .FirstOrDefaultAsync(r => r.UserId == userId && r.SessionGuid == sessionGuid);

            if (report == null)
            {
                // Tự động sinh báo cáo từ các vòng thi hiện có nếu chưa lưu
                report = await GenerateReportFromSessionsAsync(userId, sessionGuid);
                if (report == null)
                {
                    throw new KeyNotFoundException("Không tìm thấy báo cáo phỏng vấn.");
                }
            }

            return MapToResponse(report);
        }

        public async Task<HRReportDto> GetHrReportAsync(int userId, string sessionGuid)
        {
            var res = await GetReportAsync(userId, sessionGuid);
            return res.HrReport ?? new HRReportDto();
        }

        public async Task<TechnicalReportDto> GetTechnicalReportAsync(int userId, string sessionGuid)
        {
            var res = await GetReportAsync(userId, sessionGuid);
            return res.TechnicalReport ?? new TechnicalReportDto();
        }

        public async Task<CodingReportDto> GetCodingReportAsync(int userId, string sessionGuid)
        {
            var res = await GetReportAsync(userId, sessionGuid);
            return res.CodingReport ?? new CodingReportDto();
        }

        public async Task<CompetencyProfileDto> GetCompetencyProfileAsync(int userId, string sessionGuid)
        {
            var res = await GetReportAsync(userId, sessionGuid);
            return res.CompetencyProfile ?? new CompetencyProfileDto();
        }

        private CandidateReportResponse MapToResponse(CandidateReport report)
        {
            var hr = report.HrReport;
            var tech = report.TechnicalReport;
            var coding = report.CodingReport;

            var hrDto = hr != null ? new HRReportDto
            {
                OverallHrScore = hr.OverallHrScore,
                Communication = hr.CommunicationScore,
                Motivation = hr.MotivationScore,
                ProblemSolvingMindset = hr.ProblemSolvingScore,
                Teamwork = hr.TeamworkScore,
                Adaptability = hr.AdaptabilityScore,
                Professionalism = hr.ProfessionalismScore,
                SelfAwareness = hr.SelfAwarenessScore,
                Strengths = Deserialize(hr.StrengthsJson, new List<string>()),
                AreasForImprovement = Deserialize(hr.ImprovementsJson, new List<string>()),
                AiSummary = hr.AiSummary,
                HrRecommendation = hr.HrRecommendation
            } : null;

            var techDto = tech != null ? new TechnicalReportDto
            {
                OverallTechnicalScore = tech.OverallTechnicalScore,
                TechnicalKnowledge = tech.TechnicalKnowledgeScore,
                ProblemSolving = tech.ProblemSolvingScore,
                PracticalExperience = tech.PracticalExperienceScore,
                SystemThinking = tech.SystemThinkingScore,
                Communication = tech.CommunicationScore,
                BestPractices = tech.BestPracticesScore,
                Strengths = Deserialize(tech.StrengthsJson, new List<string>()),
                Weaknesses = Deserialize(tech.WeaknessesJson, new List<string>()),
                AiSummary = tech.AiSummary,
                TechnicalRecommendation = tech.TechnicalRecommendation
            } : null;

            var codingDto = coding != null ? new CodingReportDto
            {
                OverallCodingScore = coding.OverallCodingScore,
                ProblemUnderstanding = coding.ProblemUnderstandingScore,
                AlgorithmDesign = coding.AlgorithmDesignScore,
                CodeCorrectness = coding.CodeCorrectnessScore,
                CodeQuality = coding.CodeQualityScore,
                ComplexityAnalysis = coding.ComplexityAnalysisScore,
                TestingValidation = coding.TestingValidationScore,
                Communication = coding.CommunicationScore,
                Strengths = Deserialize(coding.StrengthsJson, new List<string>()),
                Weaknesses = Deserialize(coding.WeaknessesJson, new List<string>()),
                LearningRoadmap = Deserialize(coding.LearningRoadmapJson, new List<string>()),
                CodingRecommendation = coding.CodingRecommendation
            } : null;

            // Tính toán Competency Profile (Trọng số phối hợp từ các vòng)
            var profile = new CompetencyProfileDto
            {
                Communication = (float)Math.Round((hrDto?.Communication * 0.5f ?? 4.0f) + (techDto?.Communication * 0.3f ?? 2.4f) + (codingDto?.Communication * 0.2f ?? 1.6f), 1),
                ProblemSolving = (float)Math.Round((hrDto?.ProblemSolvingMindset * 0.3f ?? 2.4f) + (techDto?.ProblemSolving * 0.4f ?? 3.2f) + (codingDto?.ProblemUnderstanding * 0.3f ?? 2.4f), 1),
                TechnicalKnowledge = techDto?.TechnicalKnowledge ?? 7.0f,
                CodingAbility = codingDto?.CodeCorrectness ?? 7.0f,
                SystemThinking = techDto?.SystemThinking ?? 6.5f,
                Professionalism = hrDto?.Professionalism ?? 7.5f,
                Teamwork = hrDto?.Teamwork ?? 8.0f,
                LearningAbility = (float)Math.Round((hrDto?.SelfAwareness * 0.4f ?? 3.2f) + (codingDto?.ComplexityAnalysis * 0.6f ?? 4.2f), 1)
            };

            return new CandidateReportResponse
            {
                SessionGuid = report.SessionGuid,
                CandidateName = report.CandidateName,
                TargetRole = report.TargetRole,
                Level = report.Level,
                OverallScore = report.OverallScore,
                HiringRecommendation = report.HiringRecommendation,
                ConfidenceScore = report.ConfidenceScore,
                AiAssessmentSummary = report.AiAssessmentSummary,
                CreatedAt = report.CreatedAt,
                HrReport = hrDto,
                TechnicalReport = techDto,
                CodingReport = codingDto,
                CompetencyProfile = profile,
                LearningRoadmap = codingDto != null 
                    ? codingDto.LearningRoadmap.Select(r => new LearningRoadmapItemDto { Topic = r, Resource = "Tài liệu học tập tương ứng" }).ToList()
                    : new List<LearningRoadmapItemDto>()
            };
        }

        private async Task<CandidateReport?> GenerateReportFromSessionsAsync(int userId, string sessionGuid)
        {
            var fullMock = await _db.FullMockSessions
                .FirstOrDefaultAsync(s => s.SessionGuid == sessionGuid && s.UserId == userId);

            string hrGuid = fullMock?.HrSessionGuid ?? "";
            string techGuid = fullMock?.TechnicalSessionGuid ?? "";
            string codingGuid = fullMock?.CodingSessionGuid ?? "";

            var user = await _db.Users.FindAsync(userId);
            var name = user?.FullName ?? "Ứng viên Mock";

            // 1. HR Session evaluation
            bool hrSkipped = string.IsNullOrEmpty(hrGuid) || hrGuid.Contains("skipped");
            float hrScore = 0f;
            string hrAiSummary = hrSkipped ? "Vòng HR Behavioral đã bị bỏ qua." : "Ứng viên thể hiện tốt trong vòng phỏng vấn hành vi.";
            if (!hrSkipped)
            {
                var hrSession = await _db.HrInterviewSessions.FirstOrDefaultAsync(h => h.SessionGuid == hrGuid);
                if (hrSession != null)
                {
                    hrScore = (float)(hrSession.FinalScore ?? 0.0);
                    hrAiSummary = hrSession.FinalSummary ?? hrAiSummary;
                }
            }

            // 2. Technical Session evaluation
            bool techSkipped = string.IsNullOrEmpty(techGuid) || techGuid.Contains("skipped");
            float techScore = 0f;
            string techAiSummary = techSkipped ? "Vòng Technical đã bị bỏ qua." : "Ứng viên nắm được các kiến thức kỹ thuật cơ bản.";
            if (!techSkipped)
            {
                var techSession = await _db.InterviewSessions.FirstOrDefaultAsync(t => t.SessionGuid == techGuid);
                if (techSession != null)
                {
                    techScore = (float)techSession.OverallScore;
                    techAiSummary = techSession.OverallFeedback ?? techAiSummary;
                }
            }

            // 3. Coding Session evaluation
            bool codingSkipped = string.IsNullOrEmpty(codingGuid) || codingGuid.Contains("skipped");
            float overallCodingScore = 0.0f;
            float problemUnderstanding = 7.0f;
            float algorithmDesign = 7.0f;
            float codeCorrectness = 7.0f;
            float codeQuality = 7.0f;
            float complexityAnalysis = 7.0f;
            float testingValidation = 7.0f;
            float communication = 7.0f;
            string strengthsJson = "[]";
            string weaknessesJson = "[]";
            string learningRoadmapJson = "[]";

            if (!codingSkipped)
            {
                var codingSession = await _db.CodingInterviewSessions
                    .Include(s => s.Problems)
                    .FirstOrDefaultAsync(s => s.UserId == userId && s.SessionGuid == codingGuid);

                if (codingSession != null)
                {
                    overallCodingScore = codingSession.OverallScore;
                    problemUnderstanding = codingSession.AvgProblemUnderstandingScore;
                    algorithmDesign = codingSession.AvgAlgorithmDesignScore;
                    codeCorrectness = codingSession.AvgCorrectnessScore;
                    codeQuality = codingSession.AvgQualityScore;
                    complexityAnalysis = codingSession.AvgComplexityScore;
                    testingValidation = codingSession.AvgTestingScore;
                    communication = codingSession.AvgCommunicationScore;
                    strengthsJson = "[\"Viết code tối ưu O(N)\", \"Đặt tên biến chuẩn\"]";
                    weaknessesJson = "[\"Thiếu một số edge case biên\"]";
                    learningRoadmapJson = "[\"Tối ưu thuật toán nâng cao\", \"Clean Code Conventions\"]";
                }
                else
                {
                    var legacySession = await _db.InterviewSessions
                        .FirstOrDefaultAsync(s => s.UserId == userId && s.SessionGuid == codingGuid);

                    if (legacySession != null)
                    {
                        overallCodingScore = (float)legacySession.OverallScore;

                        try
                        {
                            var legacyScores = JsonSerializer.Deserialize<List<JsonElement>>(legacySession.OverallFeedback);
                            if (legacyScores != null && legacyScores.Count > 0)
                            {
                                var listStrengths = new List<string>();
                                float totalCorrectness = 0;
                                float totalQuality = 0;
                                float totalComplexity = 0;

                                foreach (var p in legacyScores)
                                {
                                    var title = p.GetProperty("title").GetString();
                                    var feedback = p.GetProperty("feedback").GetString() ?? "";
                                    listStrengths.Add($"{title}: {feedback}");

                                    if (p.TryGetProperty("score", out var sc))
                                    {
                                        float sVal = (float)sc.GetDouble();
                                        totalCorrectness += sVal / 10.0f;
                                    }
                                    if (p.TryGetProperty("qualityScore", out var qs))
                                    {
                                        totalQuality += (float)qs.GetDouble() / 3.0f;
                                    }
                                    if (p.TryGetProperty("complexityScore", out var cx))
                                    {
                                        totalComplexity += (float)cx.GetDouble() / 2.0f;
                                    }
                                }

                                codeCorrectness = (float)Math.Round(totalCorrectness / legacyScores.Count, 1);
                                codeQuality = (float)Math.Round(totalQuality / legacyScores.Count, 1);
                                complexityAnalysis = (float)Math.Round(totalComplexity / legacyScores.Count, 1);
                                
                                strengthsJson = JsonSerializer.Serialize(listStrengths);
                                weaknessesJson = "[]";
                                learningRoadmapJson = "[\"Tối ưu hóa thuật toán nâng cao\", \"Clean Code Conventions\"]";
                            }
                        }
                        catch
                        {
                            codeCorrectness = overallCodingScore;
                            codeQuality = 7.5f;
                            complexityAnalysis = 7.0f;
                        }
                    }
                }
            }

            // Calculate overall mock score
            float overallScore = (hrScore * 0.3f) + (techScore * 0.4f) + (overallCodingScore * 0.3f);

            // Tạo Candidate Report mặc định lưu trữ
            var report = new CandidateReport
            {
                SessionGuid = sessionGuid,
                UserId = userId,
                CandidateName = name,
                TargetRole = fullMock?.Role ?? "Developer",
                Level = fullMock?.Difficulty ?? "Fresher",
                OverallScore = overallScore,
                HiringRecommendation = overallScore >= 8.0f ? "Strong Hire" : (overallScore >= 6.5f ? "Hire" : "Borderline"),
                ConfidenceScore = 85.0f,
                AiAssessmentSummary = $"Ứng viên {name} đã hoàn thành buổi phỏng vấn thử Full Mock."
            };

            _db.CandidateReports.Add(report);
            await _db.SaveChangesAsync();

            // HR Report
            var hr = new HRReport
            {
                CandidateReportId = report.Id,
                OverallHrScore = hrScore,
                CommunicationScore = hrSkipped ? 0f : 8.0f,
                MotivationScore = hrSkipped ? 0f : 7.0f,
                ProblemSolvingScore = hrSkipped ? 0f : 7.5f,
                TeamworkScore = hrSkipped ? 0f : 8.0f,
                AdaptabilityScore = hrSkipped ? 0f : 7.0f,
                ProfessionalismScore = hrSkipped ? 0f : 8.0f,
                SelfAwarenessScore = hrSkipped ? 0f : 7.5f,
                StrengthsJson = hrSkipped ? "[]" : "[\"Giao tiếp mạch lạc\", \"Tinh thần làm việc nhóm cao\"]",
                ImprovementsJson = hrSkipped ? "[]" : "[\"Cần làm rõ động lực cá nhân\"]",
                AiSummary = hrAiSummary,
                HrRecommendation = hrScore >= 7.0f ? "Hire" : "Borderline"
            };

            // Technical Report
            var tech = new TechnicalReport
            {
                CandidateReportId = report.Id,
                OverallTechnicalScore = techScore,
                TechnicalKnowledgeScore = techSkipped ? 0f : 8.0f,
                ProblemSolvingScore = techSkipped ? 0f : 7.5f,
                PracticalExperienceScore = techSkipped ? 0f : 7.8f,
                SystemThinkingScore = techSkipped ? 0f : 7.0f,
                CommunicationScore = techSkipped ? 0f : 8.0f,
                BestPracticesScore = techSkipped ? 0f : 8.5f,
                StrengthsJson = techSkipped ? "[]" : "[\"Hiểu sâu về cấu trúc dữ liệu\", \"Áp dụng tốt design patterns\"]",
                WeaknessesJson = techSkipped ? "[]" : "[\"Tư duy hệ thống phân tán cần cải thiện thêm\"]",
                AiSummary = techAiSummary,
                TechnicalRecommendation = techScore >= 7.0f ? "Hire" : "Borderline"
            };

            // Coding Report
            var coding = new CodingReport
            {
                CandidateReportId = report.Id,
                OverallCodingScore = overallCodingScore,
                ProblemUnderstandingScore = problemUnderstanding,
                AlgorithmDesignScore = algorithmDesign,
                CodeCorrectnessScore = codeCorrectness,
                CodeQualityScore = codeQuality,
                ComplexityAnalysisScore = complexityAnalysis,
                TestingValidationScore = testingValidation,
                CommunicationScore = communication,
                StrengthsJson = strengthsJson,
                WeaknessesJson = weaknessesJson,
                LearningRoadmapJson = learningRoadmapJson,
                CodingRecommendation = overallCodingScore >= 7.0f ? "Hire" : "Borderline"
            };

            _db.HRReports.Add(hr);
            _db.TechnicalReports.Add(tech);
            _db.CodingReports.Add(coding);
            await _db.SaveChangesAsync();

            return report;
        }

        private CandidateReportResponse GetTestMockReport()
        {
            return new CandidateReportResponse
            {
                SessionGuid = "test-mock",
                CandidateName = "Nguyễn Văn A",
                TargetRole = "Senior Java Backend Developer",
                Level = "Senior",
                OverallScore = 8.4f,
                HiringRecommendation = "Strong Hire",
                ConfidenceScore = 90.0f,
                AiAssessmentSummary = "Ứng viên có kỹ năng viết code vượt trội, tư duy giải thuật xuất sắc và phản biện kiến trúc rõ ràng. Rất phù hợp với vai trò Backend Senior.",
                CreatedAt = DateTime.UtcNow,
                HrReport = new HRReportDto
                {
                    OverallHrScore = 8.5f,
                    Communication = 9.0f,
                    Motivation = 8.0f,
                    ProblemSolvingMindset = 8.5f,
                    Teamwork = 9.0f,
                    Adaptability = 8.0f,
                    Professionalism = 9.0f,
                    SelfAwareness = 8.5f,
                    Strengths = new List<string> { "Phong thái tự tin", "Cấu trúc STAR mạch lạc", "Khả năng lãnh đạo nhóm" },
                    AreasForImprovement = new List<string> { "Nói hơi nhanh khi giải thích tình huống phức tạp" },
                    AiSummary = "Giao tiếp thuyết phục, phong thái lãnh đạo nhóm tự nhiên.",
                    HrRecommendation = "Strong Hire"
                },
                TechnicalReport = new TechnicalReportDto
                {
                    OverallTechnicalScore = 8.2f,
                    TechnicalKnowledge = 8.5f,
                    ProblemSolving = 8.0f,
                    PracticalExperience = 8.5f,
                    SystemThinking = 8.0f,
                    Communication = 8.0f,
                    BestPractices = 8.5f,
                    Strengths = new List<string> { "Nắm vững JVM Internals", "Hiểu sâu Database Indexing & Locks" },
                    Weaknesses = new List<string> { "Cơ chế phân tán Event Sourcing cần thêm kinh nghiệm thực tế" },
                    AiSummary = "Kiến thức chuyên môn vững vàng, có chiều sâu.",
                    TechnicalRecommendation = "Hire"
                },
                CodingReport = new CodingReportDto
                {
                    OverallCodingScore = 8.8f,
                    ProblemUnderstanding = 9.0f,
                    AlgorithmDesign = 9.0f,
                    CodeCorrectness = 8.5f,
                    CodeQuality = 9.0f,
                    ComplexityAnalysis = 8.5f,
                    TestingValidation = 8.5f,
                    Communication = 9.0f,
                    Strengths = new List<string> { "Viết code sạch sẽ, chuẩn mực SOLID", "Tối ưu hóa Big O tối đa" },
                    Weaknesses = new List<string> { "Một lỗi logic nhỏ ở biên Array Index Out Of Bounds trong testcase 5" },
                    LearningRoadmap = new List<string> { "Distributed Systems Design", "High Performance Java Concurrency" },
                    CodingRecommendation = "Strong Hire"
                },
                CompetencyProfile = new CompetencyProfileDto
                {
                    Communication = 8.9f,
                    ProblemSolving = 8.3f,
                    TechnicalKnowledge = 8.5f,
                    CodingAbility = 8.5f,
                    SystemThinking = 8.0f,
                    Professionalism = 9.0f,
                    Teamwork = 9.0f,
                    LearningAbility = 8.5f
                },
                LearningRoadmap = new List<LearningRoadmapItemDto>
                {
                    new LearningRoadmapItemDto { Topic = "Distributed Systems Design", Resource = "Đọc Designing Data-Intensive Applications" },
                    new LearningRoadmapItemDto { Topic = "High Performance Java Concurrency", Resource = "Java Concurrency in Practice" }
                }
            };
        }
    }
}
