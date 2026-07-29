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



        public HrQuestionBankService(AppDbContext context, IHrAiClient aiClient, ILogger<HrQuestionBankService> logger)
        {
            _context = context;
            _aiClient = aiClient;
            _logger = logger;
        }

        public async Task<List<HrInterviewQuestion>> GenerateSessionQuestionsAsync(int sessionId, string role, string level, string questionMode, List<string> techStack)
        {
            var finalQuestions = new List<HrInterviewQuestion>();
            var rnd = new Random();

            var aiResult = await _aiClient.GenerateHrQuestionsAsync(role, level, techStack);
            
            foreach (var aiQ in aiResult.Questions)
            {
                var newBankQ = new HrQuestionBank
                {
                    Category = aiQ.Category,
                    QuestionText = aiQ.QuestionText,
                    ExpectedAnswerGuide = aiQ.ExpectedAnswerGuide,
                    Difficulty = level,
                    TargetSkill = "STAR Evaluation",
                    SuggestedMethod = "STAR",
                    Source = "AI_GENERATED",
                    MaxAnswerTime = 120,
                    UsageCount = 1,
                    LastUsedAt = DateTime.UtcNow,
                    RoleContext = role,
                    LevelContext = level
                };

                _context.HrQuestionBanks.Add(newBankQ);
                await _context.SaveChangesAsync();

                finalQuestions.Add(new HrInterviewQuestion
                {
                    SessionId = sessionId,
                    QuestionBankId = newBankQ.Id,
                    QuestionIndex = aiQ.QuestionIndex,
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
