using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.DTO
{
    public class CreateBudgetDto
    {
        public string Name { get; set; } = "";
        public Guid CreatorId { get; set; }
    }

    public class UpdateBudgetDto
    {
        public string Name { get; set; } = "";
    }

}