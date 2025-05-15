using Microsoft.AspNetCore.Mvc;
using api.Database;
using api.Models;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // ścieżka: /api/user
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

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
