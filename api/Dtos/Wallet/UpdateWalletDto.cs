using api.Models;
using System.ComponentModel.DataAnnotations;

namespace api.Dtos.Wallet
{
    public class UpdateWalletDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        public WalletType Type { get; set; }

        [MaxLength(10)]
        public string Currency { get; set; }
    }
}