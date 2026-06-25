using Domain.Entities;

namespace Application.Interfaces;

public interface IMessageRepository
{
    Task<Message> AddAsync(Message message);

    Task<List<Message>>
        GetConversationMessagesAsync(
            Guid conversationId);
}