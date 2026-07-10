using System.Security.Claims;
using CHATAPP.APPLICATION.DTOs.Messages;
using CHATAPP.APPLICATION.Interfaces;

namespace CHATAPP.WEBAPI.Endpoints;

public static class MessageEndpoints
{
    public static void Register(WebApplication app)
    {
        var messages = app.MapGroup("/messages")
            .RequireAuthorization();

        messages.MapPost("/",
        async (
            CreateMessageDto dto,
            ClaimsPrincipal user,
            IMessageService service) =>
        {
            var id = Guid.Parse(
                user.FindFirstValue(ClaimTypes.NameIdentifier)!);

            return Results.Ok(
                await service.SendAsync(
                    id,
                    dto.ConversationId,
                    dto.Content));
        });

        messages.MapGet("/conversation/{conversationId:guid}",
        async (
            Guid conversationId,
            IMessageService service) =>
        {
            return Results.Ok(
                await service.GetConversationMessagesAsync(
                    conversationId));
        });
    }
}