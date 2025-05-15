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
            var users = _context.User.ToList();
            return Ok(users);
        }

        // POST: /api/user
        [HttpPost]
        public IActionResult Create(User user)
        {
            _context.User.Add(user);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetAll), new { id = user.Id }, user);
        }
    }
}
