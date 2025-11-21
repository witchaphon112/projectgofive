using System.ComponentModel.DataAnnotations;

namespace Backend_UserManage.Models
{
    public class Status
    {
        [Key]
        [Required]
        public string Code { get; set; } = null!;
        
        [Required]
        public string Description { get; set; } = null!;
    }
}