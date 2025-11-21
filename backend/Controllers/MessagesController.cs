using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_UserManage.Data;
using Backend_UserManage.Models;
using Backend_UserManage.Models.Dtos;
using AutoMapper;

namespace Backend_UserManage.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly AppDbcontext _context;
        private readonly IMapper _mapper;

        public MessagesController(AppDbcontext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet("contacts/{currentUserId}")]
        public async Task<ActionResult<IEnumerable<ChatContactDto>>> GetContacts(string currentUserId)
        {
            var users = await _context.Users
                .Where(u => u.Id != currentUserId)
                .ToListAsync();

            var contactList = new List<ChatContactDto>();

            foreach (var user in users)
            {
                var lastMsg = await _context.Messages
                    .Where(m => (m.SenderId == currentUserId && m.ReceiverId == user.Id) ||
                                (m.SenderId == user.Id && m.ReceiverId == currentUserId))
                    .OrderByDescending(m => m.Timestamp)
                    .FirstOrDefaultAsync();

                var unread = await _context.Messages
                    .CountAsync(m => m.SenderId == user.Id && m.ReceiverId == currentUserId && !m.IsRead);

                contactList.Add(new ChatContactDto
                {
                    Id = user.Id,
                    Name = $"{user.FirstName} {user.LastName}",
                    AvatarUrl = $"https://ui-avatars.com/api/?name={user.FirstName}+{user.LastName}&background=random",
                    LastMessage = lastMsg?.Content ?? "No messages yet",
                    LastActive = lastMsg?.Timestamp ?? user.UpdateDate,
                    UnreadCount = unread
                });
            }

            return Ok(contactList.OrderByDescending(c => c.LastActive));
        }

        [HttpGet("history/{currentUserId}/{contactId}")]
        public async Task<ActionResult<IEnumerable<GetMessageDto>>> GetHistory(string currentUserId, string contactId)
        {
            var messages = await _context.Messages
                .Where(m => (m.SenderId == currentUserId && m.ReceiverId == contactId) ||
                            (m.SenderId == contactId && m.ReceiverId == currentUserId))
                .OrderBy(m => m.Timestamp)
                .ToListAsync();

            var unreadMsgs = messages.Where(m => m.SenderId == contactId && !m.IsRead).ToList();
            if (unreadMsgs.Any())
            {
                unreadMsgs.ForEach(m => m.IsRead = true);
                await _context.SaveChangesAsync();
            }

            return Ok(_mapper.Map<IEnumerable<GetMessageDto>>(messages));
        }

        [HttpPost("send/{currentUserId}")]
        public async Task<ActionResult<GetMessageDto>> SendMessage(string currentUserId, SendMessageDto sendDto)
        {
            var message = _mapper.Map<Message>(sendDto);
            message.SenderId = currentUserId;
            message.Timestamp = DateTime.Now;
            message.IsRead = false;

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(_mapper.Map<GetMessageDto>(message));
        }
    }
}