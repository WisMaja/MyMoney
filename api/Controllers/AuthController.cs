using Microsoft.AspNetCore.Mvc;
using api.Database;
using api.Models;
using api.Services;
using api.Dtos.User;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;


namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // ścieżka: /api/user
    public class AuthController : ControllerBase
    {
        private ITokenService _tokenService;
        private readonly AppDbContext _context;

        public AuthController(ITokenService tokenService, AppDbContext context)
        {
            _tokenService = tokenService;
            _context = context;
        }

        #region Rejestracja z Tworzeniem Main wallet
        [HttpPost("register")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequestDto dto)
        {
            var isEmailTaken = _context.Users.Any(u => u.Email != null && u.Email.Equals(dto.Email));
            if (isEmailTaken) return Conflict("Użytkownik o tym emailu już istnieje");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = new User
                {
                    Email = dto.Email,
                    Wallets = new List<Wallet>(),
                    Transactions = new List<Transaction>(),
                    WalletMemberships = new List<WalletMember>(),
                    CustomCategories = new List<Category>()
                };
                user.HashedPassword = new PasswordHasher<User>().HashPassword(user, dto.Password);

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var mainWallet = new Wallet
                {
                    Name = "Main Wallet",
                    Type = WalletType.Personal,
                    InitialBalance = 0,
                    Currency = "zł",
                    CreatedByUserId = user.Id,
                    CreatedByUser = user,
                    Transactions = new List<Transaction>(),
                    Members = new List<WalletMember>()
                };

                _context.Wallets.Add(mainWallet);
                await _context.SaveChangesAsync();

                user.MainWalletId = mainWallet.Id;
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return NoContent();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return StatusCode(StatusCodes.Status500InternalServerError, "Błąd serwera");
            }
        }

        #endregion
        
        #region Logowanie

        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]

        public async Task<IActionResult> LoginAsync([FromBody] LoginRequestDto dto)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email!.Equals(dto.Email));
            if (user == null) return Unauthorized();

            var passwordHasher = new PasswordHasher<User>();
                    var result = passwordHasher.VerifyHashedPassword(user, user.HashedPassword!, dto.Password);
            if (result == PasswordVerificationResult.Failed) return Unauthorized();

            var refreshToken = _tokenService.GenerateRefreshToken();
            user.RefreshToken = refreshToken.token;
            user.RefreshTokenExpiration = refreshToken.expiration;
            
            await _context.SaveChangesAsync();

            var response = new TokenResponseDto
            {
                AccessToken = _tokenService.GenerateAccessToken(user),
                RefreshToken = refreshToken.token,
            };
            
            return Ok(response);

        }
        #endregion
        
        #region RefreshToken
        [HttpPost("refresh")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> RefreshTokenAsync([FromBody] RefreshTokenRequestDto dto)
        {
            var principal = _tokenService.ValidateAndGetPrincipalFromJwt(dto.AccessToken, false);
            if (principal is null) return Unauthorized();
            
            var claimIdUser = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (claimIdUser is null || !int.TryParse(claimIdUser, out _))
                return Unauthorized();
            
            var user = _context.Users.FirstOrDefault(u => u.Id == Guid.Parse(claimIdUser));
            if (user is null || user.RefreshToken != dto.RefreshToken || user.RefreshTokenExpiration < DateTime.UtcNow)
                return Unauthorized();

            var refreshToken = _tokenService.GenerateRefreshToken();
            user.RefreshToken = refreshToken.token;
            user.RefreshTokenExpiration = refreshToken.expiration;
            
            await _context.SaveChangesAsync();
            
            var response = new TokenResponseDto
            {
                AccessToken = _tokenService.GenerateAccessToken(user),
                RefreshToken = refreshToken.token,
            };
            
            return Ok(response);
        }
        #endregion
        
        
        #region Zmiana hasła
        [Authorize]
        [HttpPut("change-password")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return Unauthorized();

            var hasher = new PasswordHasher<User>();
            var result = hasher.VerifyHashedPassword(user, user.HashedPassword!, dto.CurrentPassword);
            if (result == PasswordVerificationResult.Failed)
                return BadRequest("Nieprawidłowe aktualne hasło.");

            user.HashedPassword = hasher.HashPassword(user, dto.NewPassword);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        

        #endregion


    }
}
