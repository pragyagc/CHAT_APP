using Application.Interfaces;
using Domain.Entities;

namespace Infrastructure.Services;

public class MessageService : IMessageService
{
    private readonly IMessageRepository _repository;

    public MessageService(IMessageRepository repository)
    {
        _repository = repository;
    }

    public async Task<Message> SendAsync(
        Guid senderId,
        Guid conversationId,
        string text)
    {
        var message = new Message
        {
            Id = Guid.NewGuid(),

            SenderId = senderId,

            ConversationId = conversationId,

            Text = text,

            SentAt = DateTime.UtcNow,

            CreatedAt = DateTime.UtcNow,

            IsSeen = false
        };

        await _repository.AddAsync(message);

        await _repository.SaveAsync();

        return message;
    }

    public async Task<List<Message>> GetConversationMessagesAsync(
        Guid conversationId)
    {
        return await _repository
            .GetByConversationIdAsync(conversationId);
    }

    public async Task<Message?> GetByIdAsync(Guid id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task MarkAsSeenAsync(Guid messageId)
    {
        var message =
            await _repository.GetByIdAsync(messageId);

        if (message == null)
            return;

        message.IsSeen = true;
        message.SeenAt = DateTime.UtcNow;

        await _repository.SaveAsync();
    }
}