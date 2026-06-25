using Application.DTOs.Conversations;
using Domain.Entities;

namespace Application.Interfaces;

public interface IConversationService
{
    Task<Conversation> CreateAsync(
        CreateConversationRequest request);

    Task<List<Conversation>> GetAllAsync();
}