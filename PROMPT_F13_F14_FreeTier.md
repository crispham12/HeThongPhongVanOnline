# PROMPT: Implement Free Tier Logic (F13 + F14)
> Dành cho: Gemini AI Code Assistant  
> Mục tiêu: Thay thế CreditService bằng DailyInterviewUsed logic + Reset hàng ngày + Cấp Premium thủ công

---

## CONTEXT DỰ ÁN

Đây là dự án **InterviewPro** — nền tảng luyện phỏng vấn IT với stack:
- Backend: ASP.NET Core 8, Entity Framework Core, JWT Auth
- Database: SQL Server / PostgreSQL
- Pattern: Repository + Service + Controller

### Trạng thái hiện tại của code (QUAN TRỌNG — đọc kỹ trước khi code)

**User entity** (`server-dotnet/Entities/Entities.cs`) đã có sẵn các field:
```csharp
public string Plan { get; set; } = "Free"; // "Free" hoặc "Premium"
public bool IsLocked { get; set; } = false;
public string? LockReason { get; set; }
public int DailyInterviewUsed { get; set; } = 0;
public int DailyGithubAnalysisUsed { get; set; } = 0; // KHÔNG dùng field này, bỏ qua
public DateTime? LastLoginAt { get; set; }
```

**Hệ thống Credit cũ** (SẼ BỊ THAY THẾ bởi task này):
- `ICreditService` / `CreditService` — hiện đang được inject vào `HrInterviewService` và `InterviewController`
- `NotEnoughCreditsException` — hiện đang được throw khi hết credit
- Cả hai controller đang catch `NotEnoughCreditsException` và trả về `402`

**Hai controller khởi tạo phỏng vấn cần thay đổi:**

1. `HrInterviewsController.cs` → `POST /api/hr-interviews/start` → gọi `_service.StartInterviewAsync()` → bên trong `HrInterviewService.StartInterviewAsync()` có dòng:
```csharp
await _creditService.UseCreditAsync(userId, $"Phỏng vấn HR: {request.Role}");
```

2. `InterviewController.cs` → `POST /api/interview/start` → có dòng:
```csharp
await _creditService.UseCreditAsync(userId, $"Phỏng vấn {request.Type}: {request.Role}");
```

**AdminUsersController** (`server-dotnet/Controllers/AdminUsersController.cs`) đã có GET endpoints cho user management. CHƯA có endpoint cấp Premium.

**Program.cs** đã đăng ký:
```csharp
builder.Services.AddScoped<ICreditService, CreditService>(); // Dòng này sẽ bị xóa
```

---

## YÊU CẦU THỰC HIỆN

### TASK 1: Tạo IInterviewQuotaService

Tạo file `server-dotnet/Interfaces/IInterviewQuotaService.cs`:

```csharp
namespace InterviewPro.API.Interfaces
{
    public interface IInterviewQuotaService
    {
        /// <summary>
        /// Kiểm tra user còn quota không. Nếu không đủ → throw QuotaExceededException.
        /// Nếu đủ → tăng DailyInterviewUsed lên 1 và lưu DB.
        /// </summary>
        Task ConsumeQuotaAsync(int userId);

        /// <summary>
        /// Lấy thông tin quota hiện tại của user.
        /// </summary>
        Task<QuotaStatusDto> GetQuotaStatusAsync(int userId);
    }

    public class QuotaExceededException : Exception
    {
        public QuotaExceededException(string message) : base(message) { }
    }
}
```

---

### TASK 2: Tạo QuotaStatusDto

Thêm vào `server-dotnet/DTOs/Dtos.cs` hoặc tạo file mới `server-dotnet/DTOs/QuotaDtos.cs`:

```csharp
namespace InterviewPro.API.DTOs
{
    public class QuotaStatusDto
    {
        public string Plan { get; set; } = "Free";
        public int DailyUsed { get; set; }
        public int DailyLimit { get; set; } // 3 với Free, -1 với Premium (không giới hạn)
        public int Remaining { get; set; }  // DailyLimit - DailyUsed, -1 nếu Premium
        public bool IsUnlimited { get; set; }
    }
}
```

---

### TASK 3: Tạo InterviewQuotaService

Tạo file `server-dotnet/Services/InterviewQuotaService.cs`:

