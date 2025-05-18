using System;
using api.Models;

namespace api.Dtos.Transaction
{
    public class TransactionDto
    {
        public Guid Id { get; set; }
        public Guid WalletId { get; set; }
        public Guid UserId { get; set; }
        public Guid? CategoryId { get; set; }

        public decimal Amount { get; set; }
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}