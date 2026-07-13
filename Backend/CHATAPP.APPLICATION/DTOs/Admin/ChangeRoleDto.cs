using System;
using System.Collections.Generic;
using System.Text;

namespace CHATAPP.APPLICATION.DTOs.Admin
{
    public class ChangeRoleDto
    {
        public string Role { get; set; } = "";
        public Guid UserId { get; set; }
    }
}
