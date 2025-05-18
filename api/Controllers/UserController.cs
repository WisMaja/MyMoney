using Microsoft.AspNetCore.Mvc;
using api.Database;
using api.Models;
using api.Services;
using api.Dtos.User;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;


namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        private Guid GetUserIdFromToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : throw new UnauthorizedAccessException("Invalid user ID in token.");
        }

        // GET: api/Users/me
        [HttpGet("me")]
        public async Task<ActionResult<User>> GetCurrentUser()
        {
            var userId = GetUserIdFromToken();

            var user = await _context.Users
                .Include(u => u.Wallets)
                .Include(u => u.Transactions)
                .Include(u => u.WalletMemberships)
                .Include(u => u.CustomCategories)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound();

            return user;
        }

        // PUT: api/Users/me
        [HttpPut("me")]
        public async Task<IActionResult> UpdateCurrentUser([FromBody] User updatedUser)
        {
            var userId = GetUserIdFromToken();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            user.FullName = updatedUser.FullName;
            user.Email = updatedUser.Email;
            user.MainWalletId = updatedUser.MainWalletId;

            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Users/me
        [HttpDelete("me")]
        public async Task<IActionResult> DeleteCurrentUser()
        {
            var userId = GetUserIdFromToken();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
