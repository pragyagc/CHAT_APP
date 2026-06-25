using Domain.Entities;

namespace Application.Interfaces;

public interface IConversationRepository
{
    Task<Conversation> AddAsync(
        Conversation conversation);

    Task<List<Conversation>> GetAllAsync();

    Task<Conversation?> GetByIdAsync(Guid id);
}