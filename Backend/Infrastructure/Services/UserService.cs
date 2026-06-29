using Application.DTOs.User;
using Application.Interfaces;

namespace Infrastructure.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
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

        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName!,
            Email = user.Email!
        };
    }

    // Get currently logged-in user
    public async Task<UserProfileDto?> GetCurrentUserAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
            return null;

        return new UserProfileDto
        {
            Id = user.Id,
            UserName = user.UserName!,
            Email = user.Email!
        };
    }

    // Delete user
    public async Task DeleteAsync(Guid id)
    {
        await _userRepository.DeleteAsync(id);
    }
}