using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ConversationRepository
    : IConversationRepository
{
    private readonly ChatDbContext _db;

    public ConversationRepository(ChatDbContext db)
    {
        _db = db;
    }

    public async Task<Conversation> AddAsync(
        Conversation conversation)
    {
        _db.Conversations.Add(conversation);

        await _db.SaveChangesAsync();

        return conversation;
    }

    public async Task<List<Conversation>> GetAllAsync()
    {
        return await _db.Conversations.ToListAsync();
    }

    public async Task<Conversation?> GetByIdAsync(Guid id)
    {
        return await _db.Conversations
            .Include(x => x.Participants)
            .FirstOrDefaultAsync(x => x.Id == id);
    }
}