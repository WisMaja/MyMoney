using System.ComponentModel.DataAnnotations;

namespace api.Dtos.Transaction
{
    public class UpdateTransactionDto
    {
        [Required]
        public decimal Amount { get; set; }

        public Guid? CategoryId { get; set; }

        [MaxLength(255)]
        public string? Description { get; set; }
    }
}