using Microsoft.EntityFrameworkCore;
using api.Models;

namespace api.Database
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<User> Users { get; set;  }
    }
}
