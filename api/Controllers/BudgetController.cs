using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BudgetsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public BudgetsController(AppDbContext db)
        {
            _db = db;
        }

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

            if (budget == null) return NotFound();

            return Ok(budget);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Budget budget)
        {
            budget.BudgetId = Guid.NewGuid();
            budget.CreatedAt = DateTime.UtcNow;
            budget.UpdatedAt = DateTime.UtcNow;

            _db.Budgets.Add(budget);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = budget.BudgetId }, budget);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, Budget input)
        {
            var budget = await _db.Budgets.FindAsync(id);
            if (budget == null) return NotFound();

            budget.Name = input.Name;
            budget.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var budget = await _db.Budgets.FindAsync(id);
            if (budget == null) return NotFound();

            _db.Budgets.Remove(budget);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
