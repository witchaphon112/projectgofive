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
    public class DocumentsController : ControllerBase
    {
        private readonly AppDbcontext _context;
        private readonly IMapper _mapper;

        public DocumentsController(AppDbcontext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GetDocumentDto>>> GetDocuments()
        {
            var documents = await _context.Documents.OrderByDescending(d => d.CreatedDate).ToListAsync();
            return Ok(_mapper.Map<IEnumerable<GetDocumentDto>>(documents));
        }

        [HttpPost]
        public async Task<ActionResult<GetDocumentDto>> CreateDocument(AddDocumentDto docDto)
        {
            var document = _mapper.Map<Document>(docDto);

            document.CreatedDate = DateTime.Now;

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            return Ok(_mapper.Map<GetDocumentDto>(document));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return NotFound();

            _context.Documents.Remove(doc);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Deleted successfully" });
        }
    }
}