using System;

namespace Backend_UserManage.Models.Dtos
{
    // 1. DTO สำหรับส่งข้อมูลออกหน้าบ้าน (GET)
    public class GetDocumentDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime CreatedDate { get; set; }
        public string Type { get; set; }
    }
}