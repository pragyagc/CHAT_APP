namespace CHATAPP.APPLICATION.DTOs.Conversations;

public class ParticipantDto
{
    public Guid Id { get; set; }

    public string UserName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
}