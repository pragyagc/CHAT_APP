using CHATAPP.DOMAIN.Entities;
using CHATAPP.APPLICATION.DTOs.Message;

namespace CHATAPP.APPLICATION.Interfaces;

public interface IMessageRepository
{
    Task AddAsync(Message message);
    Task<List<MessageDto>> GetByConversationIdAsync(Guid conversationId);
    //it should not returnDTO else efcore is not tracking this for seen
    Task<MessageDto?> GetByIdAsync(Guid id);
    Task SaveAsync();
    Task<List<Message>> GetUnreadMessagesAsync(Guid conversationId, Guid userId);

}