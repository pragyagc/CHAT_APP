using System.Security.Claims;
using CHATAPP.APPLICATION.Interfaces;

namespace CHATAPP.WEBAPI.Endpoints;

public static class UserEndpoints
{
    public static void Register(WebApplication app)
    {
        var users = app.MapGroup("/users")
            .RequireAuthorization();

        // GET /users
        users.MapGet("/",
        async (IUserService service) =>
        {
            return Results.Ok(await service.GetAllAsync());
        });

        // GET /users/me
        users.MapGet("/me",
        async (
            ClaimsPrincipal user,
            IUserService service) =>
        {
            var id = Guid.Parse(
                user.FindFirstValue(
                    ClaimTypes.NameIdentifier)!);

            return Results.Ok(
                await service.GetByIdAsync(id));
        });
    }
}