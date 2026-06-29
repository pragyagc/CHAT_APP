using Application.DTOs.Conversations;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class ConversationService : IConversationService
{
    private readonly IConversationRepository _repository;
    private readonly ChatDbContext _db;

    public ConversationService(
        IConversationRepository repository,
        ChatDbContext db)
    {
        _repository = repository;
        _db = db;
    }

    public async Task<Conversation> CreateAsync(
        Guid currentUserId,
        Guid otherUserId)
    {
        var existing =
            await _repository.GetBetweenUsersAsync(
                currentUserId,
                otherUserId);

        if (existing != null)
            return existing;

        var conversation = new Conversation
        {
            Id = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };

        conversation.Participants.Add(
            new ConversationParticipant
            {
                ConversationId = conversation.Id,
                UserId = currentUserId,
                JoinedAt = DateTime.UtcNow
            });

        conversation.Participants.Add(
            new ConversationParticipant
            {
                ConversationId = conversation.Id,
                UserId = otherUserId,
                JoinedAt = DateTime.UtcNow
            });

        await _repository.AddAsync(conversation);

        await _db.SaveChangesAsync();

        return conversation;
    }

    public async Task<List<ConversationDto>> GetAllAsync(Guid currentUserId)
    {
        var conversations = await _db.Conversations
            .Include(c => c.Participants)
                .ThenInclude(cp => cp.User)
            .Include(c => c.Messages)
            .ToListAsync();

        var result = conversations

            // only conversations of current user
            .Where(c =>
                c.Participants.Any(
                    p => p.UserId == currentUserId))

            .Select(c =>
            {
                var otherUser =
                    c.Participants.First(
                        p => p.UserId != currentUserId).User;

                var lastMessage =
                    c.Messages
                        .OrderByDescending(m => m.SentAt)
                        .FirstOrDefault();

                return new ConversationDto
                {
                    Id = c.Id,

                    OtherUserId = otherUser.Id,

                    OtherUserName = otherUser.UserName ?? "",

                    OtherUserEmail = otherUser.Email ?? "",

                    LastMessage = lastMessage?.Text ?? "",

                    LastMessageTime = lastMessage?.SentAt
                };
            })

            .OrderByDescending(c =>
                c.LastMessageTime ?? DateTime.MinValue)

            .ToList();

        return result;
    }

    public async Task<Conversation?> GetByIdAsync(Guid id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<bool> IsParticipantAsync(
        Guid conversationId,
        Guid userId)
    {
        return await _repository.IsParticipantAsync(
            conversationId,
            userId);
    }
}