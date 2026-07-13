using CHATAPP.APPLICATION.DTOs.Admin;
using CHATAPP.APPLICATION.Interfaces;

namespace CHATAPP.WEBAPI.Endpoints;

public static class AdminEndpoints
{
    public static void Register(WebApplication app)
    {
        var admin = app.MapGroup("/admin")
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

        // Dashboard
        admin.MapGet("/dashboard",
        async (IAdminService service) =>
        {
            return Results.Ok(await service.GetDashboardAsync());
        });

        // Get all users
        admin.MapGet("/users",
        async (IAdminService service) =>
        {
            return Results.Ok(await service.GetAllUsersAsync());
        });

        // Get single user
        admin.MapGet("/users/{id:guid}",
        async (
            Guid id,
            IAdminService service) =>
        {
            var user = await service.GetUserInfoAsync(id);

            return user == null
                ? Results.NotFound()
                : Results.Ok(user);
        });

        // Block user
        admin.MapPut("/users/{id:guid}/block",
        async (
            Guid id,
            IAdminService service) =>
        {
            await service.BlockUserAsync(id);

            return Results.Ok(new
            {
                Message = "User blocked successfully."
            });
        });

        // Unblock user
        admin.MapPut("/users/{id:guid}/unblock",
        async (
            Guid id,
            IAdminService service) =>
        {
            await service.UnblockUserAsync(id);

            return Results.Ok(new
            {
                Message = "User unblocked successfully."
            });
        });

        // Delete user
        admin.MapDelete("/users/{id:guid}",
        async (
            Guid id,
            IAdminService service) =>
        {
            await service.DeleteUserAsync(id);

            return Results.Ok(new
            {
                Message = "User deleted successfully."
            });
        });

        // Restore user
        admin.MapPut("/users/{id:guid}/restore",
        async (
            Guid id,
            IAdminService service) =>
        {
            await service.RestoreUserAsync(id);

            return Results.Ok(new
            {
                Message = "User restored successfully."
            });
        });

        // Create user
        admin.MapPost("/users",
        async (
            CreateUserDto dto,
            IAdminService service) =>
        {
            await service.CreateUserAsync(dto);

            return Results.Ok(new
            {
                Message = "User created successfully."
            });
        });

        admin.MapPut("/users/role",
        async (
            ChangeRoleDto dto,
            IAdminService service) =>
        {
            try
            {
                await service.UpdateUserRoleAsync(dto);

                return Results.Ok(new
                {
                    Message = "User role updated successfully."
                });
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ex.Message);
            }
        });
    }
}