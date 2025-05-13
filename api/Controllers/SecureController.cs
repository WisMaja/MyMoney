using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SecureController : ControllerBase
    {
        // 🔒 Endpoint dostępny tylko po zalogowaniu z ważnym JWT
        [HttpGet("profile")]
        [Authorize]
        public IActionResult GetProfile()
        {
            // Zwraca informacje z tokena (np. sub = user id w Supabase)
            var userId = User.FindFirst("sub")?.Value;
            return Ok(new
            {
                Message = "Token działa ✅",
                SupabaseUserId = userId
            });
        }

        // 🔓 Publiczny endpoint
        [HttpGet("public")]
        public IActionResult GetPublic()
        {
            return Ok(new
            {
                Message = "To jest publiczne 🔓"
            });
        }
    }
}
