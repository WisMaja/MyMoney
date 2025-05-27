using Microsoft.AspNetCore.Mvc;
using FluentAssertions;
using Moq;
using api.Controllers;
using api.Tests.Helpers;
using api.Dtos.User;
using api.Services;
using api.Models;

namespace api.Tests.Controllers;

public class AuthControllerTests : IDisposable
{
    private readonly AuthController _controller;
    private readonly Database.AppDbContext _context;
    private readonly Mock<ITokenService> _mockTokenService;

    public AuthControllerTests()
    {
        _context = TestDbContextFactory.CreateInMemoryContext();
        _mockTokenService = new Mock<ITokenService>();
        _controller = new AuthController(_mockTokenService.Object, _context);
    }

    [Fact]
    public async Task RegisterAsync_WithValidData_ShouldCreateUserAndWallet()
    {
        // Arrange
        var registerDto = new RegisterRequestDto
        {
            Email = "newuser@example.com",
            Password = "Password123!"
        };

        // Act
        var result = await _controller.RegisterAsync(registerDto);

        // Assert
        result.Should().BeOfType<NoContentResult>();

        // Verify user was created
        var user = _context.Users.FirstOrDefault(u => u.Email == registerDto.Email);
        user.Should().NotBeNull();
        user!.Email.Should().Be(registerDto.Email);
        user.HashedPassword.Should().NotBeNullOrEmpty();

        // Verify main wallet was created
        user.MainWalletId.Should().NotBeNull();
        var mainWallet = _context.Wallets.FirstOrDefault(w => w.Id == user.MainWalletId);
        mainWallet.Should().NotBeNull();
        mainWallet!.Name.Should().Be("Main Wallet");
        mainWallet.CreatedByUserId.Should().Be(user.Id);
    }

    [Fact]
    public async Task RegisterAsync_WithExistingEmail_ShouldReturnConflict()
    {
        // Arrange
        var existingUser = new User
        {
            Email = "existing@example.com",
            HashedPassword = "hashedpassword",
            CreatedAt = DateTime.UtcNow,
            Wallets = new List<Wallet>(),
            Transactions = new List<Transaction>(),
            WalletMemberships = new List<WalletMember>(),
            CustomCategories = new List<Category>()
        };
        _context.Users.Add(existingUser);
        await _context.SaveChangesAsync();

        var registerDto = new RegisterRequestDto
        {
            Email = "existing@example.com",
            Password = "Password123!"
        };

        // Act
        var result = await _controller.RegisterAsync(registerDto);

        // Assert
        result.Should().BeOfType<ConflictObjectResult>();
        var conflictResult = result as ConflictObjectResult;
        conflictResult!.Value.Should().Be("Użytkownik o tym emailu już istnieje");
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnTokens()
    {
        // Arrange
        var user = new User
        {
            Email = "test@example.com",
            HashedPassword = new Microsoft.AspNetCore.Identity.PasswordHasher<User>()
                .HashPassword(null!, "Password123!"),
            CreatedAt = DateTime.UtcNow,
            Wallets = new List<Wallet>(),
            Transactions = new List<Transaction>(),
            WalletMemberships = new List<WalletMember>(),
            CustomCategories = new List<Category>()
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var loginDto = new LoginRequestDto
        {
            Email = "test@example.com",
            Password = "Password123!"
        };

        var mockRefreshToken = (token: "refresh_token_123", expiration: DateTime.UtcNow.AddDays(7));
        _mockTokenService.Setup(x => x.GenerateRefreshToken()).Returns(mockRefreshToken);
        _mockTokenService.Setup(x => x.GenerateAccessToken(It.IsAny<User>())).Returns("access_token_123");

        // Act
        var result = await _controller.LoginAsync(loginDto);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        var tokenResponse = okResult!.Value.Should().BeOfType<TokenResponseDto>().Subject;
        
        tokenResponse.AccessToken.Should().Be("access_token_123");
        tokenResponse.RefreshToken.Should().Be("refresh_token_123");

        // Verify refresh token was saved to user
        var updatedUser = await _context.Users.FindAsync(user.Id);
        updatedUser!.RefreshToken.Should().Be("refresh_token_123");
    }

    [Fact]
    public async Task LoginAsync_WithInvalidEmail_ShouldReturnUnauthorized()
    {
        // Arrange
        var loginDto = new LoginRequestDto
        {
            Email = "nonexistent@example.com",
            Password = "Password123!"
        };

        // Act
        var result = await _controller.LoginAsync(loginDto);

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ShouldReturnUnauthorized()
    {
        // Arrange
        var user = new User
        {
            Email = "test@example.com",
            HashedPassword = new Microsoft.AspNetCore.Identity.PasswordHasher<User>()
                .HashPassword(null!, "CorrectPassword123!"),
            CreatedAt = DateTime.UtcNow,
            Wallets = new List<Wallet>(),
            Transactions = new List<Transaction>(),
            WalletMemberships = new List<WalletMember>(),
            CustomCategories = new List<Category>()
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var loginDto = new LoginRequestDto
        {
            Email = "test@example.com",
            Password = "WrongPassword123!"
        };

        // Act
        var result = await _controller.LoginAsync(loginDto);

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
    }

    [Fact]
    public async Task ChangePassword_WithValidData_ShouldUpdatePassword()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "test@example.com",
            HashedPassword = new Microsoft.AspNetCore.Identity.PasswordHasher<User>()
                .HashPassword(null!, "OldPassword123!"),
            CreatedAt = DateTime.UtcNow,
            Wallets = new List<Wallet>(),
            Transactions = new List<Transaction>(),
            WalletMemberships = new List<WalletMember>(),
            CustomCategories = new List<Category>()
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        JwtTestHelper.SetupControllerWithUser(_controller, userId);

        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = "OldPassword123!",
            NewPassword = "NewPassword123!"
        };

        // Act
        var result = await _controller.ChangePassword(changePasswordDto);

        // Assert
        result.Should().BeOfType<NoContentResult>();

        // Verify password was changed
        var updatedUser = await _context.Users.FindAsync(userId);
        var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
        var verificationResult = hasher.VerifyHashedPassword(updatedUser!, updatedUser!.HashedPassword!, "NewPassword123!");
        verificationResult.Should().Be(Microsoft.AspNetCore.Identity.PasswordVerificationResult.Success);
    }

    [Fact]
    public async Task ChangePassword_WithInvalidCurrentPassword_ShouldReturnBadRequest()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "test@example.com",
            HashedPassword = new Microsoft.AspNetCore.Identity.PasswordHasher<User>()
                .HashPassword(null!, "CorrectPassword123!"),
            CreatedAt = DateTime.UtcNow,
            Wallets = new List<Wallet>(),
            Transactions = new List<Transaction>(),
            WalletMemberships = new List<WalletMember>(),
            CustomCategories = new List<Category>()
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        JwtTestHelper.SetupControllerWithUser(_controller, userId);

        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = "WrongPassword123!",
            NewPassword = "NewPassword123!"
        };

        // Act
        var result = await _controller.ChangePassword(changePasswordDto);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
} 