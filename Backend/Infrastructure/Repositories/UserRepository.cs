using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ChatDbContext _db;

    public UserRepository(ChatDbContext db)
    {
        _db = db;
    }

    public async Task<List<User>> GetAllAsync()
    {
        return await _db.Users.ToListAsync();
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _db.Users
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _db.Users
            .FirstOrDefaultAsync(x => x.Email == email);
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