namespace Domain.Entities;

public class ConversationParticipant
{
    public Guid Id { get; set; }

    public Guid ConversationId { get; set; }

    public Guid UserId { get; set; }

    public DateTime JoinedAt { get; set; }

    // Navigation Properties
    public Conversation Conversation { get; set; } = null!;

    public User User { get; set; } = null!;
}