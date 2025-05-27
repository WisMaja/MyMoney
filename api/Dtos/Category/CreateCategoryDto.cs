using System.ComponentModel.DataAnnotations;

namespace api.Dtos.Category
{
    public class CreateCategoryDto
    {
        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }
    }
}