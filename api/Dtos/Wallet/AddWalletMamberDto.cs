using System.ComponentModel.DataAnnotations;

namespace api.Dtos.Wallet
{
    public class AddWalletMemberDto
    {
        [Required]
        public Guid UserId { get; set; }
        
    }
}