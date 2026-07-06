using Domain.Entities;
using Application.DTOs.Conversations;

namespace Application.Interfaces;

public interface IConversationService
{
    Task<Conversation> CreateAsync(Guid userId, Guid otherUserId);
    Task<List<ConversationDto>> GetAllAsync(Guid currentuserId);

    Task<Conversation?> GetByIdAsync(Guid id);

    Task<bool> IsParticipantAsync(Guid conversationId, Guid userId);
    Task<List<Guid>> GetParticipantIdsAsync(Guid conversationId);

    Task<List<Guid>> GetConversationIdsForUserAsync(Guid userId);
}
