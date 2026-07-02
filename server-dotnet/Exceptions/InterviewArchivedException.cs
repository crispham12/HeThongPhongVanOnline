using System;

namespace InterviewPro.API.Exceptions
{
    /// <summary>
    /// Thrown when a user attempts to access an archived (soft-deleted) interview session.
    /// Maps to HTTP 410 Gone in the controller.
    /// </summary>
    public class InterviewArchivedException : Exception
    {
        public InterviewArchivedException(string message) : base(message) { }
    }
}
