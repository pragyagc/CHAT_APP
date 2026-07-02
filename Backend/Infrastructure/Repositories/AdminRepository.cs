using Application.DTOs.Admin;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class AdminRepository : IAdminRepository
{
    private readonly ChatDbContext _context;
    private readonly UserManager<User> _userManager;

    public AdminRepository(
        ChatDbContext context,
        UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<DashboardDto> GetDashboardAsync()
    {
        return new DashboardDto
        {
            TotalUsers = await _context.Users.CountAsync(),
            TotalMessages = await _context.Messages.CountAsync(),
            TotalConversations = await _context.Conversations.CountAsync()
        };
    }

    public async Task<UserInfoDto?> GetUserInfoAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            return null;

        var roles = await _userManager.GetRolesAsync(user);

        return new UserInfoDto
        {
            Id = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            Role = roles.FirstOrDefault() ?? string.Empty,
            IsBlocked = user.IsBlocked,
            IsDeleted = user.IsDeleted,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<List<UserInfoDto>> GetAllUsersAsync()
    {
        var users = await _context.Users.ToListAsync();

        var result = new List<UserInfoDto>();

        foreach (var user in users)
        {
            // Skip admins
            if (await _userManager.IsInRoleAsync(user, "Admin"))
                continue;

            result.Add(new UserInfoDto
            {
                Id = user.Id,
                UserName = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                IsBlocked = user.IsBlocked,
                IsDeleted = user.IsDeleted,
                CreatedAt = user.CreatedAt,
                Role = "User"
            });
        }

        return result
            .OrderBy(u => u.UserName)
            .ToList();
    }

    public async Task BlockUserAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            throw new Exception("User not found.");

        user.IsBlocked = true;

        await _context.SaveChangesAsync();
    }

    public async Task UnblockUserAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            throw new Exception("User not found.");

        user.IsBlocked = false;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteUserAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            throw new Exception("User not found.");

        user.IsDeleted = true;

        await _context.SaveChangesAsync();
    }
}