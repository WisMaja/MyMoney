using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;

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
        public async Task<IActionResult> Create(Invitation invitation)
        {
            invitation.InvitationId = Guid.NewGuid();
            invitation.CreatedAt = DateTime.UtcNow;
            _db.Invitations.Add(invitation);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = invitation.InvitationId }, invitation);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, Invitation input)
        {
            var invite = await _db.Invitations.FindAsync(id);
            if (invite is null) return NotFound();
            invite.Status = input.Status;
            invite.ExpiresAt = input.ExpiresAt;
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
