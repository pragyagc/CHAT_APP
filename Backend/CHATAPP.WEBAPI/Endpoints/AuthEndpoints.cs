using CHATAPP.APPLICATION.DTOs.Auth;
using CHATAPP.APPLICATION.Interfaces;

namespace CHATAPP.WEBAPI.Endpoints;

public static class AuthEndpoints
{
    public static void Register(WebApplication app)
    {
        var auth = app.MapGroup("/auth");

        auth.MapPost("/register",
        async (
            RegisterRequest request,
            IAuthService authService) =>
        {
            await authService.RegisterAsync(request);
            return Results.Ok();
        });

        auth.MapPost("/login",
        async (
            LoginRequest request,
            IAuthService authService) =>
        {
            try
            {
                var result = await authService.LoginAsync(request);

                return result == null
                    ? Results.BadRequest("Invalid credentials")
                    : Results.Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.BadRequest(ex.Message);

            }

            catch (Exception ex)
            {
                return Results.BadRequest(ex.Message);
            }
        });

        auth.MapPost("/admin/login",
async (
    LoginRequest request,
    IAuthService authService) =>
{
    try
    {
        var result = await authService.AdminLoginAsync(request);

        return result == null
            ? Results.BadRequest("Invalid admin credentials")
            : Results.Ok(result);
    }
    catch (UnauthorizedAccessException ex)
    {
        return Results.BadRequest(ex.Message);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ex.Message);
    }
});
    }


}