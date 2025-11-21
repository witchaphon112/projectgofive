using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend_UserManage.Models
{
    public class User
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string FirstName { get; set; } = null!;
        
        [Required]
        public string LastName { get; set; } = null!;
        
        [Required]
        public string Email { get; set; } = null!;
        
        [Required]
        public string Phone { get; set; } = null!;
        
        [Required]
        public string RoleId { get; set; } = null!;
        
        [Required]
        public string Username { get; set; } = null!;
        
        public string? PasswordHash { get; set; }
        
        public string Status { get; set; } = "Active";
        public DateTime CreateDate { get; set; } = DateTime.Now;
        public DateTime UpdateDate { get; set; } = DateTime.Now;

        // ✅ เพิ่ม: ManagerId เก็บ ID หัวหน้า
        public string? ManagerId { get; set; }

        [ForeignKey("RoleId")]
        public Role? Role { get; set; }

        // ✅ เพิ่ม: ความสัมพันธ์กับตัวเอง (Self-Referencing)
        [ForeignKey("ManagerId")]
        public User? Manager { get; set; }
        public ICollection<User> Reports { get; set; } = new List<User>();

        public ICollection<UserPermission> Permissions { get; set; } = new List<UserPermission>();
    }
}