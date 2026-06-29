using System.Security.Claims;
using System.Text;
using APIWEB.Hubs;
using Application.DTOs.Auth;
using Application.DTOs.Message;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Authentication;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

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

builder.Services.AddSignalR();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.ReferenceHandler =
        System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

var app = builder.Build();

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

var auth = app.MapGroup("/auth");

var users = app.MapGroup("/users")
    .RequireAuthorization();

var admin = app.MapGroup("/admin")
    .RequireAuthorization();

var conversations = app.MapGroup("/conversations")
    .RequireAuthorization();

var messages = app.MapGroup("/messages")
    .RequireAuthorization();

#region AUTH

auth.MapPost("/register",
async (
    RegisterRequest request,
    IAuthService authService) =>
{
    await authService.RegisterAsync(request);

    return Results.Ok();
});

auth.MapPost("/login",
async (
    LoginRequest request,
    IAuthService authService) =>
{
    var result =
        await authService.LoginAsync(request);

    return result == null
        ? Results.BadRequest()
        : Results.Ok(result);
});

#endregion

#region USERS

users.MapGet("/",
async (IUserService service) =>
{
    return Results.Ok(await service.GetAllAsync());
});

users.MapGet("/me",
async (
ClaimsPrincipal user,
IUserService service) =>
{
    var id =
        Guid.Parse(
            user.FindFirstValue(
                ClaimTypes.NameIdentifier)!);

    return Results.Ok(
        await service.GetByIdAsync(id));
});

#endregion

#region CONVERSATIONS

conversations.MapGet("/",
async (
ClaimsPrincipal user,
IConversationService service) =>
{
    var id =
        Guid.Parse(
            user.FindFirstValue(
                ClaimTypes.NameIdentifier)!);

    return Results.Ok(
        await service.GetAllAsync(id));
});

conversations.MapPost("/{otherUserId:guid}",
async (
Guid otherUserId,
ClaimsPrincipal user,
IConversationService service) =>
{
    var id =
        Guid.Parse(
            user.FindFirstValue(
                ClaimTypes.NameIdentifier)!);

    return Results.Ok(
        await service.CreateAsync(
            id,
            otherUserId));
});

#endregion

#region MESSAGES

messages.MapPost("/",
async (
CreateMessageDto dto,
ClaimsPrincipal user,
IMessageService service) =>
{
    var id =
        Guid.Parse(
            user.FindFirstValue(
                ClaimTypes.NameIdentifier)!);

    return Results.Ok(
        await service.SendAsync(
            id,
            dto.ConversationId,
            dto.Content));
});

messages.MapGet("/conversation/{conversationId:guid}",
async (
Guid conversationId,
IMessageService service) =>
{
    return Results.Ok(
        await service.GetConversationMessagesAsync(
            conversationId));
});

#endregion

app.MapHub<ChatHub>("/chatHub");

app.Run();