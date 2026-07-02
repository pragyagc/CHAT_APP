using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.User
{
    public class UserDto
    {
        public Guid Id { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;
    }
}
