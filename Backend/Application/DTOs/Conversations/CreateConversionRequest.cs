namespace Application.DTOs.Conversations;

public class CreateConversationRequest
{
    public Guid User1Id { get; set; }

    public Guid User2Id { get; set; }
}