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
    public class ObjectivesController : ControllerBase
    {
        private readonly AppDbcontext _context;
        private readonly IMapper _mapper;

        public ObjectivesController(AppDbcontext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GetObjectiveDto>>> GetObjectives()
        {
            var objectives = await _context.Objectives.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<GetObjectiveDto>>(objectives));
        }

        [HttpPost]
        public async Task<ActionResult<GetObjectiveDto>> CreateObjective(AddObjectiveDto addDto)
        {
            var objective = _mapper.Map<Objective>(addDto);
            _context.Objectives.Add(objective);
            await _context.SaveChangesAsync();

            return Ok(_mapper.Map<GetObjectiveDto>(objective));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateObjective(int id, AddObjectiveDto updateDto)
        {
            var existingObj = await _context.Objectives.FindAsync(id);
            if (existingObj == null) return NotFound("Objective not found");

            _mapper.Map(updateDto, existingObj);

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteObjective(int id)
        {
            var obj = await _context.Objectives.FindAsync(id);
            if (obj == null) return NotFound();

            _context.Objectives.Remove(obj);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Deleted successfully" });
        }
    }
}