**Logic nghiệp vụ bắt buộc:**
- `Plan == "Premium"` → KHÔNG kiểm tra quota, KHÔNG tăng `DailyInterviewUsed`, return ngay
- `Plan == "Free"` và `DailyInterviewUsed >= 3` → throw `QuotaExceededException` với message: `"Bạn đã sử dụng hết 3 buổi hôm nay. Vui lòng liên hệ để nâng cấp tài khoản Premium."`
- `Plan == "Free"` và `DailyInterviewUsed < 3` → tăng `DailyInterviewUsed += 1`, gọi `_context.SaveChangesAsync()`
- Nếu không tìm thấy user → throw `UnauthorizedAccessException`

```csharp
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InterviewPro.API.Services
{
    public class InterviewQuotaService : IInterviewQuotaService
    {
        private readonly AppDbContext _context;
        private const int FREE_DAILY_LIMIT = 3;

        public InterviewQuotaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task ConsumeQuotaAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new UnauthorizedAccessException("Không tìm thấy người dùng.");

            // Premium: bỏ qua hoàn toàn
            if (user.Plan == "Premium") return;

            // Free: kiểm tra giới hạn
            if (user.DailyInterviewUsed >= FREE_DAILY_LIMIT)
                throw new QuotaExceededException(
                    "Bạn đã sử dụng hết 3 buổi hôm nay. Vui lòng liên hệ để nâng cấp tài khoản Premium.");

            user.DailyInterviewUsed += 1;
            await _context.SaveChangesAsync();
        }

        public async Task<QuotaStatusDto> GetQuotaStatusAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new UnauthorizedAccessException("Không tìm thấy người dùng.");

            bool isPremium = user.Plan == "Premium";
            return new QuotaStatusDto
            {
                Plan = user.Plan,
                DailyUsed = user.DailyInterviewUsed,
                DailyLimit = isPremium ? -1 : FREE_DAILY_LIMIT,
                Remaining = isPremium ? -1 : Math.Max(0, FREE_DAILY_LIMIT - user.DailyInterviewUsed),
                IsUnlimited = isPremium
            };
        }
    }
}
```

---

### TASK 4: Tạo DailyQuotaResetWorker

Tạo file `server-dotnet/Workers/DailyQuotaResetWorker.cs`:

**Logic bắt buộc:**
- Chạy background, tính thời gian đến 00:00 GMT+7 tiếp theo
- Mỗi ngày lúc 00:00 GMT+7: `UPDATE Users SET DailyInterviewUsed = 0 WHERE Plan = 'Free'`
- Sau khi reset, tính thời gian đến 00:00 GMT+7 ngày hôm sau và delay
- Log ra console khi reset thành công: `[QuotaReset] Đã reset quota lúc {DateTime}`

```csharp
using InterviewPro.API.Data;
using Microsoft.EntityFrameworkCore;

namespace InterviewPro.API.Workers
{
    public class DailyQuotaResetWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<DailyQuotaResetWorker> _logger;
        private static readonly TimeZoneInfo VietnamTz = 
            TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"); 
            // Fallback nếu Linux: "Asia/Ho_Chi_Minh"

        public DailyQuotaResetWorker(IServiceScopeFactory scopeFactory, ILogger<DailyQuotaResetWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var delay = GetDelayUntilMidnightVietnam();
                _logger.LogInformation("[QuotaReset] Lần reset tiếp theo sau {Hours} giờ {Minutes} phút.", 
                    delay.Hours, delay.Minutes);

                await Task.Delay(delay, stoppingToken);

                await ResetDailyQuotaAsync();
            }
        }

        private async Task ResetDailyQuotaAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            try
            {
                var affected = await context.Users
                    .Where(u => u.Plan == "Free" && u.DailyInterviewUsed > 0)
                    .ExecuteUpdateAsync(u => u.SetProperty(x => x.DailyInterviewUsed, 0));

                _logger.LogInformation("[QuotaReset] Reset thành công lúc {Time}. Số user được reset: {Count}", 
                    DateTime.UtcNow, affected);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[QuotaReset] Lỗi khi reset quota.");
            }
        }

        private TimeSpan GetDelayUntilMidnightVietnam()
        {
            var nowUtc = DateTime.UtcNow;
            var nowVn = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, VietnamTz);
            var nextMidnightVn = nowVn.Date.AddDays(1); // 00:00 ngày hôm sau
            var nextMidnightUtc = TimeZoneInfo.ConvertTimeToUtc(nextMidnightVn, VietnamTz);
            var delay = nextMidnightUtc - nowUtc;
            return delay > TimeSpan.Zero ? delay : TimeSpan.FromHours(24);
        }
    }
}
```

