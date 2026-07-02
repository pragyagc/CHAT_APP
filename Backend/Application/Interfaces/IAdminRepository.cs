using Application.DTOs.Admin;

namespace Application.Interfaces;

public interface IAdminRepository
{
    Task<DashboardDto> GetDashboardAsync();

    Task<UserInfoDto?> GetUserInfoAsync(Guid userId);
    Task<List<UserInfoDto>> GetAllUsersAsync();

    Task BlockUserAsync(Guid userId);

    Task UnblockUserAsync(Guid userId);

    Task DeleteUserAsync(Guid userId);
}