using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using api.Database;
using api.Models;
using api.Dtos.Category;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        private Guid GetUserIdFromToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId)
                ? userId
                : throw new UnauthorizedAccessException("Invalid user ID in token.");
        }

        // POST: api/categories
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            var userId = GetUserIdFromToken();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return Unauthorized();

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                UserId = userId,
                User = user,
                Transactions = new List<Transaction>()
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, new
            {
                category.Id,
                category.Name,
                category.UserId
            });
        }

        // GET: api/categories/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(Guid id)
        {
            var userId = GetUserIdFromToken();

            var category = await _context.Categories
                .FirstOrDefaultAsync(c =>
                    c.Id == id &&
                    (c.UserId == null || c.UserId == userId)); // globalna lub prywatna użytkownika

            if (category == null)
                return NotFound();

            return Ok(new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                IsGlobal = category.UserId == null
            });
        }

        // GET: api/categories
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = GetUserIdFromToken();

            var categories = await _context.Categories
                .Where(c => c.UserId == null || c.UserId == userId)
                .ToListAsync();

            var result = categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                IsGlobal = c.UserId == null
            });


            return Ok(result);
        }

        // DELETE: api/categories/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            var userId = GetUserIdFromToken();

            // Znalezienie kategorii do usunięcia
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                return NotFound("Category not found.");

            // Sprawdzenie, czy kategoria jest globalna
            if (category.UserId == null)
                return Forbid("Global categories cannot be deleted.");

            // Sprawdzenie, czy kategoria należy do aktualnego użytkownika
            if (category.UserId != userId)
                return Forbid("You are not allowed to delete this category.");

            // Usunięcie kategorii
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent(); // Kod 204 - brak zawartości
        }
        
        // PUT: api/categories/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateCategoryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserIdFromToken();

            // Znajdź kategorię
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                return NotFound("Category not found.");

            // Sprawdź, czy kategoria jest globalna
            if (category.UserId == null)
                return Forbid("Global categories cannot be updated.");

            // Sprawdź, czy kategoria należy do użytkownika
            if (category.UserId != userId)
                return Forbid("You are not allowed to edit this category.");

            // Zaktualizuj kategorię
            category.Name = dto.Name;

            _context.Categories.Update(category);
            await _context.SaveChangesAsync();

            return Ok(new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                IsGlobal = false
            });
        }
    }
}