**LƯU Ý quan trọng:** `ExecuteUpdateAsync` yêu cầu EF Core 7+. Nếu project đang dùng EF Core 6 thì thay bằng:
```csharp
var users = await context.Users.Where(u => u.Plan == "Free").ToListAsync();
foreach (var user in users) user.DailyInterviewUsed = 0;
await context.SaveChangesAsync();
```

---

### TASK 5: Thay thế CreditService trong HrInterviewService

Mở file `server-dotnet/Services/HrInterviewService.cs`:

**Bước 5a:** Xóa inject `ICreditService`:
```csharp
// XÓA dòng này trong constructor parameters:
private readonly ICreditService _creditService;

// XÓA dòng này trong constructor body:
ICreditService creditService,
_creditService = creditService;
```

**Bước 5b:** Thêm inject `IInterviewQuotaService`:
```csharp
private readonly IInterviewQuotaService _quotaService;

// Trong constructor:
IInterviewQuotaService quotaService,
_quotaService = quotaService;
```

**Bước 5c:** Trong method `StartInterviewAsync`, thay dòng credit cũ:
```csharp
// XÓA:
await _creditService.UseCreditAsync(userId, $"Phỏng vấn HR: {request.Role}");

// THAY BẰNG:
await _quotaService.ConsumeQuotaAsync(userId);
```

---

### TASK 6: Thay thế CreditService trong InterviewController

Mở file `server-dotnet/Controllers/InterviewController.cs`:

**Bước 6a:** Xóa inject `ICreditService`, thêm `IInterviewQuotaService`:
```csharp
// XÓA:
private readonly ICreditService _creditService;

// THÊM:
private readonly IInterviewQuotaService _quotaService;
```

**Bước 6b:** Trong method `StartSession`, thay:
```csharp
// XÓA:
await _creditService.UseCreditAsync(userId, $"Phỏng vấn {request.Type}: {request.Role}");

// THAY BẰNG:
await _quotaService.ConsumeQuotaAsync(userId);
```

**Bước 6c:** Thay exception handling:
```csharp
// XÓA:
catch (Services.NotEnoughCreditsException ex)
{
    await transaction.RollbackAsync();
    return StatusCode(402, new { message = ex.Message, requiredPayment = true });
}

// THAY BẰNG:
catch (QuotaExceededException ex)
{
    await transaction.RollbackAsync();
    return StatusCode(429, new { message = ex.Message });
}
```

**LƯU Ý:** Đổi status code từ `402` (Payment Required) sang `429` (Too Many Requests) vì không còn yêu cầu thanh toán.

---

### TASK 7: Thêm endpoint GET /api/interview/quota

Thêm vào `InterviewController.cs` hoặc tạo controller mới `QuotaController.cs`:

```csharp
[HttpGet("/api/interview/quota")]
public async Task<IActionResult> GetQuotaStatus()
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null) return Unauthorized();

    int userId = int.Parse(userIdClaim.Value);
    var status = await _quotaService.GetQuotaStatusAsync(userId);
    return Ok(status);
}
```

Frontend sẽ gọi endpoint này để hiển thị "Còn X buổi hôm nay" trên Dashboard.

---

### TASK 8: Thêm endpoint PATCH /api/admin/users/{id}/plan (F14)

Thêm vào `AdminUsersController.cs`:

**DTO trước:**
```csharp
// Thêm vào DTOs/AdminUserDtos.cs
public class UpdateUserPlanDto
{
    [Required]
    [RegularExpression("^(Free|Premium)$", ErrorMessage = "Plan chỉ được là 'Free' hoặc 'Premium'.")]
    public string Plan { get; set; } = "Free";
}
```

**Endpoint:**
```csharp
// PATCH /api/admin/users/{id}/plan
[HttpPatch("{id}/plan")]
public async Task<IActionResult> UpdatePlan(int id, [FromBody] UpdateUserPlanDto dto)
{
    try
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = $"Không tìm thấy user với Id = {id}." });

        var oldPlan = user.Plan;
        user.Plan = dto.Plan;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Đã cập nhật Plan từ '{oldPlan}' sang '{dto.Plan}' cho user {user.FullName}.",
            userId = user.Id,
            email = user.Email,
            plan = user.Plan
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Lỗi khi cập nhật Plan.", error = ex.Message });
    }
}
```

