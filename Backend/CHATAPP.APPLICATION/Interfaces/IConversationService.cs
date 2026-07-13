using CHATAPP.DOMAIN.Entities;
using CHATAPP.APPLICATION.DTOs.Conversations;

namespace CHATAPP.APPLICATION.Interfaces;

public interface IConversationService
{
    Task<Conversation> CreateAsync(Guid userId, Guid otherUserId);
    Task<List<ConversationDto>> GetAllAsync(Guid currentuserId);

    Task<ConversationDetailsDto?> GetByIdAsync(Guid id, Guid currentUserId, bool isAdmin);

    Task<bool> IsParticipantAsync(Guid conversationId, Guid userId);
    Task<List<Guid>> GetParticipantIdsAsync(Guid conversationId);

    Task<List<Guid>> GetConversationIdsForUserAsync(Guid userId);
}
