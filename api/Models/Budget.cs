using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("budgets")]
    public class Budget
    {
        [Key]
        [Column("budget_id")]
        public Guid BudgetId { get; set; }

        [Column("name")]
        public string Name { get; set; } = "";

        [Column("creator_id")]
        public Guid CreatorId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        //RELACJE
        [ForeignKey("CreatorId")]
        public Profile Creator { get; set; } = null!;

        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
        public ICollection<BudgetMember> Members { get; set; } = new List<BudgetMember>();
        public ICollection<Invitation> Invitations { get; set; } = new List<Invitation>();
    }
}