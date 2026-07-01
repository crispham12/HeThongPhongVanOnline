using FluentValidation;
using FluentValidation.AspNetCore;
using InterviewPro.API.Data;
using InterviewPro.API.DTOs;
using InterviewPro.API.Interfaces;
using InterviewPro.API.Repositories;
using InterviewPro.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ──────────────── Database ────────────────
builder.Services.AddDbContext<AppDbContext>(opts =>
    opts.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpContextAccessor();

// ──────────────── JWT ────────────────
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        };
    });

builder.Services.AddAuthorization();

// ──────────────── DI (Dependency Injection) ────────────────
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IInterviewRepository, InterviewRepository>();
builder.Services.AddScoped<ICvTemplateRepository, CvTemplateRepository>();
builder.Services.AddScoped<ICvTemplateService, CvTemplateService>();
builder.Services.AddScoped<ICvTemplateSectionRepository, CvTemplateSectionRepository>();
builder.Services.AddScoped<ICvTemplateSectionService, CvTemplateSectionService>();
builder.Services.AddScoped<ICvTemplateComponentRepository, CvTemplateComponentRepository>();
builder.Services.AddScoped<ICvTemplateComponentService, CvTemplateComponentService>();
// HR Interview services
builder.Services.AddScoped<IHrAiClient, HrAiClient>();
builder.Services.AddScoped<IHrInterviewService, HrInterviewService>();

// Admin AI Monitor service
builder.Services.AddScoped<IAiMonitorService, AiMonitorService>();
builder.Services.AddScoped<IHrQuestionBankService, HrQuestionBankService>();
builder.Services.AddScoped<IAiRequestLogService, AiRequestLogService>();

// Interview Data Management service
builder.Services.AddScoped<IInterviewDataService, InterviewDataService>();

// Admin User Management service
builder.Services.AddScoped<IAdminUserService, AdminUserService>();

// Admin Dashboard service
builder.Services.AddScoped<IAdminDashboardService, AdminDashboardService>();

// Credit & Payment systems
builder.Services.AddScoped<ICreditService, CreditService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<ISePayWebhookService, SePayWebhookService>();


// Coding Problem Bank services
builder.Services.AddScoped<IAdminCodingProblemService, AdminCodingProblemService>();
builder.Services.AddScoped<IPracticeCodingProblemService, PracticeCodingProblemService>();

builder.Services.AddHttpClient("AIService", client => {
    client.BaseAddress = new Uri("http://localhost:8000");
});

// ──────────────── Swagger ────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "InterviewPro API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In          = ParameterLocation.Header,
        Description = "Enter: Bearer {token}",
        Name        = "Authorization",
        Type        = SecuritySchemeType.ApiKey,
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

// (Skip to builder.Services.AddControllers)
builder.Services.AddControllers()
    .AddFluentValidation(fv => fv.RegisterValidatorsFromAssemblyContaining<AddSectionRequestDtoValidator>());
builder.Services.AddCors(opts =>
    opts.AddPolicy("AllowFrontend", p =>
        p.WithOrigins("http://localhost:5173", "http://localhost:5174")
         .AllowAnyMethod()
         .AllowAnyHeader()
         .AllowCredentials()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Auto-migrate
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
        Console.WriteLine("✅ Database migration applied.");

        var questionBankService = scope.ServiceProvider.GetRequiredService<IHrQuestionBankService>();
        questionBankService.SeedDefaultQuestionsAsync().GetAwaiter().GetResult();
        Console.WriteLine("✅ HR Question Bank seeded.");

        // Populate missing UserCodes
        var usersWithNoCode = db.Users.Where(u => string.IsNullOrEmpty(u.UserCode)).ToList();
        if (usersWithNoCode.Any())
        {
            var count = db.Users.Count(u => !string.IsNullOrEmpty(u.UserCode));
            foreach (var user in usersWithNoCode)
            {
                count++;
                user.UserCode = $"US{count:D2}";
            }
            db.SaveChanges();
            Console.WriteLine("✅ Populated missing UserCodes.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️  Database sync warning: {ex.Message}");
    }
}

app.Run();
