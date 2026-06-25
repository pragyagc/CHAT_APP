using Application.DTOs.Messages;
using Domain.Entities;

namespace Application.Interfaces;

public interface IMessageService
{
    Task<Message> SendAsync(
        SendMessageRequest request);

    Task<List<Message>>
        GetConversationMessagesAsync(Guid conversationId);
}