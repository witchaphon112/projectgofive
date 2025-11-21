using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_UserManage.Data;
using Backend_UserManage.Models;
using Backend_UserManage.Models.Dtos;
using Backend_UserManage.Services;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend_UserManage.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbcontext _context;
        private readonly IMapper _mapper;
        private readonly ITokenService _tokenService;

        public UsersController(AppDbcontext context, IMapper mapper, ITokenService tokenService)
        {
            _context = context;
            _mapper = mapper;
            _tokenService = tokenService;
        }
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult> Login([FromBody] LoginDto loginDto)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.Permissions)
                    .ThenInclude(up => up.Permission)
                .FirstOrDefaultAsync(u => u.Username == loginDto.Username);

            if (user == null)
                return Unauthorized(new { message = "Invalid username" });

            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid password" });

            var token = _tokenService.CreateToken(user);

            var permissionsDto = user.Permissions?
                .Select(up => new PermissionDto
                {
                    PermissionId = up.PermissionId,
                    PermissionName = up.Permission?.PermissionName ?? string.Empty,
                    IsReadable = up.IsReadable,
                    IsWritable = up.IsWritable,
                    IsDeletable = up.IsDeletable
                })
                .ToList() ?? new List<PermissionDto>();

            return Ok(new
            {
                Token = token,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserId = user.Id,
                RoleId = user.RoleId,
                RoleName = user.Role?.RoleName,
                Permissions = permissionsDto
            });
        }
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetUsersForDashboard()
        {
            var usersFromDb = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.Permissions)
                    .ThenInclude(up => up.Permission)
                .ToListAsync();

            var usersForDashboard = _mapper.Map<List<UserDashBoardDto>>(usersFromDb);
            return Ok(usersForDashboard);
        }

        [HttpPost("DataTable")]
        public async Task<IActionResult> GetUsersDataTable([FromBody] DataTableRequestDto request)
        {
            var pageNumber = request.PageNumber ?? 0;
            var pageSize = request.PageSize ?? 10;
            var orderBy = request.OrderBy ?? "CreateDate";
            var orderDirection = request.OrderDirection ?? "desc";
            var search = request.Search?.Trim() ?? string.Empty;

            var query = _context.Users
                .Include(u => u.Role)
                .Include(u => u.Permissions)
                    .ThenInclude(up => up.Permission)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u =>
                    u.FirstName.Contains(search) ||
                    u.LastName.Contains(search) ||
                    u.Email.Contains(search) ||
                    u.Username.Contains(search) ||
                    (u.Role != null && u.Role.RoleName.Contains(search))
                );
            }

            var totalCount = await query.CountAsync();

            switch (orderBy.ToLower())
            {
                case "firstname":
                    query = orderDirection.ToLower() == "asc"
                        ? query.OrderBy(u => u.FirstName)
                        : query.OrderByDescending(u => u.FirstName);
                    break;
                case "lastname":
                    query = orderDirection.ToLower() == "asc"
                        ? query.OrderBy(u => u.LastName)
                        : query.OrderByDescending(u => u.LastName);
                    break;
                case "email":
                    query = orderDirection.ToLower() == "asc"
                        ? query.OrderBy(u => u.Email)
                        : query.OrderByDescending(u => u.Email);
                    break;
                case "rolename":
                    query = orderDirection.ToLower() == "asc"
                        ? query.OrderBy(u => u.Role != null ? u.Role.RoleName : string.Empty)
                        : query.OrderByDescending(u => u.Role != null ? u.Role.RoleName : string.Empty);
                    break;
                case "status":
                    query = orderDirection.ToLower() == "asc"
                        ? query.OrderBy(u => u.Status)
                        : query.OrderByDescending(u => u.Status);
                    break;
                case "createdate":
                default:
                    query = orderDirection.ToLower() == "asc"
                        ? query.OrderBy(u => u.CreateDate)
                        : query.OrderByDescending(u => u.CreateDate);
                    break;
            }

            var users = await query
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var usersDto = _mapper.Map<List<UserDashBoardDto>>(users);

            var response = new DataTableResponseDto
            {
                DataSource = usersDto,
                Page = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };

            return Ok(response);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> CreateUser([FromBody] RegisterUserDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
                return BadRequest(new { message = "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว" });

            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                return BadRequest(new { message = "อีเมลนี้ถูกใช้งานแล้ว" });

            var roleExists = await _context.Roles.AnyAsync(r => r.RoleId == registerDto.RoleId);
            if (!roleExists)
                return BadRequest(new { message = "รหัสบทบาท (Role ID) ไม่ถูกต้อง" });

            var newUser = _mapper.Map<User>(registerDto);
            newUser.Id = Guid.NewGuid().ToString();
            newUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
            newUser.CreateDate = DateTime.Now;
            newUser.UpdateDate = DateTime.Now;
            newUser.Status = "Active";

            _context.Users.Add(newUser);

            if (registerDto.Permissions != null && registerDto.Permissions.Any())
            {
                foreach (var p in registerDto.Permissions)
                {
                    var userPermission = new UserPermission
                    {
                        UserId = newUser.Id,
                        PermissionId = p.PermissionId,
                        IsReadable = p.IsReadable,
                        IsWritable = p.IsWritable,
                        IsDeletable = p.IsDeletable
                    };
                    await _context.UserPermissions.AddAsync(userPermission);
                }
            }

            await _context.SaveChangesAsync();

            var userToReturn = _mapper.Map<GetUserDto>(newUser);
            return CreatedAtAction(nameof(GetUserById), new { id = newUser.Id }, userToReturn);
        }


        [HttpGet]
        public async Task<IActionResult> GetUserAll()
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.Permissions)
                    .ThenInclude(up => up.Permission)
                .ToListAsync();

            var getUserDto = _mapper.Map<List<GetUserDto>>(users);
            return Ok(getUserDto);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.Permissions)
                    .ThenInclude(up => up.Permission)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound(new { message = "ไม่พบผู้ใช้งาน" });

            var getUserDto = _mapper.Map<GetUserDto>(user);

            var apiResponse = new ApiResponse<GetUserDto>
            {
                Status = new Status { Code = "200", Description = "Success" },
                Data = getUserDto
            };

            return Ok(apiResponse);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto updateDto)
        {
            var user = await _context.Users
                .Include(u => u.Permissions)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound(new { message = "ไม่พบผู้ใช้งานในระบบ" });

            if (user.Username != updateDto.Username &&
                await _context.Users.AnyAsync(u => u.Username == updateDto.Username))
            {
                return BadRequest(new { message = "Username นี้มีผู้ใช้งานแล้ว กรุณาใช้ชื่ออื่น" });
            }

            if (user.Email != updateDto.Email &&
                await _context.Users.AnyAsync(u => u.Email == updateDto.Email))
            {
                return BadRequest(new { message = "Email นี้มีผู้ใช้งานแล้ว กรุณาใช้อีเมลอื่น" });
            }

            if (user.RoleId != updateDto.RoleId)
            {
                var roleExists = await _context.Roles.AnyAsync(r => r.RoleId == updateDto.RoleId);
                if (!roleExists)
                    return BadRequest(new { message = "รหัสบทบาท (Role ID) ไม่ถูกต้อง" });
            }

            user.FirstName = updateDto.FirstName;
            user.LastName = updateDto.LastName;
            user.Email = updateDto.Email;
            user.Phone = updateDto.Phone;
            user.RoleId = updateDto.RoleId;
            user.Username = updateDto.Username;
            user.Status = updateDto.Status;
            user.UpdateDate = DateTime.Now;

            if (!string.IsNullOrWhiteSpace(updateDto.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updateDto.Password);
            }

            if (updateDto.Permissions != null)
            {
                if (user.Permissions.Any())
                {
                    _context.UserPermissions.RemoveRange(user.Permissions);
                }

                foreach (var p in updateDto.Permissions)
                {
                    var userPermission = new UserPermission
                    {
                        UserId = user.Id,
                        PermissionId = p.PermissionId,
                        IsReadable = p.IsReadable,
                        IsWritable = p.IsWritable,
                        IsDeletable = p.IsDeletable
                    };
                    await _context.UserPermissions.AddAsync(userPermission);
                }
            }

            try
            {
                await _context.SaveChangesAsync();

                var updatedUser = await _context.Users
                    .Include(u => u.Role)
                    .Include(u => u.Permissions)
                        .ThenInclude(up => up.Permission)
                    .FirstOrDefaultAsync(u => u.Id == id);

                var updatedUserDto = _mapper.Map<GetUserDto>(updatedUser);
                return Ok(new { message = "แก้ไขข้อมูลสำเร็จ", data = updatedUserDto });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "เกิดข้อผิดพลาดในการแก้ไขข้อมูล", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _context.Users
                .Include(u => u.Permissions)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound(new { message = "ไม่พบผู้ใช้งานที่ต้องการลบ" });

            try
            {
                if (user.Permissions.Any())
                {
                    _context.UserPermissions.RemoveRange(user.Permissions);
                }

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "ลบผู้ใช้งานสำเร็จ" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "ไม่สามารถลบข้อมูลได้", error = ex.Message });
            }
        }
    }
}