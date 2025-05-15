using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace api.Models
{
    public class Category
    {
        public Guid Id { get; set; }

        [Required, MaxLength(100)]
        public required string Name { get; set; }

        public Guid? UserId { get; set; } // NULL = global category
        public required User User { get; set; }

        public required ICollection<Transaction> Transactions { get; set; }
        }
}