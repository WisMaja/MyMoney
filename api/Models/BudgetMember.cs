using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("budget_members")]
    public class BudgetMember
    {
        [Column("budget_id")]
        public Guid BudgetId { get; set; }

        [Column("user_id")]
        public Guid UserId { get; set; }

        [Column("role")]
        public string Role { get; set; } = "";

        [Column("joined_at")]
        public DateTime JoinedAt { get; set; }

        //RELACJE
        [ForeignKey("BudgetId")]
        public Budget Budget { get; set; } = null!;

        [ForeignKey("UserId")]
        public Profile User { get; set; } = null!;
    }
}