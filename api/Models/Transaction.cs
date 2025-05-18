using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace api.Models
{
    public class Transaction
    {
        public Guid Id { get; set; }

        public Guid WalletId { get; set; }
        public Wallet? Wallet { get; set; }

        public Guid UserId { get; set; }  // who created the transaction
        public User? User { get; set; }

        [Required]
        public decimal Amount { get; set; } // Positive = income, Negative = expense

        public Guid? CategoryId { get; set; }
        public Category? Category { get; set; }

        [MaxLength(255)]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

}