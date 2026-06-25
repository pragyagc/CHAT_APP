using Application.DTOs.Auth;

namespace Application.Interfaces;

public interface IAuthService
{
    Task RegisterAsync(RegisterRequest request);

    Task<LoginResponse?> LoginAsync( LoginRequest request);

    
}