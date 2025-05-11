using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.DTO
{
    public class CreateInvitationDto
    {
        public Guid BudgetId { get; set; }
        public string InvitedEmail { get; set; } = "";
        public Guid InviterId { get; set; }
        public string Status { get; set; } = "";
        public DateTime ExpiresAt { get; set; }
    }

    public class UpdateInvitationDto
    {
        public string Status { get; set; } = "";
        public DateTime ExpiresAt { get; set; }
    }
}