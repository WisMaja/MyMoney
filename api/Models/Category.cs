using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("categories")]
    public class Category
    {
        [Key]
        [Column("category_id")]
        public Guid CategoryId { get; set; }

        [Column("name")]
        public string Name { get; set; } = "";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        //RELACJE
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}