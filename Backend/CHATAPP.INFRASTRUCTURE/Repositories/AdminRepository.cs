using CHATAPP.APPLICATION.DTOs.Admin;
using CHATAPP.APPLICATION.Interfaces;
using CHATAPP.DOMAIN.Entities;
using CHATAPP.INFRASTRUCTURE.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CHATAPP.INFRASTRUCTURE.Repositories;

public class AdminRepository : IAdminRepository
{
    private readonly ChatDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    public AdminRepository(
    ChatDbContext context,
    UserManager<User> userManager,
    RoleManager<IdentityRole<Guid>> roleManager)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<DashboardDto> GetDashboardAsync()
    {
        var userCount = await _context.Users.CountAsync();
        var messageCount = await _context.Messages.CountAsync();
        var conversationCount = await _context.Conversations.CountAsync();

        return new DashboardDto
        {
            TotalUsers = userCount,
            TotalMessages = messageCount,
            TotalConversations = conversationCount
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
        var returnData = result
            .OrderBy(u => u.UserName)
            .ToList();
        return returnData;
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
        if (user.IsDeleted)
            throw new Exception("User is already deleted.");

        user.IsDeleted = true;

        await _context.SaveChangesAsync();
    }

    public async Task RestoreUserAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            throw new Exception("User not found.");

        user.IsDeleted = false;
       
        await _context.SaveChangesAsync();
    }

    public async Task CreateUserAsync(CreateUserDto dto)
    {
        var exists = await _userManager.FindByEmailAsync(dto.Email);

        if (exists != null)
            throw new Exception("Email already exists.");

        var user = new User
        {
            UserName = dto.UserName,
            Email = dto.Email,
            CreatedAt = DateTime.UtcNow,
            IsBlocked = false,
            IsDeleted = false
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
            throw new Exception(string.Join(", ",
                result.Errors.Select(e => e.Description)));

        if (!await _roleManager.RoleExistsAsync(dto.Role))
            throw new Exception("Role does not exist.");

        await _userManager.AddToRoleAsync(user, dto.Role);
    }
}