using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_UserManage.Models
{
    public class EmployeeNode
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public int? ManagerId { get; set; } 

        [NotMapped]
        public List<EmployeeNode> Reports { get; set; } = new List<EmployeeNode>();
    }
}