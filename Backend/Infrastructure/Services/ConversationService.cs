using Application.DTOs.Conversations;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class ConversationService : IConversationService
{
    private readonly IConversationRepository _repository;
    private readonly ChatDbContext _db;
    private readonly UserManager<User> _userManager;

    public ConversationService(
        IConversationRepository repository,
        ChatDbContext db,
        UserManager<User> userManager)
    {
        _repository = repository;
        _db = db;
        _userManager = userManager;
    }

    public async Task<Conversation> CreateAsync(
        Guid currentUserId,
        Guid otherUserId)
    {
        if (currentUserId == otherUserId)
            throw new InvalidOperationException(
                "You cannot create a conversation with yourself.");

        var existing = await _repository.GetBetweenUsersAsync(
            currentUserId,
            otherUserId);

        if (existing != null)
            return existing;

        var currentUser =
            await _userManager.FindByIdAsync(currentUserId.ToString());

        var otherUser =
            await _userManager.FindByIdAsync(otherUserId.ToString());

        if (currentUser == null)
            throw new Exception("Current user not found.");

        if (otherUser == null)
            throw new Exception("Target user not found.");

        if (currentUser.IsDeleted || otherUser.IsDeleted)
            throw new InvalidOperationException(
                "Conversation cannot be created because one of the users has been deleted.");

        if (currentUser.IsBlocked || otherUser.IsBlocked)
            throw new InvalidOperationException(
                "Conversation cannot be created because one of the users is blocked.");

        var currentIsAdmin =
            await _userManager.IsInRoleAsync(currentUser, "Admin");

        var otherIsAdmin =
            await _userManager.IsInRoleAsync(otherUser, "Admin");

        // User -> Admin ❌
        if (!currentIsAdmin && otherIsAdmin)
            throw new UnauthorizedAccessException(
                "Users cannot start conversations with administrators.");

        // Admin -> Admin ❌
        if (currentIsAdmin && otherIsAdmin)
            throw new UnauthorizedAccessException(
                "Administrators cannot chat with each other.");

        var conversation = new Conversation
        {
            Id = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,

            // Admin conversations are read-only
            IsReadOnly = currentIsAdmin,

            // Mark admin conversations
            IsAdminConversation = currentIsAdmin
        };

        conversation.Participants.Add(new ConversationParticipant
        {
            ConversationId = conversation.Id,
            UserId = currentUserId,
            JoinedAt = DateTime.UtcNow
        });

        conversation.Participants.Add(new ConversationParticipant
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

        var result = new List<ConversationDto>();

        foreach (var conversation in conversations)
        {
            if (!conversation.Participants.Any(p => p.UserId == currentUserId))
                continue;

            var otherUser = conversation.Participants
                .First(p => p.UserId != currentUserId)
                .User;

            var lastMessage = conversation.Messages
                .OrderByDescending(m => m.SentAt)
                .FirstOrDefault();

            result.Add(new ConversationDto
            {
                Id = conversation.Id,

                OtherUserId = otherUser.Id,

                OtherUserName = otherUser.UserName ?? "",

                OtherUserEmail = otherUser.Email ?? "",

                LastMessage = lastMessage?.Text ?? "",

                LastMessageTime = lastMessage?.SentAt,

                IsReadOnly = conversation.IsReadOnly,

                IsAdminConversation = conversation.IsAdminConversation
            });
        }

        return result
            .OrderByDescending(c => c.LastMessageTime ?? DateTime.MinValue)
            .ToList();
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