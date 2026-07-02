namespace Application.DTOs.Conversations;

public class ConversationDto
{
    public Guid Id { get; set; }

    public Guid OtherUserId { get; set; }

    public string OtherUserName { get; set; } = string.Empty;

    public string OtherUserEmail { get; set; } = string.Empty;

    public string LastMessage { get; set; } = string.Empty;

    public DateTime? LastMessageTime { get; set; }

    public bool IsReadOnly { get; set; }

    public bool IsAdminConversation { get; set; }
}