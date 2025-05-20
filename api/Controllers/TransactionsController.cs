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
            try
            {
                Console.WriteLine("Fetching all transactions");
                var userId = GetUserIdFromToken();
                Console.WriteLine($"User ID: {userId}");

                var transactions = await _context.Transactions
                    .Include(t => t.Category)
                    .Where(t => t.UserId == userId)
                    .ToListAsync();

                Console.WriteLine($"Found {transactions.Count} transactions");

                // Map to DTO to avoid circular references
                var transactionsDto = transactions.Select(t => new
                {
                    t.Id,
                    t.Amount,
                    t.Description,
                    t.CreatedAt,
                    t.UpdatedAt,
                    CategoryId = t.CategoryId,
                    Category = t.Category != null ? new { t.Category.Id, t.Category.Name } : null,
                    WalletId = t.WalletId
                }).ToList();

                return Ok(transactionsDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAll: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, new { message = "Error fetching transactions", error = ex.Message });
            }
        }

        [HttpGet("income")]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetIncome()
        {
            try
            {
                Console.WriteLine("Fetching income transactions");
                var userId = GetUserIdFromToken();
                Console.WriteLine($"User ID: {userId}");

                var income = await _context.Transactions
                    .Include(t => t.Category)
                    .Where(t => t.UserId == userId && t.Amount > 0)
                    .ToListAsync();

                Console.WriteLine($"Found {income.Count} income transactions");

                // Map to DTO to avoid circular references
                var incomeDto = income.Select(t => new
                {
                    t.Id,
                    t.Amount,
                    t.Description,
                    t.CreatedAt,
                    t.UpdatedAt,
                    CategoryId = t.CategoryId,
                    Category = t.Category != null ? new { t.Category.Id, t.Category.Name } : null,
                    WalletId = t.WalletId
                }).ToList();

                return Ok(incomeDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetIncome: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, new { message = "Error fetching income transactions", error = ex.Message });
            }
        }

        [HttpGet("expenses")]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetExpenses()
        {
            try
            {
                Console.WriteLine("Fetching expense transactions");
                var userId = GetUserIdFromToken();
                Console.WriteLine($"User ID: {userId}");

                var expenses = await _context.Transactions
                    .Include(t => t.Category)
                    .Where(t => t.UserId == userId && t.Amount < 0)
                    .ToListAsync();

                Console.WriteLine($"Found {expenses.Count} expense transactions");

                // Map to DTO to avoid circular references
                var expensesDto = expenses.Select(t => new
                {
                    t.Id,
                    t.Amount,
                    t.Description,
                    t.CreatedAt,
                    t.UpdatedAt,
                    CategoryId = t.CategoryId,
                    Category = t.Category != null ? new { t.Category.Id, t.Category.Name } : null,
                    WalletId = t.WalletId
                }).ToList();

                return Ok(expensesDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetExpenses: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, new { message = "Error fetching expense transactions", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Transaction>> GetTransaction(Guid id)
        {
            try
            {
                Console.WriteLine($"Fetching transaction with ID: {id}");
                var userId = GetUserIdFromToken();
                Console.WriteLine($"User ID: {userId}");

                var transaction = await _context.Transactions
                    .Include(t => t.Category)
                    .Include(t => t.Wallet)
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

                if (transaction == null)
                {
                    Console.WriteLine($"Transaction with ID {id} not found");
                    return NotFound();
                }

                Console.WriteLine($"Found transaction: {transaction.Id}, Amount: {transaction.Amount}");

                // Map to DTO to avoid circular references
                var transactionDto = new
                {
                    transaction.Id,
                    transaction.Amount,
                    transaction.Description,
                    transaction.CreatedAt,
                    transaction.UpdatedAt,
                    CategoryId = transaction.CategoryId,
                    Category = transaction.Category != null ? new { transaction.Category.Id, transaction.Category.Name } : null,
                    WalletId = transaction.WalletId,
                    Wallet = transaction.Wallet != null ? new { transaction.Wallet.Id, transaction.Wallet.Name, transaction.Wallet.Currency } : null
                };

                return Ok(transactionDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetTransaction: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, new { message = "Error fetching transaction", error = ex.Message });
            }
        }

        // -------------------- POST --------------------

        [HttpPost("income")]
        public async Task<IActionResult> AddIncome([FromBody] CreateTransactionDto dto)
        {
            try
            {
                Console.WriteLine($"Starting AddIncome with data: WalletId={dto.WalletId}, CategoryId={dto.CategoryId}, Amount={dto.Amount}");
                var userId = GetUserIdFromToken();
                Console.WriteLine($"User ID from token: {userId}");

                if (!await UserHasAccessToWallet(dto.WalletId, userId))
                {
                    Console.WriteLine($"User {userId} has no access to wallet {dto.WalletId}");
                    return StatusCode(403, new { message = "No access to the wallet" });
                }

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

                Console.WriteLine($"Adding transaction: {transaction.Id} for amount {transaction.Amount}");
                _context.Transactions.Add(transaction);
                await _context.SaveChangesAsync();
                Console.WriteLine("Transaction saved successfully");

                return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transaction);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in AddIncome: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, new { message = "Error adding income", error = ex.Message });
            }
        }

        [HttpPost("expenses")]
        public async Task<IActionResult> AddExpense([FromBody] CreateTransactionDto dto)
        {
            var userId = GetUserIdFromToken();

            if (!await UserHasAccessToWallet(dto.WalletId, userId))
                return StatusCode(403, new { message = "No access to the wallet" });

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
            try
            {
                Console.WriteLine($"Fetching income vs expense statistics, from: {from}, to: {to}");
                var userId = GetUserIdFromToken();
                Console.WriteLine($"User ID: {userId}");
                
                // Set default date range to current month if not specified
                var startDate = from ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
                var endDate = to ?? DateTime.UtcNow.AddDays(1);
                
                var transactions = await _context.Transactions
                    .Where(t => t.UserId == userId && t.CreatedAt >= startDate && t.CreatedAt <= endDate)
                    .ToListAsync();
                
                Console.WriteLine($"Found {transactions.Count} transactions for statistics");
                
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
                
                return Ok(stats.ToList());
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetIncomeVsExpenseStats: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, new { message = "Error fetching income vs expense statistics", error = ex.Message });
            }
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
            Console.WriteLine($"Checking if user {userId} has access to wallet {walletId}");
            
            // First check if wallet exists
            var wallet = await _context.Wallets
                .Include(w => w.Members)
                .FirstOrDefaultAsync(w => w.Id == walletId);
                
            if (wallet == null)
            {
                Console.WriteLine($"Wallet {walletId} not found in database");
                
                // If wallet doesn't exist, check if this is a default wallet ID
                if (walletId == Guid.Parse("00000000-0000-0000-0000-000000000000"))
                {
                    Console.WriteLine("Attempting to create default wallet with special ID");
                    // Create a default wallet for this user
                    var user = await _context.Users.FindAsync(userId);
                    if (user != null)
                    {
                        try
                        {
                            Console.WriteLine($"Found user {user.Email}, creating default wallet");
                            var defaultWallet = new Models.Wallet
                            {
                                Id = walletId,
                                Name = "Default Wallet",
                                Type = Models.WalletType.Personal,
                                Currency = "USD",
                                InitialBalance = 0,
                                CreatedByUserId = userId,
                                CreatedByUser = user,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow,
                                Members = new List<Models.WalletMember>
                                {
                                    new Models.WalletMember { WalletId = walletId, UserId = userId }
                                },
                                Transactions = new List<Models.Transaction>()
                            };
                            
                            _context.Wallets.Add(defaultWallet);
                            await _context.SaveChangesAsync();
                            Console.WriteLine("Successfully created default wallet");
                            return true;
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error creating default wallet: {ex.Message}");
                            Console.WriteLine(ex.StackTrace);
                            return false;
                        }
                    }
                    else
                    {
                        Console.WriteLine("User not found, cannot create default wallet");
                    }
                }
                return false;
            }
            
            // If wallet exists, check if user has access
            var hasAccess = wallet.CreatedByUserId == userId || wallet.Members.Any(m => m.UserId == userId);
            Console.WriteLine($"User access check: {hasAccess}");
            return hasAccess;
        }
    }
}
