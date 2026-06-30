using Domain.Entities;

namespace Application.Interfaces;

public interface IMessageService
{
    Task<Message> SendAsync(Guid senderId, Guid conversationId, string text);

    Task<List<Message>> GetConversationMessagesAsync(Guid conversationId);

    Task<Message?> GetByIdAsync(Guid id);

    Task MarkAsSeenAsync(Guid messageId);
    Task MarkConversationAsSeen(Guid conversationId, Guid userId);
}