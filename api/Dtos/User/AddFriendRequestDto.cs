namespace api.Dtos.User
{
    public class AddFriendRequestDto
    {
        public Guid WalletId { get; set; } // ID portfela
        public string FriendEmail { get; set; } = string.Empty; // E-mail znajomego
    }
}