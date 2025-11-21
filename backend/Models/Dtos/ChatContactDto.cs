using System;

namespace Backend_UserManage.Models.Dtos
{
    public class ChatContactDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string AvatarUrl { get; set; }
        public string LastMessage { get; set; }
        public DateTime LastActive { get; set; }
        public int UnreadCount { get; set; }
    }
}