**LƯU Ý:** `AdminUsersController` đang dùng `IAdminUserService` — nếu không muốn inject `AppDbContext` trực tiếp vào controller, hãy thêm method `UpdatePlanAsync(int userId, string plan)` vào `IAdminUserService` và `AdminUserService` thay vì truy cập `_context` trực tiếp.

---

### TASK 9: Đăng ký service và worker trong Program.cs

Mở `server-dotnet/Program.cs`:

```csharp
// THÊM (sau các service đã có):
builder.Services.AddScoped<IInterviewQuotaService, InterviewQuotaService>();
builder.Services.AddHostedService<DailyQuotaResetWorker>();

// XÓA dòng này (nếu không còn service nào khác dùng ICreditService):
builder.Services.AddScoped<ICreditService, CreditService>();
```

**KIỂM TRA trước khi xóa `ICreditService`:** Tìm toàn bộ project xem còn file nào inject `ICreditService` không. Nếu còn (`CreditsController.cs`, `PaymentsController.cs`) thì giữ lại dòng đăng ký nhưng đánh dấu để xóa sau khi dọn dẹp các controller đó.

---

## ACCEPTANCE CRITERIA — Kiểm tra sau khi code xong

Chạy các test case sau để xác nhận đúng:

**TC1: Free user còn quota**
```
User: Plan=Free, DailyInterviewUsed=2
→ Gọi POST /api/hr-interviews/start
→ Kết quả: 200 OK, DailyInterviewUsed=3 trong DB
```

**TC2: Free user hết quota**
```
User: Plan=Free, DailyInterviewUsed=3
→ Gọi POST /api/hr-interviews/start
→ Kết quả: 429 Too Many Requests
→ Body: { "message": "Bạn đã sử dụng hết 3 buổi hôm nay..." }
→ DailyInterviewUsed KHÔNG thay đổi trong DB
```

**TC3: Premium user không bị chặn**
```
User: Plan=Premium, DailyInterviewUsed=0
→ Gọi POST /api/hr-interviews/start nhiều lần
→ Kết quả: Luôn 200 OK
→ DailyInterviewUsed KHÔNG thay đổi trong DB (vẫn = 0)
```

**TC4: GET quota status**
```
User: Plan=Free, DailyInterviewUsed=1
→ GET /api/interview/quota
→ Kết quả: { plan: "Free", dailyUsed: 1, dailyLimit: 3, remaining: 2, isUnlimited: false }
```

**TC5: Admin cấp Premium**
```
→ PATCH /api/admin/users/5/plan  body: { "plan": "Premium" }
→ Kết quả: 200 OK
→ User Id=5 có Plan="Premium" trong DB
```

**TC6: Reset worker**
```
→ Tạm thời đặt delay = 10 giây để test
→ Kiểm tra DB: tất cả Free user có DailyInterviewUsed > 0 được reset về 0
→ Premium user KHÔNG bị reset
```

---

## FILE KHÔNG ĐƯỢC THAY ĐỔI

Các file sau KHÔNG được sửa trong task này:
- `server-dotnet/Entities/Entities.cs` — User entity đã đủ field
- `server-dotnet/Data/AppDbContext.cs` — Không cần migration mới
- Bất kỳ file nào trong `client/` (Frontend)
- `ai-service/` (Python)

---

## LƯU Ý BỔ SUNG CHO GEMINI

1. **Không tạo Migration mới** — Field `DailyInterviewUsed` đã có trong DB, không cần thay đổi schema.

2. **Timezone trên Linux server:** `"SE Asia Standard Time"` chỉ hoạt động trên Windows. Trên Linux/Docker dùng `"Asia/Ho_Chi_Minh"`. Nên wrap trong try-catch:
```csharp
private static TimeZoneInfo GetVietnamTimeZone()
{
    try { return TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"); }
    catch { return TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh"); }
}
```

3. **Không xóa `CreditService.cs`, `ICreditService.cs`** trong task này — chỉ ngừng sử dụng. Xóa trong task dọn dẹp riêng để tránh build error nếu còn reference.

4. **Không thay đổi response format của các endpoint hiện có** — chỉ thay đổi status code từ `402` sang `429` cho trường hợp hết quota.

5. **Thread safety cho DailyQuotaResetWorker:** Worker dùng `IServiceScopeFactory` (không phải inject `AppDbContext` trực tiếp) để tránh lỗi scope trong BackgroundService.
