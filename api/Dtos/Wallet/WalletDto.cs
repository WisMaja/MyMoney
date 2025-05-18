using api.Models;

namespace api.Dtos.Wallet
{
    public class WalletDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public WalletType Type { get; set; }
        public string Currency { get; set; }

        public decimal InitialBalance { get; set; }
        public decimal? ManualBalance { get; set; }
        public DateTime? BalanceResetAt { get; set; }

        public decimal CurrentBalance { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}