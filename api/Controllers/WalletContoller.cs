using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using api.Models;
using api.Database;
using api.Dtos.Wallet;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WalletsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WalletsController(AppDbContext context)
        {
            _context = context;
        }

        private Guid GetUserIdFromToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : throw new UnauthorizedAccessException("Invalid user ID in token.");
        }

        private static decimal CalculateCurrentBalance(Wallet wallet)
        {
            var baseBalance = wallet.ManualBalance ?? wallet.InitialBalance;
            var fromDate = wallet.BalanceResetAt ?? DateTime.MinValue;
            var transactionSum = wallet.Transactions.Where(t => t.CreatedAt >= fromDate).Sum(t => t.Amount);
            return baseBalance + transactionSum;
        }

        // GET: api/wallets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WalletDto>>> GetUserWallets()
        {
            var userId = GetUserIdFromToken();

            var wallets = await _context.Wallets
                .Include(w => w.Transactions)
                .Include(w => w.Members)
                .Where(w => w.CreatedByUserId == userId || w.Members.Any(m => m.UserId == userId))
                .ToListAsync();

            var result = wallets.Select(w => new WalletDto
            {
                Id = w.Id,
                Name = w.Name,
                Type = w.Type,
                Currency = w.Currency,
                InitialBalance = w.InitialBalance,
                ManualBalance = w.ManualBalance,
                BalanceResetAt = w.BalanceResetAt,
                CurrentBalance = CalculateCurrentBalance(w),
                CreatedAt = w.CreatedAt,
                UpdatedAt = w.UpdatedAt
            }).ToList();

            return Ok(result);
        }

        // GET: api/wallets/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<WalletDto>> GetWallet(Guid id)
        {
            var userId = GetUserIdFromToken();

            var wallet = await _context.Wallets
                .Include(w => w.Members)
                .Include(w => w.Transactions)
                .FirstOrDefaultAsync(w =>
                    w.Id == id &&
                    (w.CreatedByUserId == userId || w.Members.Any(m => m.UserId == userId)));

            if (wallet == null)
                return NotFound();

            var result = new WalletDto
            {
                Id = wallet.Id,
                Name = wallet.Name,
                Type = wallet.Type,
                Currency = wallet.Currency,
                InitialBalance = wallet.InitialBalance,
                ManualBalance = wallet.ManualBalance,
                BalanceResetAt = wallet.BalanceResetAt,
                CurrentBalance = CalculateCurrentBalance(wallet),
                CreatedAt = wallet.CreatedAt,
                UpdatedAt = wallet.UpdatedAt
            };

            return Ok(result);
        }

        // GET: api/wallets/{id}/balance
        [HttpGet("{id}/balance")]
        public async Task<ActionResult<object>> GetWalletBalance(Guid id)
        {
            var userId = GetUserIdFromToken();

            var wallet = await _context.Wallets
                .Include(w => w.Members)
                .Include(w => w.Transactions)
                .FirstOrDefaultAsync(w =>
                    w.Id == id &&
                    (w.CreatedByUserId == userId || w.Members.Any(m => m.UserId == userId)));

            if (wallet == null)
                return NotFound();

            var currentBalance = CalculateCurrentBalance(wallet);

            return Ok(new
            {
                WalletId = wallet.Id,
                InitialBalance = wallet.InitialBalance,
                ManualBalance = wallet.ManualBalance,
                BalanceResetAt = wallet.BalanceResetAt,
                CurrentBalance = currentBalance
            });
        }

        // PUT: api/wallets/{id}/set-balance
        [HttpPut("{id}/set-balance")]
        public async Task<IActionResult> SetManualBalance(Guid id, [FromBody] SetManualBalanceDto dto)
        {
            var userId = GetUserIdFromToken();

            var wallet = await _context.Wallets
                .Include(w => w.Members)
                .FirstOrDefaultAsync(w =>
                    w.Id == id &&
                    (w.CreatedByUserId == userId || w.Members.Any(m => m.UserId == userId)));

            if (wallet == null)
                return Forbid("Brak dostępu do portfela.");

            wallet.ManualBalance = dto.Balance;
            wallet.BalanceResetAt = DateTime.UtcNow;
            wallet.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/wallets
        [HttpPost]
        public async Task<ActionResult<WalletDto>> CreateWallet([FromBody] CreateWalletDto dto)
        {
            var userId = GetUserIdFromToken();
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return Unauthorized();

            var wallet = new Wallet
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Type = dto.Type,
                Currency = dto.Currency,
                InitialBalance = dto.InitialBalance,
                CreatedByUserId = userId,
                CreatedByUser = user,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Members = new List<WalletMember>
                {
                    new WalletMember { WalletId = Guid.Empty, UserId = userId }
                },
                Transactions = new List<Transaction>()
            };

            wallet.Members.First().WalletId = wallet.Id;

            _context.Wallets.Add(wallet);
            await _context.SaveChangesAsync();

            var result = new WalletDto
            {
                Id = wallet.Id,
                Name = wallet.Name,
                Type = wallet.Type,
                Currency = wallet.Currency,
                InitialBalance = wallet.InitialBalance,
                ManualBalance = null,
                BalanceResetAt = null,
                CurrentBalance = wallet.InitialBalance,
                CreatedAt = wallet.CreatedAt,
                UpdatedAt = wallet.UpdatedAt
            };

            return CreatedAtAction(nameof(GetWallet), new { id = wallet.Id }, result);
        }
    }
}
