using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.User
{
    public class UserProfileDto
    {
        public Guid Id { get; set; }

        public string UserName { get; set; } = "";

        public string Email { get; set; } = "";
        public string Role { get; set; } = string.Empty;
    }
}
