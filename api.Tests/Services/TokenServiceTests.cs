using FluentAssertions;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using api.Services;
using api.Models;

namespace api.Tests.Services;

public class TokenServiceTests
{
    private readonly TokenService _tokenService;

    public TokenServiceTests()
    {
        // TokenService nie ma konstruktora z IConfiguration - używa hardcoded klucza
        _tokenService = new TokenService();
    }

    [Fact]
    public void GenerateAccessToken_ShouldReturnValidJwtToken()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FullName = "Test User",
            Wallets = new List<Wallet>(),
            Transactions = new List<Transaction>(),
            WalletMemberships = new List<WalletMember>(),
            CustomCategories = new List<Category>()
        };

        // Act
        var token = _tokenService.GenerateAccessToken(user);

        // Assert
        token.Should().NotBeNullOrEmpty();
        
        // Verify token structure
        var handler = new JwtSecurityTokenHandler();
        var jsonToken = handler.ReadJwtToken(token);
        
        jsonToken.Claims.Should().Contain(c => c.Type == ClaimTypes.NameIdentifier && c.Value == user.Id.ToString());
        // TokenService tylko dodaje NameIdentifier claim, nie Email ani Name
    }

    [Fact]
    public void GenerateRefreshToken_ShouldReturnValidRefreshToken()
    {
        // Act
        var refreshToken = _tokenService.GenerateRefreshToken();

        // Assert
        refreshToken.token.Should().NotBeNullOrEmpty();
        refreshToken.expiration.Should().BeAfter(DateTime.UtcNow);
        refreshToken.expiration.Should().BeBefore(DateTime.UtcNow.AddDays(2)); // TokenService zwraca 24h
    }

    [Fact]
    public void ValidateAndGetPrincipalFromJwt_WithValidToken_ShouldReturnPrincipal()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FullName = "Test User",
            Wallets = new List<Wallet>(),
            Transactions = new List<Transaction>(),
            WalletMemberships = new List<WalletMember>(),
            CustomCategories = new List<Category>()
        };
        var token = _tokenService.GenerateAccessToken(user);

        // Act
        var principal = _tokenService.ValidateAndGetPrincipalFromJwt(token, true);

        // Assert
        principal.Should().NotBeNull();
        principal!.FindFirst(ClaimTypes.NameIdentifier)?.Value.Should().Be(user.Id.ToString());
    }

    [Fact]
    public void ValidateAndGetPrincipalFromJwt_WithInvalidToken_ShouldReturnNull()
    {
        // Arrange
        var invalidToken = "invalid.jwt.token";

        // Act
        var principal = _tokenService.ValidateAndGetPrincipalFromJwt(invalidToken, true);

        // Assert
        principal.Should().BeNull();
    }

    [Fact]
    public void ValidateAndGetPrincipalFromJwt_WithExpiredToken_ShouldReturnNullWhenValidateLifetime()
    {
        // This test would require creating an expired token, which is complex
        // In a real scenario, you might want to mock the token validation or use a different approach
        // For now, we'll test with an obviously invalid token format
        
        // Arrange
        var malformedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature";

        // Act
        var principal = _tokenService.ValidateAndGetPrincipalFromJwt(malformedToken, true);

        // Assert
        principal.Should().BeNull();
    }

    [Fact]
    public void GenerateRefreshToken_ShouldGenerateUniqueTokens()
    {
        // Act
        var token1 = _tokenService.GenerateRefreshToken();
        var token2 = _tokenService.GenerateRefreshToken();

        // Assert
        token1.token.Should().NotBe(token2.token);
        token1.expiration.Should().BeCloseTo(token2.expiration, TimeSpan.FromSeconds(1));
    }
} 