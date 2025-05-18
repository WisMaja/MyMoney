using System.ComponentModel.DataAnnotations;

namespace api.Dtos.Wallet
{
    public class SetManualBalanceDto
    {
        [Required]
        public decimal Balance { get; set; }
    }
}