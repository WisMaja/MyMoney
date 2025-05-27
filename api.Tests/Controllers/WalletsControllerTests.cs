using Microsoft.AspNetCore.Mvc;
using FluentAssertions;
using api.Controllers;
using api.Tests.Helpers;
using api.Dtos.Wallet;
using api.Models;

namespace api.Tests.Controllers;

public class WalletsControllerTests : IDisposable
{
    private readonly WalletsController _controller;
    private readonly Database.AppDbContext _context;
    private readonly Guid _testUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public WalletsControllerTests()
    {
        _context = TestDbContextFactory.CreateContextWithTestData();
        _controller = new WalletsController(_context);
        JwtTestHelper.SetupControllerWithUser(_controller, _testUserId);
    }

    [Fact]
    public async Task GetUserWallets_ShouldReturnUserWallets()
    {
        // Act
        var result = await _controller.GetUserWallets();

        // Assert
        result.Should().BeOfType<ActionResult<IEnumerable<WalletDto>>>();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var wallets = okResult.Value.Should().BeAssignableTo<IEnumerable<WalletDto>>().Subject;
        
        wallets.Should().HaveCount(2);
        wallets.Should().Contain(w => w.Name == "Main Wallet");
        wallets.Should().Contain(w => w.Name == "Savings");
    }

    [Fact]
    public async Task GetWallet_WithValidId_ShouldReturnWallet()
    {
        // Arrange
        var walletId = Guid.Parse("55555555-5555-5555-5555-555555555555");

        // Act
        var result = await _controller.GetWallet(walletId);

        // Assert
        result.Should().BeOfType<ActionResult<WalletDto>>();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var wallet = okResult.Value.Should().BeOfType<WalletDto>().Subject;
        
        wallet.Id.Should().Be(walletId);
        wallet.Name.Should().Be("Main Wallet");
        wallet.Currency.Should().Be("PLN");
        wallet.InitialBalance.Should().Be(1000);
    }

    [Fact]
    public async Task GetWallet_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var invalidWalletId = Guid.NewGuid();

        // Act
        var result = await _controller.GetWallet(invalidWalletId);

        // Assert
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task CreateWallet_WithValidData_ShouldCreateWallet()
    {
        // Arrange
        var createDto = new CreateWalletDto
        {
            Name = "Test Wallet",
            Type = WalletType.Personal,
            Currency = "USD",
            InitialBalance = 500
        };

        // Act
        var result = await _controller.CreateWallet(createDto);

        // Assert
        result.Should().BeOfType<ActionResult<WalletDto>>();
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var wallet = createdResult.Value.Should().BeOfType<WalletDto>().Subject;
        
        wallet.Name.Should().Be("Test Wallet");
        wallet.Currency.Should().Be("USD");
        wallet.InitialBalance.Should().Be(500);
        wallet.CurrentBalance.Should().Be(500);

        // Verify wallet was saved to database
        var savedWallet = await _context.Wallets.FindAsync(wallet.Id);
        savedWallet.Should().NotBeNull();
        savedWallet!.Name.Should().Be("Test Wallet");
    }

    [Fact]
    public async Task GetWalletBalance_WithValidId_ShouldReturnBalance()
    {
        // Arrange
        var walletId = Guid.Parse("55555555-5555-5555-5555-555555555555");

        // Act
        var result = await _controller.GetWalletBalance(walletId);

        // Assert
        result.Should().BeOfType<ActionResult<object>>();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var balance = okResult.Value;
        
        balance.Should().NotBeNull();
        // The balance object should contain CurrentBalance, TotalIncome, TotalExpenses
        var balanceType = balance!.GetType();
        balanceType.GetProperty("CurrentBalance").Should().NotBeNull();
        balanceType.GetProperty("TotalIncome").Should().NotBeNull();
        balanceType.GetProperty("TotalExpenses").Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateWallet_WithValidData_ShouldUpdateWallet()
    {
        // Arrange
        var walletId = Guid.Parse("55555555-5555-5555-5555-555555555555");
        var updateDto = new UpdateWalletDto
        {
            Name = "Updated Wallet",
            Currency = "EUR",
            InitialBalance = 2000
        };

        // Act
        var result = await _controller.UpdateWallet(walletId, updateDto);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        
        // Verify wallet was updated in database
        var updatedWallet = await _context.Wallets.FindAsync(walletId);
        updatedWallet.Should().NotBeNull();
        updatedWallet!.Name.Should().Be("Updated Wallet");
        updatedWallet.Currency.Should().Be("EUR");
        updatedWallet.InitialBalance.Should().Be(2000);
    }

    [Fact]
    public async Task DeleteWallet_WithValidId_ShouldDeleteWallet()
    {
        // Arrange
        var walletId = Guid.Parse("66666666-6666-6666-6666-666666666666"); // Savings wallet

        // Act
        var result = await _controller.DeleteWallet(walletId);

        // Assert
        result.Should().BeOfType<NoContentResult>();
        
        // Verify wallet was deleted from database
        var deletedWallet = await _context.Wallets.FindAsync(walletId);
        deletedWallet.Should().BeNull();
    }

    [Fact]
    public async Task DeleteWallet_WithMainWallet_ShouldReturnBadRequest()
    {
        // Arrange
        var mainWalletId = Guid.Parse("55555555-5555-5555-5555-555555555555");

        // Act
        var result = await _controller.DeleteWallet(mainWalletId);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task SetMainWallet_WithValidId_ShouldSetMainWallet()
    {
        // Arrange
        var walletId = Guid.Parse("66666666-6666-6666-6666-666666666666");

        // Act
        var result = await _controller.SetMainWallet(walletId);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        
        // Verify main wallet was updated in database
        var user = await _context.Users.FindAsync(_testUserId);
        user.Should().NotBeNull();
        user!.MainWalletId.Should().Be(walletId);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
} 