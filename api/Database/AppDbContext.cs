using Microsoft.EntityFrameworkCore;
using api.Models;

namespace api.Database
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<User> Users { get; set; }
        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<WalletMember> WalletMembers { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Category> Categories { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Precyzja dla pieniędzy
            modelBuilder.Entity<Transaction>()
                .Property(t => t.Amount)
                .HasPrecision(18, 2);

            // Ustawienie głównego portfela użytkownika (bez cykli kaskadowych)
            modelBuilder.Entity<User>()
                .HasOne(u => u.MainWallet)
                .WithMany()
                .HasForeignKey(u => u.MainWalletId)
                .OnDelete(DeleteBehavior.SetNull);

            // Relacja Wallet.CreatedByUser — ogranicz kaskadę, aby uniknąć konfliktów
            modelBuilder.Entity<Wallet>()
                .HasOne(w => w.CreatedByUser)
                .WithMany(u => u.Wallets)
                .HasForeignKey(w => w.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            //WalletMembers: klucz złożony
            modelBuilder.Entity<WalletMember>()
                .HasKey(wm => new { wm.WalletId, wm.UserId });

            // WalletMember ↔ User
            modelBuilder.Entity<WalletMember>()
                .HasOne(wm => wm.User)
                .WithMany(u => u.WalletMemberships)
                .HasForeignKey(wm => wm.UserId)
                .OnDelete(DeleteBehavior.Restrict); 

            // WalletMember ↔ Wallet
            modelBuilder.Entity<WalletMember>()
                .HasOne(wm => wm.Wallet)
                .WithMany(w => w.Members)
                .HasForeignKey(wm => wm.WalletId)
                .OnDelete(DeleteBehavior.Cascade); 

            // Unikalna kategoria użytkownika (lub globalna)
            modelBuilder.Entity<Category>()
                .HasIndex(c => new { c.Name, c.UserId })
                .IsUnique();
        }
    }
}
