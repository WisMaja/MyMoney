using Microsoft.AspNetCore.Mvc;
using api.Database;
using api.Models;
using api.Services;
using api.Dtos.User;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using System.IO;

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
                Email = user.Email,
                ProfileImageUrl = user.ProfileImageUrl,
                MainWalletId = user.MainWalletId
            };

            return Ok(userDto);
        }

        // PUT: api/Users/me
        [HttpPut("me")]
        public async Task<IActionResult> UpdateCurrentUser([FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                var userId = GetUserIdFromToken();

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound();

                // Log the incoming data
                Console.WriteLine($"Updating user {userId}");
                Console.WriteLine($"FullName: {updateUserDto.FullName}");
                Console.WriteLine($"Email: {updateUserDto.Email}");
                Console.WriteLine($"ProfileImageUrl length: {updateUserDto.ProfileImageUrl?.Length ?? 0}");

                // Update only the provided fields
                if (!string.IsNullOrEmpty(updateUserDto.FullName))
                    user.FullName = updateUserDto.FullName;
                
                if (!string.IsNullOrEmpty(updateUserDto.Email))
                    user.Email = updateUserDto.Email;
                
                if (!string.IsNullOrEmpty(updateUserDto.ProfileImageUrl))
                    user.ProfileImageUrl = updateUserDto.ProfileImageUrl;

                _context.Entry(user).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                Console.WriteLine("User updated successfully");
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating user: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest($"Error updating user: {ex.Message}");
            }
        }

        // PUT: api/Users/me/profile-image
        [HttpPut("me/profile-image")]
        public async Task<IActionResult> UpdateProfileImage(IFormFile profileImage)
        {
            try
            {
                var userId = GetUserIdFromToken();

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound();

                if (profileImage == null || profileImage.Length == 0)
                    return BadRequest("No file uploaded.");

                // Check file size (5MB limit)
                const long maxFileSize = 5 * 1024 * 1024; // 5MB
                if (profileImage.Length > maxFileSize)
                    return BadRequest("File size too large. Maximum size is 5MB.");

                // Check file type
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif" };
                if (!allowedTypes.Contains(profileImage.ContentType.ToLower()))
                    return BadRequest("Invalid file type. Only JPEG, PNG and GIF are allowed.");

                // Create uploads directory if it doesn't exist
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profile-images");
                Directory.CreateDirectory(uploadsPath);

                // Generate unique filename
                var fileExtension = Path.GetExtension(profileImage.FileName);
                var fileName = $"{userId}_{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await profileImage.CopyToAsync(stream);
                }

                // Update user's profile image URL
                var imageUrl = $"/uploads/profile-images/{fileName}";
                user.ProfileImageUrl = imageUrl;

                _context.Entry(user).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                Console.WriteLine($"Profile image updated for user {userId}: {imageUrl}");
                return Ok(new { profileImageUrl = imageUrl });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating profile image: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest($"Error updating profile image: {ex.Message}");
            }
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
        [HttpPost("add-friend-to-wallet")]
        public async Task<IActionResult> AddFriendToWallet([FromBody] AddFriendRequestDto request)
        {
            try
            {
                // Wyciągnięcie ID użytkownika z tokena
                var userId = GetUserIdFromToken();

                // Sprawdzenie, czy portfel istnieje i należy do użytkownika
                var wallet = await _context.Wallets
                                           .Include(w => w.Members)
                                           .FirstOrDefaultAsync(w => w.Id == request.WalletId && w.CreatedByUserId == userId);
                if (wallet == null)
                    return BadRequest("Nie znaleziono portfela lub brak dostępu.");

                // Sprawdzenie, czy użytkownik o podanym e-mailu istnieje
                var friend = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.FriendEmail);
                if (friend == null)
                    return BadRequest("Nie znaleziono użytkownika o podanym adresie e-mail.");

                // Sprawdzenie, czy użytkownik już jest członkiem portfela
                if (wallet.Members.Any(m => m.UserId == friend.Id))
                    return BadRequest("Ten użytkownik jest już członkiem portfela.");

                // Dodanie znajomego jako członka portfela
                var walletMember = new WalletMember
                {
                    WalletId = wallet.Id,
                    UserId = friend.Id,
                    
                };

                wallet.Members.Add(walletMember);
                await _context.SaveChangesAsync();

                return Ok("Pomyślnie dodano znajomego do portfela.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Błąd: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Wystąpił błąd serwera.");
            }
        }
    }
}