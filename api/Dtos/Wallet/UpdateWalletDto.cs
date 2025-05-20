using api.Models;
using System.ComponentModel.DataAnnotations;

namespace api.Dtos.Wallet
{
    public class UpdateWalletDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } // Nazwa portfela

        [Required]
        public WalletType Type { get; set; } // Typ portfela: Personal, Savings, Travel itp.

        [Required]
        [MaxLength(10)]
        public string Currency { get; set; } // Waluta portfela np. PLN, USD

        [Required]
        [Range(0, 1000000)]
        public decimal InitialBalance { get; set; } // Początkowy balans portfela
    }
}