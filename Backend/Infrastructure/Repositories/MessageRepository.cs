using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class MessageRepository : IMessageRepository
{
    private readonly ChatDbContext _db;

    public MessageRepository(ChatDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(Message message)
    {
        await _db.Messages.AddAsync(message);
    }

    public async Task<List<Message>> GetByConversationIdAsync(Guid conversationId)
    {
        return await _db.Messages
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.SentAt)           // oldest → newest
            .Include(m => m.Sender)           // sender information
            .ToListAsync();
    }

    public async Task<Message?> GetByIdAsync(Guid id)
    {
        return await _db.Messages
            .Include(m => m.Sender)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task SaveAsync()
    {
        await _db.SaveChangesAsync();
    }
}