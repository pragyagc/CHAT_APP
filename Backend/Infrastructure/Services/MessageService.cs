using Application.DTOs.Message;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Services;

public class MessageService : IMessageService
{
    private readonly IMessageRepository _repository;
    private readonly IConversationRepository _conversationRepository;
    private readonly UserManager<User> _userManager;

    public MessageService(
        IMessageRepository repository,
        IConversationRepository conversationRepository,
        UserManager<User> userManager)
    {
        _repository = repository;
        _conversationRepository = conversationRepository;
        _userManager = userManager;
    }

    public async Task<MessageDto> SendAsync(
        Guid senderId,
        Guid conversationId,
        string text)
    {
        var conversation =
            await _conversationRepository.GetByIdAsync(conversationId);

        Console.WriteLine("================================");
        Console.WriteLine($"ConversationId: {conversationId}");
        Console.WriteLine($"IsReadOnly: {conversation?.IsReadOnly}");
        Console.WriteLine($"IsAdminConversation: {conversation?.IsAdminConversation}");
        Console.WriteLine($"SenderId: {senderId}");
        Console.WriteLine("================================");

        if (conversation == null)
            throw new Exception("Conversation not found.");

        if (conversation.IsReadOnly)
        {
            var sender =
                await _userManager.FindByIdAsync(senderId.ToString());

            if (sender == null)
                throw new Exception("User not found.");

            var isAdmin =
                await _userManager.IsInRoleAsync(sender, "Admin");

            if (!isAdmin)
                throw new UnauthorizedAccessException(
                    "You cannot reply to this conversation.");
        }

        var message = new Message
        {
            Id = Guid.NewGuid(),
            SenderId = senderId,
            ConversationId = conversationId,
            Text = text,
            CreatedAt = DateTime.UtcNow,
            SentAt = DateTime.UtcNow,
            IsSeen = false
        };

        await _repository.AddAsync(message);
        await _repository.SaveAsync();

        return ToDto(message);
    }

    public async Task<List<MessageDto>> GetConversationMessagesAsync(
        Guid conversationId)
    {
        var messages =
            await _repository.GetByConversationIdAsync(conversationId);

        return messages
            .Select(ToDto)
            .ToList();
    }

    public async Task<MessageDto?> GetByIdAsync(Guid id)
    {
        var message =
            await _repository.GetByIdAsync(id);

        if (message == null)
            return null;

        return ToDto(message);
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

    public async Task MarkConversationAsSeen(
        Guid conversationId,
        Guid userId)
    {
        var messages =
            await _repository.GetByConversationIdAsync(conversationId);

        foreach (var msg in messages.Where(m =>
                     m.SenderId != userId &&
                     !m.IsSeen))
        {
            msg.IsSeen = true;
            msg.SeenAt = DateTime.UtcNow;
        }

        await _repository.SaveAsync();
    }

    private static MessageDto ToDto(Message message)
    {
        return new MessageDto
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SenderId = message.SenderId,
            Text = message.Text,
            CreatedAt = message.CreatedAt,
            IsSeen = message.IsSeen,
            SeenAt = message.SeenAt
        };
    }
}