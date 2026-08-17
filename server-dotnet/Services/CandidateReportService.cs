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

            var response = new CandidateReportResponse
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

            // AI Suggestion based on weaknesses (Bug 3 Fix)
            if (techDto != null && techDto.OverallTechnicalScore < 7.0f)
            {
                var techQuestions = _db.Questions
                    .Where(q => q.Category == "Technical" && (q.Difficulty == report.Level || q.Role == report.TargetRole))
                    .OrderBy(q => Guid.NewGuid())
                    .Take(3)
                    .Select(q => new RecommendedPracticeQuestionDto {
                        Id = q.Id.ToString(),
                        Title = q.Title,
                        Type = "Technical",
                        Difficulty = q.Difficulty
                    }).ToList();
                response.RecommendedPracticeQuestions.AddRange(techQuestions);
            }

            if (codingDto != null && codingDto.OverallCodingScore < 7.0f)
            {
                var codingProblems = _db.CodingProblems
                    .Where(p => p.Difficulty == report.Level)
                    .OrderBy(p => Guid.NewGuid())
                    .Take(2)
                    .Select(p => new RecommendedPracticeQuestionDto {
                        Id = p.Id.ToString(),
                        Title = p.Title,
                        Type = "Coding",
                        Difficulty = p.Difficulty
                    }).ToList();
                response.RecommendedPracticeQuestions.AddRange(codingProblems);
            }

            return response;
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
            string hrAiSummary = hrSkipped ? "Vòng HR Behavioral đã bị bỏ qua." : "Ứng viên chưa hoàn thành vòng HR hoặc chưa có báo cáo.";
            HrInterviewEvaluation? hrFinalResult = null;
            
            if (!hrSkipped)
            {
                var hrSession = await _db.HrInterviewSessions
                    .Include(h => h.FinalResult)
                        .ThenInclude(f => f.Strengths)
                    .Include(h => h.FinalResult)
                        .ThenInclude(f => f.Improvements)
                    .FirstOrDefaultAsync(h => h.SessionGuid == hrGuid);

                if (hrSession != null)
                {
                    hrScore = (float)(hrSession.FinalScore ?? 0.0);
                    hrAiSummary = hrSession.FinalSummary ?? hrAiSummary;
                    hrFinalResult = hrSession.FinalResult;
                }
            }

            // 2. Technical Session evaluation
            bool techSkipped = string.IsNullOrEmpty(techGuid) || techGuid.Contains("skipped");
            float techScore = 0f;
            string techAiSummary = techSkipped ? "Vòng Technical đã bị bỏ qua." : "Ứng viên chưa hoàn thành vòng Technical hoặc chưa có báo cáo.";
            var techFeedbackDict = new Dictionary<string, object>();
            
            if (!techSkipped)
            {
                var techSession = await _db.TechnicalInterviewSessions.FirstOrDefaultAsync(t => t.SessionGuid == techGuid);
                if (techSession != null)
                {
                    techScore = techSession.OverallScore;
                    if (!string.IsNullOrEmpty(techSession.FinalFeedbackJson))
                    {
                        try {
                            using var doc = JsonDocument.Parse(techSession.FinalFeedbackJson);
                            var root = doc.RootElement;
                            if (root.TryGetProperty("scores", out var scoresEl)) {
                                if (scoresEl.TryGetProperty("technicalKnowledge", out var tk)) techFeedbackDict["technicalKnowledge"] = tk.GetDouble();
                                if (scoresEl.TryGetProperty("problemSolving", out var ps)) techFeedbackDict["problemSolving"] = ps.GetDouble();
                                if (scoresEl.TryGetProperty("practicalExperience", out var pe)) techFeedbackDict["practicalExperience"] = pe.GetDouble();
                                if (scoresEl.TryGetProperty("systemDesign", out var sd)) techFeedbackDict["systemDesign"] = sd.GetDouble();
                                if (scoresEl.TryGetProperty("communication", out var cm)) techFeedbackDict["communication"] = cm.GetDouble();
                                if (scoresEl.TryGetProperty("bestPractices", out var bp)) techFeedbackDict["bestPractices"] = bp.GetDouble();
                            }
                            
                            // Handling array of objects to array of strings
                            if (root.TryGetProperty("strengths", out var strEl) && strEl.ValueKind == JsonValueKind.Array) 
                            {
                                var strList = new List<string>();
                                foreach (var s in strEl.EnumerateArray()) {
                                    if (s.ValueKind == JsonValueKind.Object && s.TryGetProperty("title", out var title)) strList.Add(title.GetString() ?? "");
                                    else if (s.ValueKind == JsonValueKind.String) strList.Add(s.GetString() ?? "");
                                }
                                techFeedbackDict["strengths"] = JsonSerializer.Serialize(strList);
                            }
                            if (root.TryGetProperty("weaknesses", out var weakEl) && weakEl.ValueKind == JsonValueKind.Array)
                            {
                                var weakList = new List<string>();
                                foreach (var w in weakEl.EnumerateArray()) {
                                    if (w.ValueKind == JsonValueKind.Object && w.TryGetProperty("title", out var title)) weakList.Add(title.GetString() ?? "");
                                    else if (w.ValueKind == JsonValueKind.String) weakList.Add(w.GetString() ?? "");
                                }
                                techFeedbackDict["weaknesses"] = JsonSerializer.Serialize(weakList);
                            }
                            if (root.TryGetProperty("summary", out var sumEl)) techAiSummary = sumEl.GetString() ?? techAiSummary;
                        } catch {}
                    }
                }
                else
                {
                    var legacySession = await _db.InterviewSessions.FirstOrDefaultAsync(t => t.SessionGuid == techGuid);
                    if (legacySession != null)
                    {
                        techScore = (float)legacySession.OverallScore;
                        techAiSummary = legacySession.OverallFeedback ?? techAiSummary;
                    }
                }
            }

            // 3. Coding Session evaluation
            bool codingSkipped = string.IsNullOrEmpty(codingGuid) || codingGuid.Contains("skipped");
            float overallCodingScore = 0.0f;
            float problemUnderstanding = 0.0f;
            float algorithmDesign = 0.0f;
            float codeCorrectness = 0.0f;
            float codeQuality = 0.0f;
            float complexityAnalysis = 0.0f;
            float testingValidation = 0.0f;
            float communication = 0.0f;
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
                    
                    if (!string.IsNullOrEmpty(codingSession.FinalReportJson))
                    {
                        try {
                            using var doc = JsonDocument.Parse(codingSession.FinalReportJson);
                            var root = doc.RootElement;
                            if (root.TryGetProperty("strengths", out var sEl)) strengthsJson = sEl.ToString();
                            if (root.TryGetProperty("weaknesses", out var wEl)) weaknessesJson = wEl.ToString();
                            if (root.TryGetProperty("roadmap", out var rEl)) learningRoadmapJson = rEl.ToString();
                        } catch {}
                    }
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
                            }
                        }
                        catch
                        {
                            codeCorrectness = overallCodingScore;
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
                ConfidenceScore = hrFinalResult != null ? (float)hrFinalResult.ConfidenceScore : 85.0f,
                AiAssessmentSummary = $"Ứng viên {name} đã hoàn thành buổi phỏng vấn thử Full Mock."
            };

            _db.CandidateReports.Add(report);
            await _db.SaveChangesAsync();

            // HR Report
            var hr = new HRReport
            {
                CandidateReportId = report.Id,
                OverallHrScore = hrScore,
                CommunicationScore = hrFinalResult != null ? (float)hrFinalResult.CommunicationScore : 0f,
                MotivationScore = hrFinalResult != null ? (float)hrFinalResult.StarStructureScore : 0f,
                ProblemSolvingScore = hrFinalResult != null ? (float)hrFinalResult.LogicScore : 0f,
                TeamworkScore = hrFinalResult != null ? (float)hrFinalResult.CompletenessScore : 0f,
                AdaptabilityScore = hrFinalResult != null ? (float)hrFinalResult.ClarityScore : 0f,
                ProfessionalismScore = hrFinalResult != null ? (float)hrFinalResult.ProfessionalismScore : 0f,
                SelfAwarenessScore = hrFinalResult != null ? (float)hrFinalResult.ConfidenceScore : 0f,
                StrengthsJson = hrFinalResult != null && hrFinalResult.Strengths.Any() ? JsonSerializer.Serialize(hrFinalResult.Strengths.Select(s => s.Title)) : "[]",
                ImprovementsJson = hrFinalResult != null && hrFinalResult.Improvements.Any() ? JsonSerializer.Serialize(hrFinalResult.Improvements.Select(i => i.Title)) : "[]",
                AiSummary = hrAiSummary,
                HrRecommendation = hrScore >= 7.0f ? "Hire" : "Borderline"
            };

            // Technical Report
            var tech = new TechnicalReport
            {
                CandidateReportId = report.Id,
                OverallTechnicalScore = techScore,
                TechnicalKnowledgeScore = techFeedbackDict.ContainsKey("technicalKnowledge") ? (float)(double)techFeedbackDict["technicalKnowledge"] : 0f,
                ProblemSolvingScore = techFeedbackDict.ContainsKey("problemSolving") ? (float)(double)techFeedbackDict["problemSolving"] : 0f,
                PracticalExperienceScore = techFeedbackDict.ContainsKey("practicalExperience") ? (float)(double)techFeedbackDict["practicalExperience"] : 0f,
                SystemThinkingScore = techFeedbackDict.ContainsKey("systemDesign") ? (float)(double)techFeedbackDict["systemDesign"] : 0f,
                CommunicationScore = techFeedbackDict.ContainsKey("communication") ? (float)(double)techFeedbackDict["communication"] : 0f,
                BestPracticesScore = techFeedbackDict.ContainsKey("bestPractices") ? (float)(double)techFeedbackDict["bestPractices"] : 0f,
                StrengthsJson = techFeedbackDict.ContainsKey("strengths") ? (string)techFeedbackDict["strengths"] : "[]",
                WeaknessesJson = techFeedbackDict.ContainsKey("weaknesses") ? (string)techFeedbackDict["weaknesses"] : "[]",
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
