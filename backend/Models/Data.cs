using System.ComponentModel.DataAnnotations;

namespace Backend_UserManage.Models
{
    public class Data
    {
        public bool Result { get; set; }
        
        [Required]
        public string Message { get; set; } = null!;
    }
}