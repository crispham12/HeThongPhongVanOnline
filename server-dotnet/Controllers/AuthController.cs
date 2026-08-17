using Microsoft.AspNetCore.Mvc;
using InterviewPro.API.Entities;
using InterviewPro.API.Interfaces;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using InterviewPro.API.Data;
using Microsoft.EntityFrameworkCore;
using InterviewPro.API.Services;

namespace InterviewPro.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _repo;
        private readonly IConfiguration _config;
        private readonly AppDbContext _db;
        private readonly IEmailService _emailService;

        public AuthController(IAuthRepository repo, IConfiguration config, AppDbContext db, IEmailService emailService)
        {
            _repo = repo;
            _config = config;
            _db = db;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length < 2)
                return BadRequest(new { message = "Họ tên phải có ít nhất 2 ký tự" });

            if (request.Password == null || request.Password.Length < 8 || 
                !request.Password.Any(char.IsUpper) || !request.Password.Any(char.IsDigit))
            {
                return BadRequest(new { message = "Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ hoa và 1 số" });
            }

            if (await _repo.UserExists(request.Email))
                return BadRequest(new { message = "Email đã được sử dụng" });

            var user = new User
            {
                Name = request.Name,
                Email = request.Email
            };

            var createdUser = await _repo.Register(user, request.Password);
            var token = CreateToken(createdUser);

            return Ok(new 
            { 
                token = token,
                user = new { createdUser.Id, createdUser.Name, createdUser.Email, createdUser.Role }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _repo.Login(request.Email, request.Password);

            if (user == null)
                return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác" });

            if (user.IsLocked)
                return BadRequest(new { message = $"Tài khoản bị khóa. Lý do: {user.LockReason ?? "Vi phạm chính sách"}" });

            var token = CreateToken(user);

            return Ok(new
            {
                token = token,
                user = new { user.Id, user.Name, user.Email, user.Role }
            });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
            if (user == null)
            {
                return BadRequest(new { message = "Email không tồn tại trong hệ thống" });
            }

            // Generate token
            var token = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
            user.ResetToken = token;
            user.ResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(15);
            await _db.SaveChangesAsync();

            // Send email
            var resetLink = $"{_config["AllowedOrigins"]}/reset-password?email={user.Email}&token={token}";
            var htmlMessage = $@"
                <h3>Khôi phục mật khẩu AI Interview</h3>
                <p>Xin chào {user.Name},</p>
                <p>Bạn đã yêu cầu khôi phục mật khẩu. Vui lòng click vào đường link bên dưới để tạo mật khẩu mới:</p>
                <p><a href='{resetLink}'>{resetLink}</a></p>
                <p>Link này sẽ hết hạn sau 15 phút.</p>
                <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>";

            try
            {
                await _emailService.SendEmailAsync(user.Email, "Khôi phục mật khẩu", htmlMessage);
            }
            catch (Exception ex)
            {
                // Log exception in production
                return StatusCode(500, new { message = "Không thể gửi email. Vui lòng kiểm tra lại cấu hình SMTP." });
            }

            return Ok(new { message = "Đã gửi hướng dẫn khôi phục mật khẩu." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
            if (user == null || user.ResetToken != request.Token || user.ResetTokenExpiresAt < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Link khôi phục không hợp lệ hoặc đã hết hạn." });
            }

            // Update password
            user.PasswordHash = request.NewPassword;
            
            // Invalidate token
            user.ResetToken = null;
            user.ResetTokenExpiresAt = null;
            
            await _db.SaveChangesAsync();

            return Ok(new { message = "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." });
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role == 1 ? "Admin" : "User")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(7),
                SigningCredentials = creds,
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }

    public record RegisterRequest(string Name, string Email, string Password);
    public record LoginRequest(string Email, string Password);
    public record ForgotPasswordRequest(string Email);
    public record ResetPasswordRequest(string Email, string Token, string NewPassword);
}
