using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using System.Threading.Tasks;

namespace InterviewPro.API.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlMessage);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
        {
            var email = new MimeMessage();
            email.Sender = MailboxAddress.Parse(_config["SmtpSettings:UserName"]);
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = htmlMessage };
            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            
            // Connect
            await smtp.ConnectAsync(
                _config["SmtpSettings:Host"],
                int.Parse(_config["SmtpSettings:Port"]!),
                SecureSocketOptions.StartTls
            );

            // Authenticate
            await smtp.AuthenticateAsync(
                _config["SmtpSettings:UserName"],
                _config["SmtpSettings:Password"]
            );

            // Send
            await smtp.SendAsync(email);
            
            // Disconnect
            await smtp.DisconnectAsync(true);
        }
    }
}
