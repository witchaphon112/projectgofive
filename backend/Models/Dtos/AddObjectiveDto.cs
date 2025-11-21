using System;
namespace Backend_UserManage.Models.Dtos
{
    
    public class AddObjectiveDto
    {
        public string Title { get; set; } = null!;
        public string Owner { get; set; } = null!;
        public string Status { get; set; } = "Pending";
        public DateTime StartDate { get; set; }
        public DateTime DueDate { get; set; }
    }
}