using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace api.Models
{
public class WalletMember
{
    public Guid WalletId { get; set; }
    public Wallet? Wallet { get; set; }

    public Guid UserId { get; set; }
    public User? User { get; set; }

    // [MaxLength(50)]
    // public string Role { get; set; } = "member"; // optional
}

}