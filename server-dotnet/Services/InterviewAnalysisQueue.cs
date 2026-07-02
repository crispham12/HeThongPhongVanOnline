using System.Threading.Channels;
using System.Threading.Tasks;

namespace InterviewPro.API.Services
{
    public interface IInterviewAnalysisQueue
    {
        ValueTask QueueAnalysisJobAsync(int jobId);
        ValueTask<int> DequeueAsync(CancellationToken cancellationToken);
    }

    public class InterviewAnalysisQueue : IInterviewAnalysisQueue
    {
        private readonly Channel<int> _queue;

        public InterviewAnalysisQueue()
        {
            var options = new BoundedChannelOptions(100)
            {
                FullMode = BoundedChannelFullMode.Wait
            };
            _queue = Channel.CreateBounded<int>(options);
        }

        public async ValueTask QueueAnalysisJobAsync(int jobId)
        {
            await _queue.Writer.WriteAsync(jobId);
        }

        public async ValueTask<int> DequeueAsync(CancellationToken cancellationToken)
        {
            return await _queue.Reader.ReadAsync(cancellationToken);
        }
    }
}
