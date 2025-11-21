using System;
using System.ComponentModel.DataAnnotations;

namespace Backend_UserManage.Models
{
    public class Photo
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Url { get; set; } = string.Empty;
        
        public DateTime UploadDate { get; set; } = DateTime.Now;
    }
}