using System.Security.Claims;
using CHATAPP.APPLICATION.Interfaces;

namespace CHATAPP.WEBAPI.Endpoints;

public static class ConversationEndpoints
{
    public static void Register(WebApplication app)
    {
        var conversations = app.MapGroup("/conversations")
            .RequireAuthorization();

        // GET /conversations
        conversations.MapGet("/",
        async (
            ClaimsPrincipal user,
            IConversationService service) =>
        {
            var id = Guid.Parse(
                user.FindFirstValue(ClaimTypes.NameIdentifier)!);

            return Results.Ok(
                await service.GetAllAsync(id));
        });

        // POST /conversations/{otherUserId}
        conversations.MapPost("/{otherUserId:guid}",
        async (
            Guid otherUserId,
            ClaimsPrincipal user,
            IConversationService service) =>
        {
            var id = Guid.Parse(
                user.FindFirstValue(ClaimTypes.NameIdentifier)!);

            try
            {
                var conversation = await service.CreateAsync(id, otherUserId);
                return Results.Ok(conversation);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Problem(
            detail: ex.Message,
            statusCode: StatusCodes.Status403Forbidden);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(ex.Message);
            }
        });
    }
}