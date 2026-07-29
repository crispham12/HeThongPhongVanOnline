using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.Extensions.Logging;

namespace InterviewPro.API.Services
{
    public class TechnicalAiClient : ITechnicalAiClient
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<TechnicalAiClient> _logger;

        public TechnicalAiClient(IHttpClientFactory httpClientFactory, ILogger<TechnicalAiClient> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task<AiGenerateQuestionResponse?> GenerateQuestionAsync(AiGenerateQuestionRequest request)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("AIService");
                var response = await client.PostAsJsonAsync("/ai/technical/generate-question", request);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<AiGenerateQuestionResponse>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling GenerateQuestionAsync");
                return null;
            }
        }

        public async Task<AiEvaluateAnswerResponse?> EvaluateAnswerAsync(AiEvaluateAnswerRequest request)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("AIService");
                var response = await client.PostAsJsonAsync("/ai/technical/evaluate-answer", request);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<AiEvaluateAnswerResponse>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling EvaluateAnswerAsync");
                return null;
            }
        }

        public async Task<AiFinalEvaluationResponse?> FinalEvaluationAsync(AiFinalEvaluationRequest request)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("AIService");
                var response = await client.PostAsJsonAsync("/ai/technical/final-evaluation", request);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<AiFinalEvaluationResponse>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling FinalEvaluationAsync");
                return null;
            }
        }
    }
}
