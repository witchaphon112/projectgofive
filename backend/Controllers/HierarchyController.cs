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
    public class HierarchyController : ControllerBase
    {
        private readonly AppDbcontext _context;
        private readonly IMapper _mapper;

        public HierarchyController(AppDbcontext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<GetEmployeeNodeDto>> GetHierarchyTree()
        {
            var allUsers = await _context.Users
                                         .Include(u => u.Role)
                                         .ToListAsync();

            if (!allUsers.Any()) return NoContent();

            var allNodes = _mapper.Map<List<GetEmployeeNodeDto>>(allUsers);

            var rootNode = BuildTree(allNodes);

            return Ok(rootNode);
        }

        private GetEmployeeNodeDto BuildTree(List<GetEmployeeNodeDto> nodes)
        {
            var lookup = nodes.ToDictionary(x => x.Id);
            var rootNodes = new List<GetEmployeeNodeDto>();

            foreach (var node in nodes)
            {
                if (!string.IsNullOrEmpty(node.ManagerId) && lookup.TryGetValue(node.ManagerId, out var manager))
                {
                    manager.Reports.Add(node);
                }

                else
                {
                    rootNodes.Add(node);
                }
            }

            if (rootNodes.Count == 1)
            {
                return rootNodes[0];
            }
            else
            {
                return new GetEmployeeNodeDto
                {
                    Id = "root-virtual",
                    Name = "Organization Chart",
                    Title = "Company Overview",
                    Reports = rootNodes
                };
            }
        }

        [HttpPost("seed")]
        public async Task<IActionResult> SeedData()
        {
            if (await _context.Users.AnyAsync()) return BadRequest("Users already exist. Clear DB first.");

            var ceo = new User { Id = Guid.NewGuid().ToString(), FirstName = "Somchai", LastName = "CEO", RoleId = "1", Status = "Active", Username = "ceo" };
            _context.Users.Add(ceo);

            var manager = new User { Id = Guid.NewGuid().ToString(), FirstName = "Mana", LastName = "Manager", RoleId = "2", ManagerId = ceo.Id, Status = "Active", Username = "mana" };
            _context.Users.Add(manager);

            var staff = new User { Id = Guid.NewGuid().ToString(), FirstName = "Manee", LastName = "Staff", RoleId = "2", ManagerId = manager.Id, Status = "Active", Username = "manee" };
            _context.Users.Add(staff);

            var staff2 = new User { Id = Guid.NewGuid().ToString(), FirstName = "Piti", LastName = "Staff", RoleId = "2", ManagerId = manager.Id, Status = "Active", Username = "piti" };
            _context.Users.Add(staff2);

            await _context.SaveChangesAsync();
            return Ok(new { message = "Seeded Hierarchy Data!" });
        }
    }
}