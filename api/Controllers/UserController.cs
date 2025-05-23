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
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var userId = GetUserIdFromToken();

            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound();

            // Mapowanie na DTO
            var userDto = new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                MainWalletId = user.MainWalletId
            };

            return Ok(userDto);
        }

        // PUT: api/Users/me
        [HttpPut("me")]
        public async Task<IActionResult> UpdateCurrentUser([FromBody] UpdateUserDto updateUserDto)
        {
            var userId = GetUserIdFromToken();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            // Update only the provided fields
            if (!string.IsNullOrEmpty(updateUserDto.FullName))
                user.FullName = updateUserDto.FullName;
            
            if (!string.IsNullOrEmpty(updateUserDto.Email))
                user.Email = updateUserDto.Email;

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
