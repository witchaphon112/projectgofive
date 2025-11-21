using System;

namespace Backend_UserManage.Models.Dtos
{
    public class SendMessageDto
    {
        public string ReceiverId { get; set; } = null!;
        public string Content { get; set; } = null!;
    }


}