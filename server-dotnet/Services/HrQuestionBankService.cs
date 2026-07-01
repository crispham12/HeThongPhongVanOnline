using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InterviewPro.API.Data;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InterviewPro.API.Services
{
    public class HrQuestionBankService : IHrQuestionBankService
    {
        private readonly AppDbContext _context;
        private readonly IHrAiClient _aiClient;
        private readonly ILogger<HrQuestionBankService> _logger;

        private static readonly List<(string Category, string TargetSkill, string Method)> Blueprint = new()
        {
            ("Introduction", "Self-awareness, Communication", "STAR"),
            ("Past Experience", "Problem Solving, Impact", "STAR"),
            ("Teamwork", "Collaboration, Conflict Resolution", "STAR"),
            ("Adaptability", "Learning Agility, Flexibility", "STAR"),
            ("Problem Solving", "Analytical Thinking, Initiative", "STAR"),
            ("Leadership & Ownership", "Accountability, Proactiveness", "STAR"),
            ("Handling Pressure", "Stress Management, Prioritization", "STAR"),
            ("Motivation & Goals", "Cultural Fit, Career Vision", "STAR"),
            ("Weakness & Failure", "Humility, Continuous Improvement", "STAR"),
            ("Role Fit", "Alignment with Job Requirements", "STAR")
        };

        public HrQuestionBankService(AppDbContext context, IHrAiClient aiClient, ILogger<HrQuestionBankService> logger)
        {
            _context = context;
            _aiClient = aiClient;
            _logger = logger;
        }

        public async Task<List<HrInterviewQuestion>> GenerateSessionQuestionsAsync(int sessionId, string role, string level, string questionMode)
        {
            var finalQuestions = new List<HrInterviewQuestion>();
            var rnd = new Random();

            for (int i = 0; i < Blueprint.Count; i++)
            {
                var bp = Blueprint[i];
                var category = bp.Category;

                HrQuestionBank? selectedBankQ = null;

                // Attempt to pick from DB if mode allows
                if (questionMode == "BANK_ONLY" || questionMode == "BANK_FIRST_AI_FALLBACK")
                {
                    var availableQuestions = await _context.HrQuestionBanks
                        .Where(q => q.IsActive && q.Category == category && (q.Difficulty == level || q.Difficulty == "All"))
                        .ToListAsync();

                    if (availableQuestions.Any())
                    {
                        selectedBankQ = availableQuestions[rnd.Next(availableQuestions.Count)];
                        
                        // Update usage tracking
                        selectedBankQ.UsageCount++;
                        selectedBankQ.LastUsedAt = DateTime.UtcNow;
                        _context.HrQuestionBanks.Update(selectedBankQ);
                    }
                }

                if (selectedBankQ != null)
                {
                    finalQuestions.Add(new HrInterviewQuestion
                    {
                        SessionId = sessionId,
                        QuestionBankId = selectedBankQ.Id,
                        QuestionIndex = i + 1,
                        Category = selectedBankQ.Category,
                        QuestionText = selectedBankQ.QuestionText,
                        ExpectedAnswerGuide = selectedBankQ.ExpectedAnswerGuide,
                        Difficulty = selectedBankQ.Difficulty,
                        TargetSkill = selectedBankQ.TargetSkill,
                        SuggestedMethod = selectedBankQ.SuggestedMethod,
                        Source = "BANK",
                        MaxAnswerTime = selectedBankQ.MaxAnswerTime
                    });
                }
                else if (questionMode == "BANK_FIRST_AI_FALLBACK" || questionMode == "AI_ONLY")
                {
                    // Fallback to AI
                    var aiQuestion = await _aiClient.GenerateSingleHrQuestionAsync(role, level, category, bp.TargetSkill, bp.Method, 120);

                    // Save AI question to DB for future use
                    var newBankQ = new HrQuestionBank
                    {
                        Category = aiQuestion.Category,
                        QuestionText = aiQuestion.QuestionText,
                        ExpectedAnswerGuide = aiQuestion.ExpectedAnswerGuide,
                        Difficulty = aiQuestion.Difficulty,
                        TargetSkill = aiQuestion.TargetSkill,
                        SuggestedMethod = aiQuestion.SuggestedMethod,
                        Source = "AI_GENERATED",
                        MaxAnswerTime = aiQuestion.MaxAnswerTime,
                        UsageCount = 1,
                        LastUsedAt = DateTime.UtcNow,
                        RoleContext = role,
                        LevelContext = level
                    };

                    _context.HrQuestionBanks.Add(newBankQ);
                    await _context.SaveChangesAsync(); // Save to get the ID

                    finalQuestions.Add(new HrInterviewQuestion
                    {
                        SessionId = sessionId,
                        QuestionBankId = newBankQ.Id,
                        QuestionIndex = i + 1,
                        Category = newBankQ.Category,
                        QuestionText = newBankQ.QuestionText,
                        ExpectedAnswerGuide = newBankQ.ExpectedAnswerGuide,
                        Difficulty = newBankQ.Difficulty,
                        TargetSkill = newBankQ.TargetSkill,
                        SuggestedMethod = newBankQ.SuggestedMethod,
                        Source = "AI_GENERATED",
                        MaxAnswerTime = newBankQ.MaxAnswerTime
                    });
                }
                else
                {
                    // BANK_ONLY but no question found -> Use a hardcoded fallback to prevent failure
                    finalQuestions.Add(new HrInterviewQuestion
                    {
                        SessionId = sessionId,
                        QuestionIndex = i + 1,
                        Category = category,
                        QuestionText = $"Please tell us about your experience related to {category}.",
                        ExpectedAnswerGuide = "General assessment.",
                        Difficulty = level,
                        TargetSkill = bp.TargetSkill,
                        SuggestedMethod = bp.Method,
                        Source = "MANUAL_FALLBACK",
                        MaxAnswerTime = 120
                    });
                }
            }

            await _context.SaveChangesAsync();
            return finalQuestions;
        }

        public async Task SeedDefaultQuestionsAsync()
        {
            if (await _context.HrQuestionBanks.AnyAsync())
                return;

            var seeds = new List<HrQuestionBank>
            {
                new HrQuestionBank { Category = "Introduction", QuestionText = "Hãy giới thiệu ngắn gọn về bản thân và kinh nghiệm làm việc của bạn.", Difficulty = "Fresher", TargetSkill = "Self-awareness, Communication", ExpectedAnswerGuide = "Trình bày ngắn gọn, súc tích, tập trung vào kỹ năng chuyên môn phù hợp." },
                new HrQuestionBank { Category = "Past Experience", QuestionText = "Kể về một dự án mà bạn cảm thấy tự hào nhất. Bạn đã đóng góp gì?", Difficulty = "Fresher", TargetSkill = "Problem Solving, Impact", ExpectedAnswerGuide = "Nêu rõ vai trò, công nghệ sử dụng và kết quả đạt được." },
                new HrQuestionBank { Category = "Teamwork", QuestionText = "Bạn làm gì khi có bất đồng quan điểm với thành viên trong nhóm?", Difficulty = "Fresher", TargetSkill = "Collaboration, Conflict Resolution", ExpectedAnswerGuide = "Thể hiện kỹ năng lắng nghe, phân tích và tìm giải pháp win-win." },
                // Add more as needed...
            };

            _context.HrQuestionBanks.AddRange(seeds);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded default HR Question Bank data.");
        }
    }
}
