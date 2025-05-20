namespace api.Dtos.User
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string? FullName { get; set; }
        public Guid? MainWalletId { get; set; }
    }
}