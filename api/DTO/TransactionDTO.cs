using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.DTO
{
    public class CreateTransactionDto
    {
        public Guid BudgetId { get; set; }
        public Guid CategoryId { get; set; }
        public Guid UserId { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; } = "";
        public string? Description { get; set; }
        public DateTime TransactionDate { get; set; }
    }

    public class UpdateTransactionDto : CreateTransactionDto { }
}