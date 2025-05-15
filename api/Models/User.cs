namespace api.Models;

public class User
{
    public int Id { get; set; }
    public string? Email { get; set; }
    public string? HashedPassword { get; set; }
    //public string? RefreshToken { get; set; }
    //public DateTime? RefreshTokenExpiration { get; set; }
}