using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfilesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ProfilesController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> Get() =>
            Ok(await _db.Profiles.Include(p => p.Transactions).ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id) =>
            await _db.Profiles.Include(p => p.Transactions).FirstOrDefaultAsync(p => p.UserId == id) is { } user
                ? Ok(user) : NotFound();

        [HttpPost]
        public async Task<IActionResult> Create(Profile profile)
        {
            profile.UserId = Guid.NewGuid();
            profile.CreatedAt = DateTime.UtcNow;
            _db.Profiles.Add(profile);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = profile.UserId }, profile);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, Profile input)
        {
            var profile = await _db.Profiles.FindAsync(id);
            if (profile is null) return NotFound();
            profile.FullName = input.FullName;
            profile.AvatarUrl = input.AvatarUrl;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var profile = await _db.Profiles.FindAsync(id);
            if (profile is null) return NotFound();
            _db.Profiles.Remove(profile);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
