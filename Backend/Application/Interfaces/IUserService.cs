using Application.DTOs.User;
using Domain.Entities;


namespace Application.Interfaces;

public interface IUserService
{
    Task<List<UserDto>> GetAllAsync();

    Task<UserDto?> GetByIdAsync(Guid id);

    Task<UserProfileDto?> GetCurrentUserAsync(Guid userId);

    Task DeleteAsync(Guid id);
}