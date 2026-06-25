using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class MessageRepository
    : IMessageRepository
{
    private readonly ChatDbContext _db;

    public MessageRepository(ChatDbContext db)
    {
        _db = db;
    }

    public async Task<Message> AddAsync(
        Message message)
    {
        _db.Messages.Add(message);

        await _db.SaveChangesAsync();

        return message;
    }

    public async Task<List<Message>>
        GetConversationMessagesAsync(
            Guid conversationId)
    {
        return await _db.Messages
            .Where(x =>
                x.ConversationId == conversationId)
            .ToListAsync();
    }
}