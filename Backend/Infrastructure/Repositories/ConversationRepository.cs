using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ConversationRepository : IConversationRepository
{
    private readonly ChatDbContext _db;

    public ConversationRepository(ChatDbContext db)
    {
        _db = db;
    }

    public async Task<Conversation> AddAsync(Conversation conversation)
    {
        await _db.Conversations.AddAsync(conversation);
        return conversation;
    }

    public async Task<Conversation?> GetByIdAsync(Guid id)
    {
        return await _db.Conversations
            .Include(c => c.Participants)
                .ThenInclude(cp => cp.User)
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<List<Conversation>> GetAllAsync()
    {
        return await _db.Conversations
            .Include(c => c.Participants)
                .ThenInclude(cp => cp.User)
            .Include(c => c.Messages)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> IsParticipantAsync(
        Guid conversationId,
        Guid userId)
    {
        return await _db.ConversationParticipants
            .AnyAsync(cp =>
                cp.ConversationId == conversationId &&
                cp.UserId == userId);
    }

    public async Task<Conversation?> GetBetweenUsersAsync(
        Guid user1Id,
        Guid user2Id)
    {
        return await _db.Conversations
            .Include(c => c.Participants)
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c =>
                c.Participants.Count == 2 &&
                c.Participants.Any(p => p.UserId == user1Id) &&
                c.Participants.Any(p => p.UserId == user2Id));
    }
}