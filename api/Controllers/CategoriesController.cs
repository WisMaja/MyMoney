using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;
using api.DTO;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public CategoriesController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> Get() =>
            Ok(await _db.Categories.Include(c => c.Transactions).ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id) =>
            await _db.Categories.Include(c => c.Transactions).FirstOrDefaultAsync(c => c.CategoryId == id) is { } cat
                ? Ok(cat) : NotFound();

        [HttpPost]
        public async Task<IActionResult> Create(CreateCategoryDto dto)
        {
            var cat = new Category
            {
                CategoryId = Guid.NewGuid(),
                Name = dto.Name,
                CreatedAt = DateTime.UtcNow
            };
            _db.Categories.Add(cat);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = cat.CategoryId }, cat);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdateCategoryDto dto)
        {
            var cat = await _db.Categories.FindAsync(id);
            if (cat is null) return NotFound();

            cat.Name = dto.Name;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var cat = await _db.Categories.FindAsync(id);
            if (cat is null) return NotFound();
            _db.Categories.Remove(cat);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
