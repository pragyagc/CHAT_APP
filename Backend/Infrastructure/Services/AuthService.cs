using Application.DTOs.Auth;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Authentication;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly JwtTokenGenerator _jwtTokenGenerator;

    public AuthService(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        JwtTokenGenerator jwtTokenGenerator)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task RegisterAsync(RegisterRequest request)
    {
        var user = new User
        {
            UserName = request.UserName,
            Email = request.Email
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            throw new Exception(string.Join(", ",
                result.Errors.Select(x => x.Description)));
        }

        await _userManager.AddToRoleAsync(user, "User");
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null)
            return null;

        var result = await _signInManager.CheckPasswordSignInAsync(
            user,
            request.Password,
            false);

        if (!result.Succeeded)
            return null;

        // Prevent admins from using the user login
        if (await _userManager.IsInRoleAsync(user, "Admin"))
        {
            throw new UnauthorizedAccessException(
                "Please log in through the admin portal.");
        }

        var token = _jwtTokenGenerator.Generate(user,"User");

        return new LoginResponse
        {
            Token = token
        };
    }

    public async Task<LoginResponse?> AdminLoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null)
            return null;

        var result = await _signInManager.CheckPasswordSignInAsync(
            user,
            request.Password,
            false);

        if (!result.Succeeded)
            return null;

        // Check if the user is an Admin
        if (!await _userManager.IsInRoleAsync(user, "Admin"))
            return null;

        var token = _jwtTokenGenerator.Generate(user,"Admin");

        return new LoginResponse
        {
            Token = token
        };
    }
}