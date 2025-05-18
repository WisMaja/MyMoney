namespace api.Dtos.Category
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public bool IsGlobal { get; set; } // UserId == null
    }
}