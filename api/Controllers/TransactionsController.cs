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

        // -------------------- STATISTICS --------------------

        [HttpGet("statistics/income-expense")]
        public async Task<IActionResult> GetIncomeVsExpenseStats([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var userId = GetUserIdFromToken();
            
            // Set default date range to current month if not specified
            var startDate = from ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var endDate = to ?? DateTime.UtcNow.AddDays(1);
            
            var transactions = await _context.Transactions
                .Where(t => t.UserId == userId && t.CreatedAt >= startDate && t.CreatedAt <= endDate)
                .ToListAsync();
            
            // Group by day or month based on date range
            var groupByMonth = (endDate - startDate).TotalDays > 31;
            
            var stats = groupByMonth 
                ? transactions.GroupBy(t => new { t.CreatedAt.Year, t.CreatedAt.Month })
                    .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                    .Select(g => new {
                        Date = $"{g.Key.Year}-{g.Key.Month}",
                        Label = $"{g.Key.Year}-{g.Key.Month}",
                        Income = g.Where(t => t.Amount > 0).Sum(t => t.Amount),
                        Expense = Math.Abs(g.Where(t => t.Amount < 0).Sum(t => t.Amount))
                    })
                : transactions.GroupBy(t => t.CreatedAt.Date)
                    .OrderBy(g => g.Key)
                    .Select(g => new {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        Label = g.Key.ToString("MM-dd"),
                        Income = g.Where(t => t.Amount > 0).Sum(t => t.Amount),
                        Expense = Math.Abs(g.Where(t => t.Amount < 0).Sum(t => t.Amount))
                    });
            
            return Ok(stats);
        }
        
        [HttpGet("statistics/category-breakdown")]
        public async Task<IActionResult> GetCategoryBreakdown([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var userId = GetUserIdFromToken();
            
            // Set default date range to current month if not specified
            var startDate = from ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var endDate = to ?? DateTime.UtcNow.AddDays(1);
            
            var transactions = await _context.Transactions
                .Include(t => t.Category)
                .Where(t => t.UserId == userId && t.CreatedAt >= startDate && t.CreatedAt <= endDate)
                .ToListAsync();
            
            // Category breakdown for expenses only
            var expenseCategories = transactions
                .Where(t => t.Amount < 0)
                .GroupBy(t => t.Category != null ? t.Category.Name : "Uncategorized")
                .Select(g => new {
                    Category = g.Key,
                    Amount = Math.Abs(g.Sum(t => t.Amount))
                })
                .OrderByDescending(x => x.Amount);
            
            // Category breakdown for income only
            var incomeCategories = transactions
                .Where(t => t.Amount > 0)
                .GroupBy(t => t.Category != null ? t.Category.Name : "Uncategorized")
                .Select(g => new {
                    Category = g.Key,
                    Amount = g.Sum(t => t.Amount)
                })
                .OrderByDescending(x => x.Amount);
            
            return Ok(new { 
                expenses = expenseCategories, 
                income = incomeCategories 
            });
        }
        
        [HttpGet("statistics/summary")]
        public async Task<IActionResult> GetStatisticsSummary([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var userId = GetUserIdFromToken();
            
            // Set default date range to current month if not specified
            var startDate = from ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var endDate = to ?? DateTime.UtcNow.AddDays(1);
            
            var transactions = await _context.Transactions
                .Include(t => t.Category)
                .Where(t => t.UserId == userId && t.CreatedAt >= startDate && t.CreatedAt <= endDate)
                .ToListAsync();
            
            var totalIncome = transactions.Where(t => t.Amount > 0).Sum(t => t.Amount);
            var totalExpenses = Math.Abs(transactions.Where(t => t.Amount < 0).Sum(t => t.Amount));
            var netSavings = totalIncome - totalExpenses;
            var savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
            
            // Top expense category
            var topExpenseCategory = transactions
                .Where(t => t.Amount < 0)
                .GroupBy(t => t.Category != null ? t.Category.Name : "Uncategorized")
                .OrderByDescending(g => Math.Abs(g.Sum(t => t.Amount)))
                .Select(g => new { 
                    Category = g.Key, 
                    Amount = Math.Abs(g.Sum(t => t.Amount)) 
                })
                .FirstOrDefault();
                
            // Top income category
            var topIncomeCategory = transactions
                .Where(t => t.Amount > 0)
                .GroupBy(t => t.Category != null ? t.Category.Name : "Uncategorized")
                .OrderByDescending(g => g.Sum(t => t.Amount))
                .Select(g => new { 
                    Category = g.Key, 
                    Amount = g.Sum(t => t.Amount) 
                })
                .FirstOrDefault();
            
            return Ok(new {
                totalIncome,
                totalExpenses,
                netSavings,
                savingsRate,
                topExpenseCategory,
                topIncomeCategory,
                transactionCount = transactions.Count(),
                dateRange = new { startDate, endDate }
            });
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
