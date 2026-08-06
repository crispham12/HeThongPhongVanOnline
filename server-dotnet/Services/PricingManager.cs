using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

namespace InterviewPro.API.Services
{
    public class PlanConfig
    {
        public long Amount { get; set; }
        public int Days { get; set; }
    }

    public static class PricingManager
    {
        private static readonly string FilePath = Path.Combine(Directory.GetCurrentDirectory(), "Data", "pricing.json");

        private static Dictionary<string, PlanConfig> _defaultPlans = new()
        {
            ["Monthly"] = new PlanConfig { Amount = 99_000, Days = 30 },
            ["Yearly"] = new PlanConfig { Amount = 1_000_000, Days = 365 }
        };

        public static Dictionary<string, PlanConfig> GetPlans()
        {
            if (!File.Exists(FilePath))
            {
                return new Dictionary<string, PlanConfig>(_defaultPlans);
            }

            try
            {
                var json = File.ReadAllText(FilePath);
                var plans = JsonSerializer.Deserialize<Dictionary<string, PlanConfig>>(json);
                if (plans != null && plans.ContainsKey("Monthly") && plans.ContainsKey("Yearly"))
                {
                    return plans;
                }
            }
            catch
            {
                // Ignore error, return default
            }

            return new Dictionary<string, PlanConfig>(_defaultPlans);
        }

        public static void UpdatePrice(string planType, long newPrice)
        {
            var plans = GetPlans();
            if (plans.ContainsKey(planType))
            {
                var current = plans[planType];
                plans[planType] = new PlanConfig { Amount = newPrice, Days = current.Days };

                var directory = Path.GetDirectoryName(FilePath);
                if (directory != null && !Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                var json = JsonSerializer.Serialize(plans, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(FilePath, json);
            }
            else
            {
                throw new ArgumentException("Gói không hợp lệ.");
            }
        }
    }
}
