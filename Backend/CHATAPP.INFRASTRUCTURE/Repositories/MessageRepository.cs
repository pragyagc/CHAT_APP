using CHATAPP.APPLICATION.Interfaces;
using CHATAPP.DOMAIN.Entities;
using CHATAPP.INFRASTRUCTURE.Data;
using Microsoft.EntityFrameworkCore;
using CHATAPP.APPLICATION.DTOs.Message;

namespace CHATAPP.INFRASTRUCTURE.Repositories;

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

    public async Task<List<MessageDto>> GetByConversationIdAsync(Guid conversationId)
    {
        return await _db.Messages
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.SentAt)
            .Select(m => new MessageDto
            {
                Id = m.Id,
                ConversationId = m.ConversationId,
                SenderId = m.SenderId,
                Text = m.Text,
                CreatedAt = m.CreatedAt,
                SentAt = m.SentAt,
                IsSeen = m.IsSeen,
                SeenAt = m.SeenAt
            })
            .ToListAsync();
    }

    public async Task<MessageDto?> GetByIdAsync(Guid id)
    {
        return await _db.Messages
            .Where(m => m.Id == id)
            .Select(m => new MessageDto
            {
                Id = m.Id,
                ConversationId = m.ConversationId,
                SenderId = m.SenderId,
                Text = m.Text,
                CreatedAt = m.CreatedAt,
                SentAt = m.SentAt,
                IsSeen = m.IsSeen,
                SeenAt = m.SeenAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task SaveAsync()
    {
        await _db.SaveChangesAsync();
    }
    public async Task<List<Message>> GetUnreadMessagesAsync(
    Guid conversationId,
    Guid userId)
    {
        return await _db.Messages
            .Where(m =>
                m.ConversationId == conversationId &&
                m.SenderId != userId &&
                !m.IsSeen)
            .ToListAsync();
    }
}