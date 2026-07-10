using CHATAPP.APPLICATION.DTOs.Admin;

namespace CHATAPP.APPLICATION.Interfaces;

public interface IAdminService
{
    Task<DashboardDto> GetDashboardAsync();

    Task<UserInfoDto?> GetUserInfoAsync(Guid userId);
    Task<List<UserInfoDto>> GetAllUsersAsync();
    Task BlockUserAsync(Guid id);

    Task UnblockUserAsync(Guid id);

    Task DeleteUserAsync(Guid id);
    Task RestoreUserAsync(Guid userId);
    Task CreateUserAsync(CreateUserDto dto);

}