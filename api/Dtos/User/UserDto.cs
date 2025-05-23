namespace api.Dtos.User
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? ProfileImageUrl { get; set; }
        public Guid? MainWalletId { get; set; }
    }
}