namespace Domain.Entities;

public class Conversation
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public ICollection<Message> Messages { get; set; }
        = new List<Message>();

    public ICollection<ConversationParticipant> Participants { get; set; }
        = new List<ConversationParticipant>();
}