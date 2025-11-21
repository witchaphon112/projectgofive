using System;
using System.Collections.Generic;

namespace Backend_UserManage.Models.Dtos
{
    public class UserDashBoardDto
    {
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string RoleId { get; set; }
        public string RoleName { get; set; }
        public string Username { get; set; }
        public string Status { get; set; }
        public DateTime CreateDate { get; set; }
        public List<PermissionDto> Permissions { get; set; } = new List<PermissionDto>();
    }  
}