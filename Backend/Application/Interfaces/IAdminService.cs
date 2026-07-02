using Application.DTOs.Admin;

namespace Application.Interfaces;

public interface IAdminService
{
    Task<DashboardDto> GetDashboardAsync();

    Task<UserInfoDto?> GetUserInfoAsync(Guid userId);
    Task<List<UserInfoDto>> GetAllUsersAsync();
    Task BlockUserAsync(Guid id);

    Task UnblockUserAsync(Guid id);

    Task DeleteUserAsync(Guid id);
}