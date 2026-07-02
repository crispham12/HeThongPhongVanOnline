using System;
using System.Threading;
using System.Threading.Tasks;
using InterviewPro.API.Data;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using InterviewPro.API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;


namespace InterviewPro.API.Workers
{
    public class InterviewAnalysisWorker : BackgroundService
    {
        private readonly IInterviewAnalysisQueue _queue;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<InterviewAnalysisWorker> _logger;

        public InterviewAnalysisWorker(
            IInterviewAnalysisQueue queue,
            IServiceProvider serviceProvider,
            ILogger<InterviewAnalysisWorker> logger)
        {
            _queue = queue;
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("InterviewAnalysisWorker is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var jobId = await _queue.DequeueAsync(stoppingToken);
                    _logger.LogInformation($"Processing Job {jobId}");

                    await ProcessJobWithRetriesAsync(jobId, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    // Prevent throwing if stoppingToken is canceled
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while processing analysis queue.");
                }
            }
        }

        private async Task ProcessJobWithRetriesAsync(int jobId, CancellationToken stoppingToken)
        {
            int maxRetries = 3;
            int currentRetry = 0;
            bool success = false;

            while (currentRetry < maxRetries && !success)
            {
                try
                {
                    await ProcessJobAsync(jobId, stoppingToken);
                    success = true;
                }
                catch (Exception ex)
                {
                    currentRetry++;
                    _logger.LogWarning(ex, $"Attempt {currentRetry} failed for Job {jobId}.");

                    if (currentRetry >= maxRetries)
                    {
                        await MarkJobAsFailedAsync(jobId, ex.Message);
                    }
                    else
                    {
                        await Task.Delay(2000, stoppingToken); // Wait 2s before retry
                    }
                }
            }
        }

        private async Task ProcessJobAsync(int jobId, CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var job = await dbContext.InterviewAnalysisJobs.FindAsync(new object[] { jobId }, stoppingToken);
            if (job == null) return;

            job.Status = "Running";
            job.StartedAt = DateTime.UtcNow;
            await dbContext.SaveChangesAsync(stoppingToken);

            var steps = new[]
            {
                ("Transcript Processing", 15),
                ("Speech Analysis", 15),
                ("STAR Evaluation", 20),
                ("Communication Skills", 15),
                ("Professionalism Assessment", 10),
                ("Confidence Analysis", 10),
                ("Generating Feedback", 10),
                ("Preparing Final Report", 5)
            };

            int currentProgress = 0;

            // Fake AI workflow simulation as requested
            foreach (var step in steps)
            {
                if (stoppingToken.IsCancellationRequested) break;

                job.CurrentStep = step.Item1;
                await dbContext.SaveChangesAsync(stoppingToken);

                // Simulate AI processing delay (e.g. 1-2 seconds per step)
                await Task.Delay(1500, stoppingToken); 

                currentProgress += step.Item2;
                job.Progress = Math.Min(currentProgress, 100);
                await dbContext.SaveChangesAsync(stoppingToken);
            }

            // Create Final Result
            var result = new InterviewAnalysisResult
            {
                SessionId = job.SessionId,
                OverallScore = 86,
                STARScore = 78,
                CommunicationScore = 91,
                ConfidenceScore = 82,
                ProfessionalismScore = 88,
                LogicScore = 85,
                CompletenessScore = 74,
                ClarityScore = 89,
                OverallStatus = "Good",
                SummaryText = "You performed well in communication but should improve STAR structure.",
                TopPercentile = "Top 18% of similar candidates",
                HiringReadiness = "Almost Ready",
                CompletedAt = DateTime.UtcNow,
                Strengths = new List<InterviewStrength>
                {
                    new InterviewStrength { Title = "Excellent communication", Score = 91, Status = "Strong", Description = "Keep this area consistent in every answer.", OrderIndex = 1 },
                    new InterviewStrength { Title = "Clear logical thinking", Score = 85, Status = "Strong", Description = "Continue using clear cause-and-effect structure.", OrderIndex = 2 }
                },
                Improvements = new List<InterviewImprovement>
                {
                    new InterviewImprovement { Title = "Need more measurable results", Score = 64, Status = "Critical", Description = "Add measurable outcomes where possible.", OrderIndex = 1 },
                    new InterviewImprovement { Title = "Use STAR more consistently", Score = 72, Status = "Focus", Description = "Make Situation, Task, Action, Result more explicit.", OrderIndex = 2 }
                },
                StarAnalyses = new List<InterviewStarAnalysis>
                {
                    new InterviewStarAnalysis { Name = "Situation", Score = 82, Status = "Good", Feedback = "Clear context for most answers.", OrderIndex = 1 },
                    new InterviewStarAnalysis { Name = "Task", Score = 72, Status = "Focus", Feedback = "Responsibility could be stated more directly.", OrderIndex = 2 },
                    new InterviewStarAnalysis { Name = "Action", Score = 91, Status = "Strong", Feedback = "Actions were described with strong detail.", OrderIndex = 3 },
                    new InterviewStarAnalysis { Name = "Result", Score = 64, Status = "Critical", Feedback = "Add measurable outcomes where possible.", OrderIndex = 4 }
                }
            };

            dbContext.InterviewAnalysisResults.Add(result);
            await dbContext.SaveChangesAsync(stoppingToken);

            job.AnalysisResultId = result.Id;
            job.Status = "Completed";
            job.CompletedAt = DateTime.UtcNow;
            await dbContext.SaveChangesAsync(stoppingToken);
            
            _logger.LogInformation($"Job {jobId} completed successfully.");
        }

        private async Task MarkJobAsFailedAsync(int jobId, string errorMessage)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var job = await dbContext.InterviewAnalysisJobs.FindAsync(jobId);
            if (job != null)
            {
                job.Status = "Failed";
                job.ErrorMessage = "Analysis failed. " + errorMessage;
                await dbContext.SaveChangesAsync();
            }
        }
    }
}
