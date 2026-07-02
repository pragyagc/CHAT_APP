namespace Application.DTOs.Admin;

public class AdminUserDto
{
    public Guid Id { get; set; }

    public string UserName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public bool IsBlocked { get; set; }

    public bool IsDeleted { get; set; }

    public DateTime CreatedAt { get; set; }
}