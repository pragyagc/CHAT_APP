using CHATAPP.APPLICATION.DTOs.User;
using CHATAPP.DOMAIN.Entities;


namespace CHATAPP.APPLICATION.Interfaces;

public interface IUserService
{
    Task<List<UserDto>> GetAllAsync();

    Task<UserDto?> GetByIdAsync(Guid id);

    Task<UserProfileDto?> GetCurrentUserAsync(Guid userId);

    Task DeleteAsync(Guid id);
}