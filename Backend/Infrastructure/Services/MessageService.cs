using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Services;

public class MessageService : IMessageService
{
    private readonly IMessageRepository _repository;
    private readonly IConversationRepository _conversationRepository;
    private readonly UserManager<User> _userManager;

    public MessageService(IMessageRepository repository,IConversationRepository conversationRepository,UserManager<User> userManager)
    {
        _repository = repository;
        _conversationRepository = conversationRepository;
        _userManager = userManager;
    }

    public async Task<Message> SendAsync(Guid senderId,Guid conversationId,string text)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
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
            var sender = await _userManager.FindByIdAsync(senderId.ToString());

            if (sender == null)
                throw new Exception("User not found.");

            var isAdmin = await _userManager.IsInRoleAsync(sender, "Admin");
            Console.WriteLine($"Sender Role: {(isAdmin ? "Admin" : "User")}");
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

    public async Task MarkConversationAsSeen(Guid conversationId, Guid userId)
    {
        var messages = await _repository.GetByConversationIdAsync(conversationId);

        var unseenMessages = messages
            .Where(m => m.SenderId != userId && !m.IsSeen)
            .ToList();

        foreach (var msg in unseenMessages)
        {
            msg.IsSeen = true;
            msg.SeenAt = DateTime.UtcNow;
        }

        await _repository.SaveAsync();
    }
}