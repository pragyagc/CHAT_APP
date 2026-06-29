using Domain.Entities;

namespace Application.Interfaces;

public interface IMessageRepository
{
    Task AddAsync(Message message);
    Task<List<Message>> GetByConversationIdAsync(Guid conversationId);
    Task<Message?> GetByIdAsync(Guid id);
    Task SaveAsync();

}