using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using api.Models;
using api.Database;
using api.Dtos.Wallet;
using api.Services;

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
        
        [HttpGet("{id}/members")]
        public async Task<IActionResult> GetWalletMembers(Guid id)
        {
            var userId = GetUserIdFromToken();

            var wallet = await _context.Wallets
                .Include(w => w.Members).ThenInclude(m => m.User)
                .FirstOrDefaultAsync(w => w.Id == id &&
                                          (w.CreatedByUserId == userId || w.Members.Any(m => m.UserId == userId)));

            if (wallet == null)
                return NotFound();

            var members = wallet.Members.Select(m => new
            {
                m.UserId,
                m.User!.Email,
                m.User.FullName
                // m.Role
            });

            return Ok(members);
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
                return StatusCode(403, new { message = "No access to the wallet" });

            wallet.ManualBalance = dto.Balance;
            wallet.BalanceResetAt = DateTime.UtcNow;
            wallet.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        
        // PUT: api/wallets/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWallet(Guid id, [FromBody] UpdateWalletDto dto)
        {
            var userId = GetUserIdFromToken();

            // Sprawdź, czy portfel istnieje i czy użytkownik jest uprawniony do jego edycji
            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.Id == id && w.CreatedByUserId == userId);

            if (wallet == null)
                return NotFound("Portfel nie istnieje lub nie masz uprawnień do jego edycji.");

            // Zaktualizuj dane portfela
            wallet.Name = dto.Name;
            wallet.Type = dto.Type;
            wallet.Currency = dto.Currency;

            // Jeśli `Currency` zostanie zmienione, dodatkowe działania mogą być potrzebne
            if (wallet.InitialBalance != dto.InitialBalance)
            {
                wallet.InitialBalance = dto.InitialBalance;
                wallet.ManualBalance = null;  // Wyzerowanie ręcznego bilansu
                wallet.BalanceResetAt = null;
            }

            wallet.UpdatedAt = DateTime.UtcNow;

            // Zapisz zmiany w bazie danych
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Portfel został zaktualizowany pomyślnie."
            });
        }
        
        

        // POST: api/wallets
        [HttpPost]
        public async Task<ActionResult<WalletDto>> CreateWallet([FromBody] CreateWalletDto dto)
        {
            try
            {
                var userId = GetUserIdFromToken();
                Console.WriteLine($"Creating wallet for user: {userId}");
                
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    Console.WriteLine("User not found");
                    return Unauthorized();
                }

                var walletId = Guid.NewGuid();
                
                // Handle default wallet scenario
                if (dto.Name == "Default Wallet" && dto.Type == WalletType.Personal)
                {
                    // Check if this is the default mock ID
                    if (string.IsNullOrEmpty(dto.Id) || dto.Id == "00000000-0000-0000-0000-000000000000")
                    {
                        walletId = Guid.Parse("00000000-0000-0000-0000-000000000000");
                        Console.WriteLine("Creating default wallet with special ID");
                    }
                }

                var wallet = new Wallet
                {
                    Id = walletId,
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

                // Check if wallet with this ID already exists
                var existingWallet = await _context.Wallets.FindAsync(wallet.Id);
                if (existingWallet != null)
                {
                    Console.WriteLine($"Wallet with ID {wallet.Id} already exists");
                    
                    // If this is the default wallet ID, try to add the current user as a member
                    if (wallet.Id == Guid.Parse("00000000-0000-0000-0000-000000000000"))
                    {
                        // Check if user is already a member
                        var isMember = await _context.WalletMembers
                            .AnyAsync(wm => wm.WalletId == wallet.Id && wm.UserId == userId);
                            
                        if (!isMember)
                        {
                            Console.WriteLine("Adding user as member to existing default wallet");
                            _context.WalletMembers.Add(new WalletMember 
                            { 
                                WalletId = wallet.Id, 
                                UserId = userId 
                            });
                            await _context.SaveChangesAsync();
                        }
                        
                        // Return the existing wallet data
                        var result = new WalletDto
                        {
                            Id = existingWallet.Id,
                            Name = existingWallet.Name,
                            Type = existingWallet.Type,
                            Currency = existingWallet.Currency,
                            InitialBalance = existingWallet.InitialBalance,
                            ManualBalance = existingWallet.ManualBalance,
                            BalanceResetAt = existingWallet.BalanceResetAt,
                            CurrentBalance = existingWallet.InitialBalance, // Simplified
                            CreatedAt = existingWallet.CreatedAt,
                            UpdatedAt = existingWallet.UpdatedAt
                        };
                        
                        return Ok(result);
                    }
                    
                    // For non-default wallets, generate a new ID
                    wallet.Id = Guid.NewGuid();
                    wallet.Members.First().WalletId = wallet.Id;
                }

                _context.Wallets.Add(wallet);
                await _context.SaveChangesAsync();

                var walletDto = new WalletDto
                {
                    Id = wallet.Id,
                    Name = wallet.Name,
                    Type = wallet.Type,
                    Currency = wallet.Currency,
                    InitialBalance = wallet.InitialBalance,
                    CurrentBalance = wallet.InitialBalance,
                    CreatedAt = wallet.CreatedAt,
                    UpdatedAt = wallet.UpdatedAt
                };
                
                Console.WriteLine($"Successfully created wallet: {wallet.Id}");
                return CreatedAtAction(nameof(GetWallet), new { id = wallet.Id }, walletDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating wallet: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, new { message = "Error creating wallet", error = ex.Message });
            }
        }
        
        [HttpPost("{id}/members")]
        public async Task<IActionResult> AddMember(Guid id, [FromBody] AddWalletMemberDto dto)
        {
            var userId = GetUserIdFromToken();

            // Sprawdź, czy obecny użytkownik to właściciel
            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.Id == id && w.CreatedByUserId == userId);

            if (wallet == null)
                return Forbid("Tylko właściciel może dodawać członków.");

            // Sprawdź, czy użytkownik istnieje
            var newUser = await _context.Users.FindAsync(dto.UserId);
            if (newUser == null)
                return NotFound("Użytkownik nie istnieje.");

            // Sprawdź, czy już jest członkiem
            bool alreadyMember = await _context.WalletMembers
                .AnyAsync(m => m.WalletId == id && m.UserId == dto.UserId);
            if (alreadyMember)
                return Conflict("Użytkownik już jest członkiem tego portfela.");

            var member = new WalletMember
            {
                WalletId = id,
                UserId = dto.UserId
                // Role = dto.Role
            };

            _context.WalletMembers.Add(member);
            await _context.SaveChangesAsync();

            return Ok("Dodano użytkownika do portfela.");
        }
        
        
        [HttpPost("{id}/members/email")]
        public async Task<IActionResult> AddMemberByEmail(Guid id, [FromBody] AddMemberByEmailDto dto)
        {
            var userId = GetUserIdFromToken();

            var wallet = await _context.Wallets
                .Include(w => w.Members)
                .FirstOrDefaultAsync(w => w.Id == id && w.CreatedByUserId == userId);

            if (wallet == null)
                return Forbid("Only wallet owner can add members.");

            var newUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (newUser == null)
                return NotFound("User with this email does not exist.");

            if (wallet.Members.Any(m => m.UserId == newUser.Id))
                return Conflict("This user is already a member of the wallet.");

            var member = new WalletMember
            {
                WalletId = id,
                UserId = newUser.Id,
            };

            _context.WalletMembers.Add(member);
            await _context.SaveChangesAsync();

            return Ok("Member added successfully.");
        }

        
        // DELETE: api/wallet/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWallet(Guid id)
        {
            var userId = GetUserIdFromToken();

            var wallet = await _context.Wallets
                .Include(w => w.Members)
                .FirstOrDefaultAsync(w => w.Id == id && w.CreatedByUserId == userId);

            if (wallet == null)
                return NotFound("Portfel nie istnieje lub nie masz uprawnień do jego usunięcia.");

            // Sprawdź, czy to nie jest główny portfel przypisany do użytkownika
            var isMainWalletAssigned = await _context.Users
                .AnyAsync(u => u.MainWalletId == id);

            if (isMainWalletAssigned)
                return BadRequest("Nie można usunąć portfela, który jest przypisany jako główny portfel użytkownika.");

            _context.Wallets.Remove(wallet);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/wallets/{id}/set-main
        [HttpPut("{id}/set-main")]
        public async Task<IActionResult> SetMainWallet(Guid id)
        {
            var userId = GetUserIdFromToken();

            // Pobierz użytkownika oraz portfel
            var user = await _context.Users
                .Include(u => u.Wallets)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return Unauthorized("Nie znaleziono użytkownika.");

            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.Id == id && (w.CreatedByUserId == userId || 
                                                 w.Members.Any(m => m.UserId == userId)));

            if (wallet == null)
                return NotFound("Nie znaleziono portfela lub brak uprawnień.");

            // Ustaw jako główny portfel
            user.MainWalletId = wallet.Id;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Portfel został ustawiony jako główny."
            });
        }


    }
}