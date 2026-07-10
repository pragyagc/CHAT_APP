using CHATAPP.DOMAIN.Entities;
using CHATAPP.APPLICATION.DTOs.Conversations;


namespace CHATAPP.APPLICATION.Interfaces;

public interface IConversationRepository
{
    Task<Conversation> AddAsync(Conversation conversation);

    Task<List<Conversation>> GetAllAsync();

    Task<ConversationDetailsDto?> GetByIdAsync(Guid id);

    Task<bool> IsParticipantAsync(Guid conversationId, Guid userId);

    Task<Conversation?> GetBetweenUsersAsync(Guid user1Id, Guid user2Id);

    Task<List<Guid>> GetParticipantIdsAsync(Guid conversationId);

    Task<List<Guid>> GetConversationIdsForUserAsync(Guid userId);
}


