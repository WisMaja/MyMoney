using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using api.Models;
using api.Database;
using api.Dtos.Transaction;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransactionsController(AppDbContext context)
        {
            _context = context;
        }

        private Guid GetUserIdFromToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId)
                ? userId
                : throw new UnauthorizedAccessException("Invalid user ID in token.");
        }

        // -------------------- GET --------------------

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetAll()
        {
            var userId = GetUserIdFromToken();

            var transactions = await _context.Transactions
                .Include(t => t.Category)
                .Where(t => t.UserId == userId)
                .ToListAsync();

            return Ok(transactions);
        }

        [HttpGet("income")]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetIncome()
        {
            var userId = GetUserIdFromToken();

            var income = await _context.Transactions
                .Include(t => t.Category)
                .Where(t => t.UserId == userId && t.Amount > 0)
                .ToListAsync();

            return Ok(income);
        }

        [HttpGet("expenses")]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetExpenses()
        {
            var userId = GetUserIdFromToken();

            var expenses = await _context.Transactions
                .Include(t => t.Category)
                .Where(t => t.UserId == userId && t.Amount < 0)
                .ToListAsync();

            return Ok(expenses);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Transaction>> GetTransaction(Guid id)
        {
            var userId = GetUserIdFromToken();

            var transaction = await _context.Transactions
                .Include(t => t.Category)
                .Include(t => t.Wallet)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (transaction == null)
                return NotFound();

            return Ok(transaction);
        }

        // -------------------- POST --------------------

        [HttpPost("income")]
        public async Task<IActionResult> AddIncome([FromBody] CreateTransactionDto dto)
        {
            var userId = GetUserIdFromToken();

            if (!await UserHasAccessToWallet(dto.WalletId, userId))
                return Forbid("Brak dostępu do portfela.");

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                WalletId = dto.WalletId,
                UserId = userId,
                CategoryId = dto.CategoryId,
                Amount = Math.Abs(dto.Amount),
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transaction);
        }

        [HttpPost("expenses")]
        public async Task<IActionResult> AddExpense([FromBody] CreateTransactionDto dto)
        {
            var userId = GetUserIdFromToken();

            if (!await UserHasAccessToWallet(dto.WalletId, userId))
                return Forbid("Brak dostępu do portfela.");

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                WalletId = dto.WalletId,
                UserId = userId,
                CategoryId = dto.CategoryId,
                Amount = -Math.Abs(dto.Amount),
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transaction);
        }

        // -------------------- PUT --------------------

        [HttpPut("income/{id}")]
        public async Task<IActionResult> UpdateIncome(Guid id, [FromBody] UpdateTransactionDto dto)
        {
            var userId = GetUserIdFromToken();

            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId && t.Amount > 0);

            if (transaction == null)
                return NotFound();

            transaction.Amount = Math.Abs(dto.Amount);
            transaction.Description = dto.Description;
            transaction.CategoryId = dto.CategoryId;
            transaction.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("expenses/{id}")]
        public async Task<IActionResult> UpdateExpense(Guid id, [FromBody] UpdateTransactionDto dto)
        {
            var userId = GetUserIdFromToken();

            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId && t.Amount < 0);

            if (transaction == null)
                return NotFound();

            transaction.Amount = -Math.Abs(dto.Amount);
            transaction.Description = dto.Description;
            transaction.CategoryId = dto.CategoryId;
            transaction.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // -------------------- DELETE --------------------

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = GetUserIdFromToken();

            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (transaction == null)
                return NotFound();

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // -------------------- Helper --------------------

        private async Task<bool> UserHasAccessToWallet(Guid walletId, Guid userId)
        {
            return await _context.Wallets
                .Include(w => w.Members)
                .AnyAsync(w =>
                    w.Id == walletId &&
                    (w.CreatedByUserId == userId || w.Members.Any(m => m.UserId == userId)));
        }
    }
}
