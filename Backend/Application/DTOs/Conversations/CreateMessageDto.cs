namespace Application.DTOs.Message;

public class CreateMessageDto
{
    public Guid ConversationId { get; set; }

    public string Content { get; set; } = string.Empty;
}