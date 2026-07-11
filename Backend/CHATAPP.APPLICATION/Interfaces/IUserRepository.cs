using CHATAPP.DOMAIN.Entities;
using CHATAPP.APPLICATION.DTOs.User;

namespace CHATAPP.APPLICATION.Interfaces;

public interface IUserRepository
{
    Task<UserDto?> GetByIdAsync(Guid id);

    Task<UserDto?> GetByEmailAsync(string email);

    Task<List<UserDto>> GetAllAsync();

    Task DeleteAsync(Guid id);
  
}