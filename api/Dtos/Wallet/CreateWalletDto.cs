using api.Models;
using System.ComponentModel.DataAnnotations;

namespace api.Dtos.Wallet
{
    public class CreateWalletDto
    {
        // Optional ID field - used when creating a wallet with a specific ID
        public string? Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        public WalletType Type { get; set; } = WalletType.Personal;

        [MaxLength(10)]
        public string Currency { get; set; } = "PLN";

        public decimal InitialBalance { get; set; } = 0;
    }
}