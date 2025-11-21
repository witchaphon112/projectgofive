using System;

namespace Backend_UserManage.Models.Dtos
{
    public class GetObjectiveDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Owner { get; set; }
        public string Status { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime DueDate { get; set; }
    }
}