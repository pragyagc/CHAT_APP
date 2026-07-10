using CHATAPP.APPLICATION.DTOs.Admin;

namespace CHATAPP.APPLICATION.Interfaces;

public interface IAdminRepository
{
    Task<DashboardDto> GetDashboardAsync();

    Task<UserInfoDto?> GetUserInfoAsync(Guid userId);
    Task<List<UserInfoDto>> GetAllUsersAsync();
    
    Task BlockUserAsync(Guid userId);

    Task UnblockUserAsync(Guid userId);

    Task DeleteUserAsync(Guid userId);
    Task RestoreUserAsync(Guid userId);

    Task CreateUserAsync(CreateUserDto dto);
}