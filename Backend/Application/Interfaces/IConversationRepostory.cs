using Domain.Entities;

namespace Application.Interfaces;

public interface IConversationRepository
{

    Task<Conversation> AddAsync(Conversation conversation);

    Task<List<Conversation>> GetAllAsync();

    Task<Conversation?> GetByIdAsync(Guid id);
    Task<bool> IsParticipantAsync(Guid conversationId, Guid userId);
    Task<Conversation?> GetBetweenUsersAsync(Guid user1Id, Guid user2Id);

}