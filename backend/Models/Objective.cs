using System;
using System.ComponentModel.DataAnnotations;

namespace Backend_UserManage.Models
{
    public class Objective
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Owner { get; set; } = string.Empty;
        
        [Required]
        public string Status { get; set; } = "Pending";
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime DueDate { get; set; }
    }
}