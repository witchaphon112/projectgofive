using Microsoft.AspNetCore.Http;

namespace Backend_UserManage.Models.Dtos
{
    public class GetPhotoDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Url { get; set; }
        public DateTime UploadDate { get; set; }
    }
}