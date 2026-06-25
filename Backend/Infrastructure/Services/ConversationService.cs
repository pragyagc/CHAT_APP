using Application.DTOs.Conversations;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class ConversationService
    : IConversationService
{
    private readonly ChatDbContext _db;

    public ConversationService(
        ChatDbContext db)
    {
        _db = db;
    }

    public async Task<Conversation>
        CreateAsync(
            CreateConversationRequest request)
    {
        var conversation =
            new Conversation
            {
                Id = Guid.NewGuid(),
                CreatedAt = DateTime.UtcNow
            };

        _db.Conversations.Add(conversation);

        await _db.SaveChangesAsync();

        return conversation;
    }

    public async Task<List<Conversation>>
        GetAllAsync()
    {
        return await _db.Conversations
            .ToListAsync();
    }
}