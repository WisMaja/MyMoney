using Microsoft.EntityFrameworkCore;
using api.Models;

namespace api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Transaction> Transactions => Set<Transaction>();
        public DbSet<Budget> Budgets => Set<Budget>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Profile> Profiles => Set<Profile>();
        public DbSet<Invitation> Invitations => Set<Invitation>();
        public DbSet<BudgetMember> BudgetMembers => Set<BudgetMember>();
    }
}
