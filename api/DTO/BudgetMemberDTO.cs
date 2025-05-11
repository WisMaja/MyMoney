using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.DTO
{   
    public class CreateBudgetMemberDto
    {
        public Guid BudgetId { get; set; }
        public Guid UserId { get; set; }
        public string Role { get; set; } = "";
    }

    public class UpdateBudgetMemberDto
    {
        public string Role { get; set; } = "";
    }
    
}