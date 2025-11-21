using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend_UserManage.Models
{
    public class Permission
    {
        [Key]
        [Required]
        public string PermissionId { get; set; } = null!;
        
        [Required]
        public string PermissionName { get; set; } = null!;
        
        public ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
    }
}