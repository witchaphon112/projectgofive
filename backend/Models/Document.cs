using System;
using System.ComponentModel.DataAnnotations;

namespace Backend_UserManage.Models
{
    public class Document
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        
        public string Type { get; set; } = "doc";
    }
}