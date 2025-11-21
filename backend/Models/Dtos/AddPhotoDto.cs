using Microsoft.AspNetCore.Http;

namespace Backend_UserManage.Models.Dtos
{
    public class AddPhotoDto
    {
        public string Title { get; set; } = string.Empty;
        public IFormFile File { get; set; } = null!;
    }
}