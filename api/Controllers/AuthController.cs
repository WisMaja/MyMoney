using Microsoft.AspNetCore.Mvc;
using api.Database;
using api.Models;
using api.Services;
using api.Dtos.User;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

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

        #region Rejestracja


        [HttpPost("register")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequestDto dto)
        {
            var isEmailTaken = _context.Users.Any(u => u.Email.Equals(dto.Email));
            if (isEmailTaken) return Conflict("Użytkownik o tym emailu już istnieje");
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
            return CreatedAtAction(nameof(GetAll), new { id = user.Id }, user);
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
            
            var response = new TokenResponseDto
            {
                AccessToken = _tokenService.GenerateAccessToken(user),
                RefreshToken = refreshToken.token,
            };
            
            return Ok(response);
        }
        #endregion

        // GET: /api/user
        [HttpGet]
        public IActionResult GetAll()
        {
            var users = _context.Users.ToList();
            return Ok(users);
        }

        // POST: /api/user
        [HttpPost]
        public IActionResult Create(User user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetAll), new { id = user.Id }, user);
        }

        // public async Task SetMainWallet(Guid userId, Guid walletId)
        // {
        //     var user = await _context.Users.FindAsync(userId);
        //     var wallet = await _context.Wallets.FindAsync(walletId);

        //     if (user == null || wallet == null || wallet.CreatedByUserId != userId)
        //         throw new UnauthorizedAccessException("Nie masz dostępu do tego portfela.");

        //     user.MainWalletId = walletId;
        //     await _context.SaveChangesAsync();
        // }

    }
}
