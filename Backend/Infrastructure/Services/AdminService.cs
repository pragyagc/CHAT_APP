using Application.DTOs.Admin;
using Application.Interfaces;

namespace Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly IAdminRepository _adminRepository;

    public AdminService(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    public async Task<DashboardDto> GetDashboardAsync()
    {
        return await _adminRepository.GetDashboardAsync();
    }

    public async Task<UserInfoDto?> GetUserInfoAsync(Guid userId)
    {
        return await _adminRepository.GetUserInfoAsync(userId);
    }

    public async Task<List<UserInfoDto>> GetAllUsersAsync()
    {
        return await _adminRepository.GetAllUsersAsync();
    }

    public async Task BlockUserAsync(Guid userId)
    {
        await _adminRepository.BlockUserAsync(userId);
    }

    public async Task UnblockUserAsync(Guid userId)
    {
        await _adminRepository.UnblockUserAsync(userId);
    }

    public async Task DeleteUserAsync(Guid userId)
    {
        await _adminRepository.DeleteUserAsync(userId);
    }
}