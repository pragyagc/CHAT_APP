using Microsoft.AspNetCore.Identity;

namespace Domain.Entities;

public class User : IdentityUser<Guid>
{
   

    public DateTime CreatedAt { get; set; }
        = DateTime.UtcNow;

    // Navigation Properties
    public ICollection<Message> SentMessages { get; set; }
        = new List<Message>();

    public ICollection<ConversationParticipant> Conversations { get; set; }
        = new List<ConversationParticipant>();
}