using System.ComponentModel.DataAnnotations;

namespace Backend_UserManage.Models
{
    public class Role
    {
        [Key]
        [Required]
        public string RoleId { get; set; } = null!;
        
        [Required]
        public string RoleName { get; set; } = null!;
    }
}