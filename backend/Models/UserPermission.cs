using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_UserManage.Models
{
    public class UserPermission
    {
        [Key, Column(Order = 0)]
        [Required]
        public string UserId { get; set; } = null!;
        
        [Key, Column(Order = 1)]
        [Required]
        public string PermissionId { get; set; } = null!;
        
        public bool IsReadable { get; set; }
        public bool IsWritable { get; set; }
        public bool IsDeletable { get; set; }
        
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
        
        [ForeignKey("PermissionId")]
        public Permission Permission { get; set; } = null!;
    }
}