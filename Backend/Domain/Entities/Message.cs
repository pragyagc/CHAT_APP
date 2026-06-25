namespace Domain.Entities;

public class Message
{
    public Guid Id { get; set; }

    public Guid ConversationId { get; set; }

    public Guid SenderId { get; set; }

    public string Text { get; set; } = string.Empty;

    public DateTime SentAt { get; set; }

    public bool IsSeen { get; set; }

    public DateTime? SeenAt { get; set; }

    // Navigation Properties
    public Conversation Conversation { get; set; } = null!;

    public User Sender { get; set; } = null!;
}