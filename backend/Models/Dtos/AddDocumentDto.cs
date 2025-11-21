using System;

namespace Backend_UserManage.Models.Dtos
{
    public class AddDocumentDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = "doc";
    }
}