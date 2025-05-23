namespace api.Models
{

    public class User
    {
        public Guid Id { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? HashedPassword { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiration { get; set; }
        public string? ProfileImageUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastLogin { get; set; } = DateTime.UtcNow;

        public Guid? MainWalletId { get; set; }
        public Wallet? MainWallet { get; set; }

        public required ICollection<Wallet> Wallets { get; set; }
        public required ICollection<Transaction> Transactions { get; set; }
        public required ICollection<WalletMember> WalletMemberships { get; set; }
        public required ICollection<Category> CustomCategories { get; set; }
    }
}