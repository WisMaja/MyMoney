using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;
using api.DTO;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BudgetsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public BudgetsController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var budgets = await _db.Budgets
                .Include(b => b.Creator)
                .Include(b => b.Members)
                .Include(b => b.Invitations)
                .ToListAsync();

            return Ok(budgets);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var budget = await _db.Budgets
                .Include(b => b.Creator)
                .Include(b => b.Members)
                .Include(b => b.Invitations)
                .FirstOrDefaultAsync(b => b.BudgetId == id);

            return budget is not null ? Ok(budget) : NotFound();
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateBudgetDto dto)
        {
            var budget = new Budget
            {
                BudgetId = Guid.NewGuid(),
                Name = dto.Name,
                CreatorId = dto.CreatorId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Budgets.Add(budget);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = budget.BudgetId }, budget);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdateBudgetDto dto)
        {
            var budget = await _db.Budgets.FindAsync(id);
            if (budget is null) return NotFound();

            budget.Name = dto.Name;
            budget.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var budget = await _db.Budgets.FindAsync(id);
            if (budget is null) return NotFound();

            _db.Budgets.Remove(budget);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
