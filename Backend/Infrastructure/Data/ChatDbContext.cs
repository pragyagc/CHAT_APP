using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class ChatDbContext
    : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public ChatDbContext(
        DbContextOptions<ChatDbContext> options)
        : base(options)
    {
    }

    public DbSet<Conversation> Conversations { get; set; }

    public DbSet<ConversationParticipant> ConversationParticipants { get; set; }

    public DbSet<Message> Messages { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany(u => u.SentMessages)
            .HasForeignKey(m => m.SenderId);

        builder.Entity<ConversationParticipant>()
            .HasOne(cp => cp.User)
            .WithMany(u => u.Conversations)
            .HasForeignKey(cp => cp.UserId);

        builder.Entity<ConversationParticipant>()
        .HasOne(cp => cp.Conversation)
        .WithMany(c => c.Participants)
        .HasForeignKey(cp => cp.ConversationId);
    }
}