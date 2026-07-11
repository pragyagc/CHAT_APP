using CHATAPP.APPLICATION.Interfaces;
using CHATAPP.DOMAIN.Entities;
using CHATAPP.INFRASTRUCTURE.Data;
using Microsoft.EntityFrameworkCore;
using CHATAPP.APPLICATION.DTOs.User;

namespace CHATAPP.INFRASTRUCTURE.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ChatDbContext _db;

    public UserRepository(ChatDbContext db)
    {
        _db = db;
    }

    public async Task<List<UserDto?>> GetAllAsync()
    {
        var getall = await _db.Users
            .Where(x => !x.IsDeleted)
             .Select(x => new UserDto
             {
                 Id = x.Id,
                 UserName = x.UserName!,
                 Email = x.Email!
             }).ToListAsync();
        return getall;
    }

    public async Task<UserDto?> GetByIdAsync(Guid id)
    {
        var getbyid = await _db.Users
        .Where(x => x.Id == id && !x.IsDeleted)
        .Select(x => new UserDto
        {
            Id = x.Id,
            UserName = x.UserName!,
            Email = x.Email!
        })
        .FirstOrDefaultAsync();
        return getbyid;
    }

    public async Task<UserDto?> GetByEmailAsync(string email)
    {
        var get = await _db.Users
        .Where(x => x.Email == email)
        .Select(x => new UserDto
        {
            Id = x.Id,
            UserName = x.UserName!,
            Email = x.Email!
        })
        .FirstOrDefaultAsync();
        return get;
    }

    public async Task DeleteAsync(Guid id)
    {
        var user = await _db.Users.FindAsync(id);

        if (user is null)
            return;

        _db.Users.Remove(user);

        await _db.SaveChangesAsync();
    }
}