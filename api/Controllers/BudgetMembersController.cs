using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;
using api.DTO;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BudgetMembersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public BudgetMembersController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> Get() =>
            Ok(await _db.BudgetMembers
                .Include(m => m.Budget)
                .Include(m => m.User)
                .ToListAsync());

        [HttpGet("{budgetId}/{userId}")]
        public async Task<IActionResult> Get(Guid budgetId, Guid userId)
        {
            var member = await _db.BudgetMembers
                .FirstOrDefaultAsync(m => m.BudgetId == budgetId && m.UserId == userId);

            return member is not null ? Ok(member) : NotFound();
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateBudgetMemberDto dto)
        {
            var member = new BudgetMember
            {
                BudgetId = dto.BudgetId,
                UserId = dto.UserId,
                Role = dto.Role,
                JoinedAt = DateTime.UtcNow
            };

            _db.BudgetMembers.Add(member);
            await _db.SaveChangesAsync();
            return Created("", member);
        }

        [HttpPut("{budgetId}/{userId}")]
        public async Task<IActionResult> Update(Guid budgetId, Guid userId, UpdateBudgetMemberDto dto)
        {
            var member = await _db.BudgetMembers
                .FirstOrDefaultAsync(m => m.BudgetId == budgetId && m.UserId == userId);

            if (member is null) return NotFound();

            member.Role = dto.Role;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{budgetId}/{userId}")]
        public async Task<IActionResult> Delete(Guid budgetId, Guid userId)
        {
            var member = await _db.BudgetMembers
                .FirstOrDefaultAsync(m => m.BudgetId == budgetId && m.UserId == userId);

            if (member is null) return NotFound();

            _db.BudgetMembers.Remove(member);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

}
