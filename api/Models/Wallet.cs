using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace api.Models
{
    public enum WalletType
    {
        Personal,
        Savings,
        Travel
    }
    public class Wallet
    {
        public Guid Id { get; set; }

        [Required, MaxLength(100)]
        public required string Name { get; set; }

        public WalletType Type { get; set; }

        [MaxLength(10)]
        public string Currency { get; set; } = "PLN";

        public Guid CreatedByUserId { get; set; }
        public required User CreatedByUser { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public required ICollection<Transaction> Transactions { get; set; }
        public required ICollection<WalletMember> Members { get; set; }
    }
}