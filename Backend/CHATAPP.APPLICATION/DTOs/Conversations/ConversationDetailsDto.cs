using CHATAPP.APPLICATION.DTOs.Message;

namespace CHATAPP.APPLICATION.DTOs.Conversations;

public class ConversationDetailsDto
{
    public Guid Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool IsReadOnly { get; set; }

    public bool IsAdminConversation { get; set; }

    public List<ParticipantDto> Participants { get; set; } = new();

    public List<MessageDto> Messages { get; set; } = new();
}