using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;
using api.DTO;

namespace api.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class InvitationsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public InvitationsController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> Get() =>
            Ok(await _db.Invitations
                .Include(i => i.Budget)
                .Include(i => i.Inviter)
                .ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id) =>
            await _db.Invitations.FirstOrDefaultAsync(i => i.InvitationId == id) is { } invite
                ? Ok(invite) : NotFound();

        [HttpPost]
        public async Task<IActionResult> Create(CreateInvitationDto dto)
        {
            var invite = new Invitation
            {
                InvitationId = Guid.NewGuid(),
                BudgetId = dto.BudgetId,
                InvitedEmail = dto.InvitedEmail,
                InviterId = dto.InviterId,
                Status = dto.Status,
                ExpiresAt = dto.ExpiresAt,
                CreatedAt = DateTime.UtcNow
            };

            _db.Invitations.Add(invite);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = invite.InvitationId }, invite);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdateInvitationDto dto)
        {
            var invite = await _db.Invitations.FindAsync(id);
            if (invite is null) return NotFound();

            invite.Status = dto.Status;
            invite.ExpiresAt = dto.ExpiresAt;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var invite = await _db.Invitations.FindAsync(id);
            if (invite is null) return NotFound();

            _db.Invitations.Remove(invite);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

}
