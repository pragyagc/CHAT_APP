using CHATAPP.APPLICATION.DTOs.Auth;

namespace CHATAPP.APPLICATION.Interfaces;

public interface IAuthService
{
    Task RegisterAsync(RegisterRequest request);

    Task<LoginResponse?> LoginAsync( LoginRequest request);

    Task<LoginResponse?> AdminLoginAsync(LoginRequest request);
}