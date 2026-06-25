using Application.DTOs.Messages;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class MessageService
    : IMessageService
{
    private readonly ChatDbContext _db;

    public MessageService(
        ChatDbContext db)
    {
        _db = db;
    }

    public async Task<Message>
        SendAsync(
            SendMessageRequest request)
    {
        var message = new Message
        {
            Id = Guid.NewGuid(),
            ConversationId =
                request.ConversationId,
            SenderId =
                request.SenderId,
            Text = request.Text,
            SentAt = DateTime.UtcNow,
            IsSeen = false
        };

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
                x.ConversationId ==
                conversationId)
            .ToListAsync();
    }
}