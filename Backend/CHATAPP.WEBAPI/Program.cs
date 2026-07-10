using System.Security.Claims;
using System.Text;
using CHATAPP.WEBAPI.Hubs;
using CHATAPP.APPLICATION.DTOs.Admin;
using CHATAPP.APPLICATION.DTOs.Auth;
using CHATAPP.APPLICATION.DTOs.Message;
using CHATAPP.APPLICATION.Interfaces;
using CHATAPP.DOMAIN.Entities;
using CHATAPP.INFRASTRUCTURE.Authentication;
using CHATAPP.INFRASTRUCTURE.Data;
using CHATAPP.INFRASTRUCTURE.Repositories;
using CHATAPP.INFRASTRUCTURE.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using CHATAPP.WEBAPI.Endpoints;

var builder = WebApplication.CreateBuilder(args);

#region Database

builder.Services.AddDbContext<ChatDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"));
});

#endregion

#region Identity

builder.Services.AddIdentity<User, IdentityRole<Guid>>()
    .AddEntityFrameworkStores<ChatDbContext>()
    .AddDefaultTokenProviders();

#endregion

#region Dependency Injection

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IConversationRepository, ConversationRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IConversationService, ConversationService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<JwtTokenGenerator>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<IAdminService, AdminService>();
//add singleton service for online user tracking
builder.Services.AddSingleton<IOnlineUserService, OnlineUserService>();

#endregion

#region Swagger

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header
        });

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Id = "Bearer",
                        Type = ReferenceType.SecurityScheme
                    }
                },
                Array.Empty<string>()
            }
        });
});

#endregion

#region Authentication

builder.Services
.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme =
        JwtBearerDefaults.AuthenticationScheme;

    options.DefaultChallengeScheme =
        JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            IssuerSigningKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        builder.Configuration["Jwt:Key"]!))
        };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var token =
                context.Request.Query["access_token"];

            if (!string.IsNullOrEmpty(token) &&
                context.HttpContext.Request.Path
                    .StartsWithSegments("/chatHub"))
            {
                context.Token = token;
            }

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

#endregion

#region CORS

builder.Services.AddCors(options =>
{
    options.AddPolicy("React", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

#endregion

# region SignalR
builder.Services.AddSignalR();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.ReferenceHandler =
        System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

var app = builder.Build();

#endregion

#region Seed Roles

using (var scope = app.Services.CreateScope())
{
    var roleManager =
        scope.ServiceProvider
            .GetRequiredService<RoleManager<IdentityRole<Guid>>>();

    var userManager =
        scope.ServiceProvider
            .GetRequiredService<UserManager<User>>();

    await IdentitySeeder.SeedRolesAsync(
        userManager,
        roleManager);
}

#endregion

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("React");

app.UseAuthentication();

app.UseAuthorization();

//all endpoints
AuthEndpoints.Register(app);
UserEndpoints.Register(app);
ConversationEndpoints.Register(app);
MessageEndpoints.Register(app);
AdminEndpoints.Register(app);

//signalR hub
app.MapHub<ChatHub>("/chatHub");

app.Run();