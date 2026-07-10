using CHATAPP.APPLICATION.DTOs.Conversations;
using CHATAPP.APPLICATION.DTOs.Message;
using CHATAPP.APPLICATION.Interfaces;
using CHATAPP.DOMAIN.Entities;
using CHATAPP.INFRASTRUCTURE.Data;
using Microsoft.EntityFrameworkCore;

namespace CHATAPP.INFRASTRUCTURE.Repositories;

public class ConversationRepository : IConversationRepository
{
    private readonly ChatDbContext _db;

    public ConversationRepository(ChatDbContext db)
    {
        _db = db;
    }

    public async Task<Conversation> AddAsync(Conversation conversation)
    {
        await _db.Conversations.AddAsync(conversation);
        return conversation;
    }

    public async Task<ConversationDetailsDto?> GetByIdAsync(Guid id)
    {
        var conversation =await _db.Conversations
            .Where(c => c.Id == id)
            .Select(c => new ConversationDetailsDto
            {
                Id = c.Id,
                CreatedAt = c.CreatedAt,
                IsReadOnly = c.IsReadOnly,
                IsAdminConversation = c.IsAdminConversation,

                Participants = c.Participants
                    .Select(p => new ParticipantDto
                    {
                        Id = p.User.Id,
                        UserName = p.User.UserName,
                        Email = p.User.Email
                    })
                    .ToList(),

                Messages = c.Messages
                    .Select(m => new MessageDto
                    {
                        Id = m.Id,
                        ConversationId = m.ConversationId,
                        SenderId = m.SenderId,
                        Text = m.Text,
                        CreatedAt = m.CreatedAt,
                        IsSeen = m.IsSeen,
                        SeenAt = m.SeenAt
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();
        return conversation;
    }

    public async Task<List<Conversation>> GetAllAsync()
    {
        var conversation= await _db.Conversations
            .Include(c => c.Participants)
                .ThenInclude(cp => cp.User)
            .Include(c => c.Messages)
            .OrderByDescending(c =>
                c.Messages.Any()
                    ? c.Messages.Max(m => m.SentAt)
                    : c.CreatedAt)
            .ToListAsync();
        return conversation;
    }

    public async Task<bool> IsParticipantAsync(Guid conversationId, Guid userId)
    {
        var isparticipant= await _db.ConversationParticipants
            .AnyAsync(cp =>
                cp.ConversationId == conversationId &&
                cp.UserId == userId);

        return isparticipant;
    }

    public async Task<Conversation?> GetBetweenUsersAsync(Guid user1Id, Guid user2Id)
    {
       var getbetween=  await _db.Conversations
            .Include(c => c.Participants)
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c =>
                c.Participants.Count == 2 &&
                c.Participants.Any(p => p.UserId == user1Id) &&
                c.Participants.Any(p => p.UserId == user2Id));
        return getbetween;
    }

    public async Task<List<Guid>> GetParticipantIdsAsync(Guid conversationId)
    {
       var getid= await _db.ConversationParticipants
            .Where(cp => cp.ConversationId == conversationId)
            .Select(cp => cp.UserId)
            .ToListAsync();

        return getid;
    }

    public async Task<List<Guid>> GetConversationIdsForUserAsync(Guid userId)
    {
        var getconvoid =
         await _db.ConversationParticipants
            .Where(cp => cp.UserId == userId)
            .Select(cp => cp.ConversationId)
            .ToListAsync();
        return getconvoid;
    }
}