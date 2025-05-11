using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Models
{
    [Table("invitations")]
    public class Invitation
    {
        [Key]
        [Column("invitation_id")]
        public Guid InvitationId { get; set; }

        [Column("budget_id")]
        public Guid BudgetId { get; set; }

        [Column("invited_email")]
        public string InvitedEmail { get; set; } = "";

        [Column("inviter_id")]
        public Guid InviterId { get; set; }

        [Column("status")]
        public string Status { get; set; } = "";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("expires_at")]
        public DateTime ExpiresAt { get; set; }
        
        //RELACJE
        [ForeignKey("BudgetId")]
        public Budget Budget { get; set; } = null!;

        [ForeignKey("InviterId")]
        public Profile Inviter { get; set; } = null!;
    }

}