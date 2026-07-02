using Application.DTOs.User;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly UserManager<User> _userManager;


    public UserService(IUserRepository userRepository, UserManager<User> userManager)
    {
        _userRepository = userRepository;
        _userManager = userManager;
    }

    // Get all users
    public async Task<List<UserDto>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();

        return users.Select(user => new UserDto
        {
            Id = user.Id,
            UserName = user.UserName!,
            Email = user.Email!
        }).ToList();
    }

    // Get user by Id
    public async Task<UserDto?> GetByIdAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);

        if (user == null)
            return null;
        var role = (await _userManager.GetRolesAsync(user))
       .FirstOrDefault() ?? "";
        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName!,
            Email = user.Email!,
            Role=role
        };
    }

    // Get currently logged-in user
    public async Task<UserProfileDto?> GetCurrentUserAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
            return null;
        var role = (await _userManager.GetRolesAsync(user))
        .FirstOrDefault() ?? "";

        return new UserProfileDto
        {
            Id = user.Id,
            UserName = user.UserName!,
            Email = user.Email!,
            Role = role
        };
    }

    // Delete user
    public async Task DeleteAsync(Guid id)
    {
        await _userRepository.DeleteAsync(id);
    }
}