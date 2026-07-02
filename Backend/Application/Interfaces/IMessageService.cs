using Application.DTOs.Message;

namespace Application.Interfaces;

public interface IMessageService
{
    Task<MessageDto> SendAsync(
        Guid senderId,
        Guid conversationId,
        string text);

    Task<List<MessageDto>> GetConversationMessagesAsync(
        Guid conversationId);

    Task<MessageDto?> GetByIdAsync(Guid id);

    Task MarkAsSeenAsync(Guid messageId);

    Task MarkConversationAsSeen(
        Guid conversationId,
        Guid userId);
}