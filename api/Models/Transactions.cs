using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Models
{
    [Table("transactions")]
    public class Transactions
    {
            [Key]
    [Column("transaction_id")]
    public Guid TransactionId { get; set; }

    [Column("budget_id")]
    public Guid BudgetId { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("category_id")]
    public Guid CategoryId { get; set; }

    [Column("amount")]
    public decimal Amount { get; set; }

    [Column("type")]
    public string Type { get; set; } = "";

    [Column("description")]
    public string? Description { get; set; }

    [Column("transaction_date")]
    public DateTime TransactionDate { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
    }
}