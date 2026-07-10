using CHATAPP.APPLICATION.Interfaces;
using CHATAPP.DOMAIN.Entities;
using CHATAPP.INFRASTRUCTURE.Data;
using Microsoft.EntityFrameworkCore;

namespace CHATAPP.INFRASTRUCTURE.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ChatDbContext _db;

    public UserRepository(ChatDbContext db)
    {
        _db = db;
    }

    public async Task<List<User>> GetAllAsync()
    {
        return await _db.Users
            .Where(x => !x.IsDeleted)
            .ToListAsync();
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _db.Users
            .FirstOrDefaultAsync(x => x.Id == id&&!x.IsDeleted);
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