using Domain.Entities;

namespace Application.Interfaces;

public interface IUserService
{
    Task<List<User>> GetAllAsync();

    Task<User?> GetByIdAsync(Guid id);

    Task DeleteAsync(Guid id);
}