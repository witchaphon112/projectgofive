using System.Collections.Generic;

namespace Backend_UserManage.Models.Dtos
{
    public class UpdateUserDto
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string RoleId { get; set; } = null!;
        public string Username { get; set; } = null!;
        public string? Password { get; set; }
        public string Status { get; set; } = "Active";
        public List<PermissionDto> Permissions { get; set; } = new List<PermissionDto>();
    }
}