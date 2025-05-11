using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("profiles")]
    public class Profile
    {
        [Key]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [Column("full_name")]
        public string FullName { get; set; } = "";

        [Column("avatar_url")]
        public string? AvatarUrl { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        //RELACJE
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
        public ICollection<Budget> CreatedBudgets { get; set; } = new List<Budget>();
        public ICollection<BudgetMember> BudgetMemberships { get; set; } = new List<BudgetMember>();
        public ICollection<Invitation> SentInvitations { get; set; } = new List<Invitation>();
    }

}