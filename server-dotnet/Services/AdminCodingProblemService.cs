using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InterviewPro.API.Services
{
    public class AdminCodingProblemService : IAdminCodingProblemService
    {
        private readonly AppDbContext _db;

        public AdminCodingProblemService(AppDbContext db)
        {
            _db = db;
        }

        private static string Serialize<T>(T obj) => System.Text.Json.JsonSerializer.Serialize(obj);
        
        private static T Deserialize<T>(string? json, T defaultVal)
        {
            if (string.IsNullOrEmpty(json)) return defaultVal;
            try
            {
                return System.Text.Json.JsonSerializer.Deserialize<T>(json) ?? defaultVal;
            }
            catch
            {
                return defaultVal;
            }
        }

        private void ValidateRequest(CreateCodingProblemRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Title))
            {
                throw new ArgumentException("Tiêu đề bài toán không được để trống.");
            }

            if (req.Status == "Published")
            {
                if (string.IsNullOrWhiteSpace(req.ShortDescription))
                    throw new ArgumentException("Mô tả ngắn không được để trống khi xuất bản.");

                if (string.IsNullOrWhiteSpace(req.Description))
                    throw new ArgumentException("Mô tả bài toán không được để trống khi xuất bản.");

                if (string.IsNullOrWhiteSpace(req.Difficulty))
                    throw new ArgumentException("Độ khó bắt buộc phải chọn khi xuất bản.");

                if (string.IsNullOrWhiteSpace(req.RecommendedLevel))
                    throw new ArgumentException("Cấp độ đề xuất (Recommended Level) bắt buộc phải chọn khi xuất bản.");

                if (string.IsNullOrWhiteSpace(req.FunctionName))
                    throw new ArgumentException("Tên hàm (FunctionName) bắt buộc phải điền khi xuất bản.");

                if (string.IsNullOrWhiteSpace(req.MethodSignature))
                    throw new ArgumentException("Chữ ký hàm (MethodSignature) bắt buộc phải điền khi xuất bản.");

                if (string.IsNullOrWhiteSpace(req.ReturnType))
                    throw new ArgumentException("Kiểu trả về (ReturnType) bắt buộc phải điền khi xuất bản.");

                if (req.Categories == null || !req.Categories.Any())
                    throw new ArgumentException("Phân loại (Categories) phải có ít nhất 1 mục khi xuất bản.");

                if (req.Examples == null || !req.Examples.Any())
                    throw new ArgumentException("Ví dụ minh họa (Examples) phải có ít nhất 1 ví dụ khi xuất bản.");

                if (req.PublicTestCases == null || req.PublicTestCases.Count < 3)
                    throw new ArgumentException("Public Test Cases phải có ít nhất 3 trường hợp test khi xuất bản.");

                if (req.HiddenTestCases == null || req.HiddenTestCases.Count < 5)
                    throw new ArgumentException("Hidden Test Cases phải có ít nhất 5 trường hợp test khi xuất bản.");

                if (req.SupportedLanguages == null || !req.SupportedLanguages.Any())
                    throw new ArgumentException("Ngôn ngữ hỗ trợ phải có ít nhất 1 ngôn ngữ khi xuất bản.");

                if (req.StarterCode == null)
                    throw new ArgumentException("Mẫu code khởi tạo bắt buộc phải cung cấp.");

                foreach (var lang in req.SupportedLanguages)
                {
                    if (!req.StarterCode.TryGetValue(lang, out var code) || string.IsNullOrWhiteSpace(code))
                    {
                        throw new ArgumentException($"Thiếu mẫu code khởi tạo (Starter Code) cho ngôn ngữ: {lang}.");
                    }
                }
            }
        }

        private async Task<string> GenerateProblemCodeAsync()
        {
            var codes = await _db.CodingProblems.Select(p => p.ProblemCode).ToListAsync();
            var maxNum = codes
                .Select(c => {
                    if (c.StartsWith("CP-") && int.TryParse(c.Substring(3), out var n))
                        return n;
                    return 0;
                })
                .DefaultIfEmpty(0)
                .Max();

            return $"CP-{(maxNum + 1):D4}";
        }

        public async Task<PagedResult<CodingProblemListItemDto>> GetProblemsAsync(
            string? difficulty,
            string? category,
            string? recommendedLevel,
            string? status,
            string? search,
            int page,
            int pageSize)
        {
            var query = _db.CodingProblems.AsQueryable();

            if (!string.IsNullOrWhiteSpace(difficulty))
                query = query.Where(p => p.Difficulty == difficulty);
            if (!string.IsNullOrWhiteSpace(recommendedLevel))
                query = query.Where(p => p.RecommendedLevel == recommendedLevel);
            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(p => p.Status == status);

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(p =>
                    p.Title.Contains(search) ||
                    p.ProblemCode.Contains(search) ||
                    p.ShortDescription.Contains(search));
            }

            var total = await query.CountAsync();
            var problems = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Perform in-memory filter for Category since it resides in JSON array
            var filteredProblems = problems.AsEnumerable();
            if (!string.IsNullOrWhiteSpace(category))
            {
                filteredProblems = filteredProblems.Where(p =>
                    Deserialize(p.CategoriesJson, new List<string>())
                        .Any(c => c.Equals(category, StringComparison.OrdinalIgnoreCase)));
                
                // Adjust total count if filtered in-memory
                total = filteredProblems.Count();
                filteredProblems = filteredProblems.Skip((page - 1) * pageSize).Take(pageSize);
            }

            var items = filteredProblems.Select(p => new CodingProblemListItemDto
            {
                Id = p.Id,
                ProblemCode = p.ProblemCode,
                Title = p.Title,
                ShortDescription = p.ShortDescription,
                Difficulty = p.Difficulty,
                Categories = Deserialize(p.CategoriesJson, new List<string>()),
                RecommendedLevel = p.RecommendedLevel,
                FunctionName = p.FunctionName,
                MethodSignature = p.MethodSignature,
                ReturnType = p.ReturnType,
                SupportedLanguages = Deserialize(p.SupportedLanguagesJson, new List<string>()),
                PublicTestCaseCount = Deserialize(p.PublicTestCasesJson, new List<CodingTestCaseDto>()).Count,
                HiddenTestCaseCount = Deserialize(p.HiddenTestCasesJson, new List<CodingTestCaseDto>()).Count,
                Status = p.Status,
                IsClientVisible = p.IsClientVisible,
                AllowRandomSelection = p.AllowRandomSelection,
                CreatedAt = p.CreatedAt
            }).ToList();

            return new PagedResult<CodingProblemListItemDto>
            {
                Items = items,
                TotalItems = total,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<CodingProblemDetailDto?> GetByIdAsync(Guid id)
        {
            var p = await _db.CodingProblems.FindAsync(id);
            if (p == null) return null;

            return MapToDetailDto(p);
        }

        public async Task<CodingProblemDetailDto> CreateAsync(CreateCodingProblemRequest req, Guid adminId, string adminName)
        {
            ValidateRequest(req);

            var problem = new CodingProblem
            {
                Id = Guid.NewGuid(),
                ProblemCode = await GenerateProblemCodeAsync(),
                Title = req.Title,
                ShortDescription = req.ShortDescription,
                Description = req.Description,
                Difficulty = req.Difficulty,
                CategoriesJson = Serialize(req.Categories),
                RecommendedLevel = req.RecommendedLevel,
                FunctionName = req.FunctionName,
                MethodSignature = req.MethodSignature,
                ReturnType = req.ReturnType,
                TargetSkillsJson = Serialize(req.TargetSkills),
                EstimatedMinutes = req.EstimatedMinutes,
                InputFormat = req.InputFormat,
                OutputFormat = req.OutputFormat,
                ConstraintsJson = Serialize(req.Constraints),
                ExamplesJson = Serialize(req.Examples),
                PublicTestCasesJson = Serialize(req.PublicTestCases),
                HiddenTestCasesJson = Serialize(req.HiddenTestCases),
                SupportedLanguagesJson = Serialize(req.SupportedLanguages),
                StarterCodeJson = Serialize(req.StarterCode),
                SolutionJson = Serialize(req.Solution),
                Status = req.Status,
                IsClientVisible = req.IsClientVisible,
                AllowRandomSelection = req.AllowRandomSelection,
                CreatedByAdminId = adminId,
                CreatedByAdminName = adminName,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.CodingProblems.Add(problem);
            await _db.SaveChangesAsync();

            return MapToDetailDto(problem);
        }

        public async Task<CodingProblemDetailDto?> UpdateAsync(Guid id, UpdateCodingProblemRequest req)
        {
            var p = await _db.CodingProblems.FindAsync(id);
            if (p == null) return null;

            // Map Create request format for validation
            var createReq = new CreateCodingProblemRequest
            {
                Title = req.Title,
                ShortDescription = req.ShortDescription,
                Description = req.Description,
                Difficulty = req.Difficulty,
                Categories = req.Categories,
                RecommendedLevel = req.RecommendedLevel,
                FunctionName = req.FunctionName,
                MethodSignature = req.MethodSignature,
                ReturnType = req.ReturnType,
                TargetSkills = req.TargetSkills,
                EstimatedMinutes = req.EstimatedMinutes,
                InputFormat = req.InputFormat,
                OutputFormat = req.OutputFormat,
                Constraints = req.Constraints,
                Examples = req.Examples,
                PublicTestCases = req.PublicTestCases,
                HiddenTestCases = req.HiddenTestCases,
                SupportedLanguages = req.SupportedLanguages,
                StarterCode = req.StarterCode,
                Solution = req.Solution,
                Status = req.Status,
                IsClientVisible = req.IsClientVisible,
                AllowRandomSelection = req.AllowRandomSelection
            };
            ValidateRequest(createReq);

            p.Title = req.Title;
            p.ShortDescription = req.ShortDescription;
            p.Description = req.Description;
            p.Difficulty = req.Difficulty;
            p.CategoriesJson = Serialize(req.Categories);
            p.RecommendedLevel = req.RecommendedLevel;
            p.FunctionName = req.FunctionName;
            p.MethodSignature = req.MethodSignature;
            p.ReturnType = req.ReturnType;
            p.TargetSkillsJson = Serialize(req.TargetSkills);
            p.EstimatedMinutes = req.EstimatedMinutes;
            p.InputFormat = req.InputFormat;
            p.OutputFormat = req.OutputFormat;
            p.ConstraintsJson = Serialize(req.Constraints);
            p.ExamplesJson = Serialize(req.Examples);
            p.PublicTestCasesJson = Serialize(req.PublicTestCases);
            p.HiddenTestCasesJson = Serialize(req.HiddenTestCases);
            p.SupportedLanguagesJson = Serialize(req.SupportedLanguages);
            p.StarterCodeJson = Serialize(req.StarterCode);
            p.SolutionJson = Serialize(req.Solution);
            p.Status = req.Status;
            p.IsClientVisible = req.IsClientVisible;
            p.AllowRandomSelection = req.AllowRandomSelection;
            p.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return MapToDetailDto(p);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var p = await _db.CodingProblems.FindAsync(id);
            if (p == null) return false;

            // Check if coding problem has practice histories
            var hasPracticed = await _db.CodingPracticeAttempts.AnyAsync(h => h.CodingProblemId == id);
            if (hasPracticed)
            {
                p.Status = "Disabled";
                p.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _db.CodingProblems.Remove(p);
            }

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<CodingProblemDetailDto?> PublishAsync(Guid id)
        {
            var p = await _db.CodingProblems.FindAsync(id);
            if (p == null) return null;

            // Trigger published validation rules
            var createReq = new CreateCodingProblemRequest
            {
                Title = p.Title,
                ShortDescription = p.ShortDescription,
                Description = p.Description,
                Difficulty = p.Difficulty,
                Categories = Deserialize(p.CategoriesJson, new List<string>()),
                RecommendedLevel = p.RecommendedLevel,
                FunctionName = p.FunctionName,
                MethodSignature = p.MethodSignature,
                ReturnType = p.ReturnType,
                TargetSkills = Deserialize(p.TargetSkillsJson, new List<string>()),
                EstimatedMinutes = p.EstimatedMinutes,
                InputFormat = p.InputFormat,
                OutputFormat = p.OutputFormat,
                Constraints = Deserialize(p.ConstraintsJson, new List<string>()),
                Examples = Deserialize(p.ExamplesJson, new List<CodingExampleDto>()),
                PublicTestCases = Deserialize(p.PublicTestCasesJson, new List<CodingTestCaseDto>()),
                HiddenTestCases = Deserialize(p.HiddenTestCasesJson, new List<CodingTestCaseDto>()),
                SupportedLanguages = Deserialize(p.SupportedLanguagesJson, new List<string>()),
                StarterCode = Deserialize(p.StarterCodeJson, new Dictionary<string, string>()),
                Solution = Deserialize(p.SolutionJson, new CodingSolutionDto()),
                Status = "Published",
                IsClientVisible = p.IsClientVisible,
                AllowRandomSelection = p.AllowRandomSelection
            };
            ValidateRequest(createReq);

            p.Status = "Published";
            p.IsClientVisible = true;
            p.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return MapToDetailDto(p);
        }

        public async Task<CodingProblemDetailDto?> DraftAsync(Guid id)
        {
            var p = await _db.CodingProblems.FindAsync(id);
            if (p == null) return null;

            p.Status = "Draft";
            p.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return MapToDetailDto(p);
        }

        private static CodingProblemDetailDto MapToDetailDto(CodingProblem p) => new()
        {
            Id = p.Id,
            ProblemCode = p.ProblemCode,
            Title = p.Title,
            ShortDescription = p.ShortDescription,
            Description = p.Description,
            Difficulty = p.Difficulty,
            Categories = Deserialize(p.CategoriesJson, new List<string>()),
            RecommendedLevel = p.RecommendedLevel,
            FunctionName = p.FunctionName,
            MethodSignature = p.MethodSignature,
            ReturnType = p.ReturnType,
            TargetSkills = Deserialize(p.TargetSkillsJson, new List<string>()),
            EstimatedMinutes = p.EstimatedMinutes,
            InputFormat = p.InputFormat,
            OutputFormat = p.OutputFormat,
            Constraints = Deserialize(p.ConstraintsJson, new List<string>()),
            Examples = Deserialize(p.ExamplesJson, new List<CodingExampleDto>()),
            PublicTestCases = Deserialize(p.PublicTestCasesJson, new List<CodingTestCaseDto>()),
            HiddenTestCases = Deserialize(p.HiddenTestCasesJson, new List<CodingTestCaseDto>()),
            SupportedLanguages = Deserialize(p.SupportedLanguagesJson, new List<string>()),
            StarterCode = Deserialize(p.StarterCodeJson, new Dictionary<string, string>()),
            Solution = Deserialize(p.SolutionJson, new CodingSolutionDto()),
            Status = p.Status,
            IsClientVisible = p.IsClientVisible,
            AllowRandomSelection = p.AllowRandomSelection,
            CreatedByAdminId = p.CreatedByAdminId,
            CreatedByAdminName = p.CreatedByAdminName,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };
    }
}
