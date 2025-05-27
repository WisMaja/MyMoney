using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FluentAssertions;
using api.Controllers;
using api.Database;
using api.Models;
using api.Dtos.Transaction;
using api.Tests.Helpers;

namespace api.Tests.Controllers
{
    public class TransactionsControllerTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly TransactionsController _controller;
        private readonly Guid _userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        private readonly Guid _otherUserId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        private readonly Guid _walletId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        private readonly Guid _otherWalletId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        private readonly Guid _categoryId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");

        public TransactionsControllerTests()
        {
            _context = TestDbContextFactory.CreateInMemoryContext();
            _controller = new TransactionsController(_context);
            JwtTestHelper.SetupControllerWithUser(_controller, _userId);
            
            SeedTestData();
        }

        private void SeedTestData()
        {
            var user = new User
            {
                Id = _userId,
                Email = "test@example.com",
                HashedPassword = "hash",
                Wallets = new List<Wallet>(),
                Transactions = new List<Transaction>(),
                WalletMemberships = new List<WalletMember>(),
                CustomCategories = new List<Category>()
            };

            var otherUser = new User
            {
                Id = _otherUserId,
                Email = "other@example.com",
                HashedPassword = "hash",
                Wallets = new List<Wallet>(),
                Transactions = new List<Transaction>(),
                WalletMemberships = new List<WalletMember>(),
                CustomCategories = new List<Category>()
            };

            var wallet = new Wallet
            {
                Id = _walletId,
                Name = "Test Wallet",
                CreatedByUserId = _userId,
                CreatedByUser = user,
                Transactions = new List<Transaction>(),
                Members = new List<WalletMember>()
            };

            var otherWallet = new Wallet
            {
                Id = _otherWalletId,
                Name = "Other Wallet",
                CreatedByUserId = _otherUserId,
                CreatedByUser = otherUser,
                Transactions = new List<Transaction>(),
                Members = new List<WalletMember>()
            };

            var category = new Category
            {
                Id = _categoryId,
                Name = "Test Category",
                UserId = _userId,
                User = user,
                Transactions = new List<Transaction>()
            };

            var incomeTransaction = new Transaction
            {
                Id = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
                Amount = 1000.00m,
                Description = "Salary",
                UserId = _userId,
                User = user,
                WalletId = _walletId,
                Wallet = wallet,
                CategoryId = _categoryId,
                Category = category,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            };

            var expenseTransaction = new Transaction
            {
                Id = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"),
                Amount = -50.00m,
                Description = "Groceries",
                UserId = _userId,
                User = user,
                WalletId = _walletId,
                Wallet = wallet,
                CategoryId = _categoryId,
                Category = category,
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                UpdatedAt = DateTime.UtcNow.AddDays(-2)
            };

            var otherUserTransaction = new Transaction
            {
                Id = Guid.Parse("ffffffff-ffff-ffff-ffff-ffffffffffff"),
                Amount = 500.00m,
                Description = "Other User Income",
                UserId = _otherUserId,
                User = otherUser,
                WalletId = _otherWalletId,
                Wallet = otherWallet,
                CategoryId = null,
                Category = null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.AddRange(user, otherUser);
            _context.Wallets.AddRange(wallet, otherWallet);
            _context.Categories.Add(category);
            _context.Transactions.AddRange(incomeTransaction, expenseTransaction, otherUserTransaction);
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetAll_ShouldReturnUserTransactions()
        {
            // Act
            var result = await _controller.GetAll();

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
            var okResult = result.Result as OkObjectResult;
            var transactions = okResult!.Value as IEnumerable<dynamic>;
            
            transactions.Should().NotBeNull();
            transactions.Should().HaveCount(2); // Only user's transactions
        }

        [Fact]
        public async Task GetIncome_ShouldReturnOnlyIncomeTransactions()
        {
            // Act
            var result = await _controller.GetIncome();

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
            var okResult = result.Result as OkObjectResult;
            var transactions = okResult!.Value as IEnumerable<dynamic>;
            
            transactions.Should().NotBeNull();
            transactions.Should().HaveCount(1); // Only income transaction
        }

        [Fact]
        public async Task GetExpenses_ShouldReturnOnlyExpenseTransactions()
        {
            // Act
            var result = await _controller.GetExpenses();

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
            var okResult = result.Result as OkObjectResult;
            var transactions = okResult!.Value as IEnumerable<dynamic>;
            
            transactions.Should().NotBeNull();
            transactions.Should().HaveCount(1); // Only expense transaction
        }

        [Fact]
        public async Task GetTransactionsByWallet_WithValidWallet_ShouldReturnWalletTransactions()
        {
            // Act
            var result = await _controller.GetTransactionsByWallet(_walletId);

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
            var okResult = result.Result as OkObjectResult;
            var transactions = okResult!.Value as IEnumerable<dynamic>;
            
            transactions.Should().NotBeNull();
            transactions.Should().HaveCount(2); // Both transactions in user's wallet
        }

        [Fact]
        public async Task GetTransactionsByWallet_WithOtherUserWallet_ShouldReturnForbidden()
        {
            // Act
            var result = await _controller.GetTransactionsByWallet(_otherWalletId);

            // Assert
            result.Result.Should().BeOfType<ObjectResult>();
            var objectResult = result.Result as ObjectResult;
            objectResult!.StatusCode.Should().Be(403);
        }

        [Fact]
        public async Task GetTransaction_WithValidId_ShouldReturnTransaction()
        {
            // Arrange
            var transactionId = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd");

            // Act
            var result = await _controller.GetTransaction(transactionId);

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
            var okResult = result.Result as OkObjectResult;
            okResult!.Value.Should().NotBeNull();
        }

        [Fact]
        public async Task GetTransaction_WithOtherUserTransaction_ShouldReturnNotFound()
        {
            // Arrange
            var transactionId = Guid.Parse("ffffffff-ffff-ffff-ffff-ffffffffffff");

            // Act
            var result = await _controller.GetTransaction(transactionId);

            // Assert
            result.Result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task AddIncome_WithValidData_ShouldCreateIncomeTransaction()
        {
            // Arrange
            var dto = new CreateTransactionDto
            {
                WalletId = _walletId,
                CategoryId = _categoryId,
                Amount = 500.00m,
                Description = "Bonus"
            };

            // Act
            var result = await _controller.AddIncome(dto);

            // Assert
            result.Should().BeOfType<CreatedAtActionResult>();
            var createdResult = result as CreatedAtActionResult;
            createdResult!.ActionName.Should().Be("GetTransaction");

            // Verify in database
            var transactionInDb = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Description == "Bonus" && t.UserId == _userId);
            transactionInDb.Should().NotBeNull();
            transactionInDb!.Amount.Should().Be(500.00m); // Positive amount for income
        }

        [Fact]
        public async Task AddExpense_WithValidData_ShouldCreateExpenseTransaction()
        {
            // Arrange
            var dto = new CreateTransactionDto
            {
                WalletId = _walletId,
                CategoryId = _categoryId,
                Amount = 100.00m,
                Description = "Coffee"
            };

            // Act
            var result = await _controller.AddExpense(dto);

            // Assert
            result.Should().BeOfType<CreatedAtActionResult>();
            var createdResult = result as CreatedAtActionResult;
            createdResult!.ActionName.Should().Be("GetTransaction");

            // Verify in database
            var transactionInDb = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Description == "Coffee" && t.UserId == _userId);
            transactionInDb.Should().NotBeNull();
            transactionInDb!.Amount.Should().Be(-100.00m); // Negative amount for expense
        }

        [Fact]
        public async Task AddIncome_WithOtherUserWallet_ShouldReturnForbidden()
        {
            // Arrange
            var dto = new CreateTransactionDto
            {
                WalletId = _otherWalletId,
                CategoryId = _categoryId,
                Amount = 500.00m,
                Description = "Unauthorized Income"
            };

            // Act
            var result = await _controller.AddIncome(dto);

            // Assert
            result.Should().BeOfType<ObjectResult>();
            var objectResult = result as ObjectResult;
            objectResult!.StatusCode.Should().Be(403);
        }

        [Fact]
        public async Task UpdateIncome_WithValidData_ShouldUpdateTransaction()
        {
            // Arrange
            var transactionId = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd");
            var dto = new UpdateTransactionDto
            {
                Amount = 1200.00m,
                CategoryId = _categoryId,
                Description = "Updated Salary"
            };

            // Act
            var result = await _controller.UpdateIncome(transactionId, dto);

            // Assert
            result.Should().BeOfType<NoContentResult>();

            // Verify in database
            var transactionInDb = await _context.Transactions.FindAsync(transactionId);
            transactionInDb!.Amount.Should().Be(1200.00m);
            transactionInDb.Description.Should().Be("Updated Salary");
        }

        [Fact]
        public async Task UpdateExpense_WithValidData_ShouldUpdateTransaction()
        {
            // Arrange
            var transactionId = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee");
            var dto = new UpdateTransactionDto
            {
                Amount = 75.00m,
                CategoryId = _categoryId,
                Description = "Updated Groceries"
            };

            // Act
            var result = await _controller.UpdateExpense(transactionId, dto);

            // Assert
            result.Should().BeOfType<NoContentResult>();

            // Verify in database
            var transactionInDb = await _context.Transactions.FindAsync(transactionId);
            transactionInDb!.Amount.Should().Be(-75.00m); // Should be negative for expense
            transactionInDb.Description.Should().Be("Updated Groceries");
        }

        [Fact]
        public async Task UpdateIncome_WithOtherUserTransaction_ShouldReturnNotFound()
        {
            // Arrange
            var transactionId = Guid.Parse("ffffffff-ffff-ffff-ffff-ffffffffffff");
            var dto = new UpdateTransactionDto
            {
                Amount = 1000.00m,
                Description = "Unauthorized Update"
            };

            // Act
            var result = await _controller.UpdateIncome(transactionId, dto);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task Delete_WithValidTransaction_ShouldDeleteTransaction()
        {
            // Arrange
            var transactionId = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd");

            // Act
            var result = await _controller.Delete(transactionId);

            // Assert
            result.Should().BeOfType<NoContentResult>();

            // Verify deletion in database
            var transactionInDb = await _context.Transactions.FindAsync(transactionId);
            transactionInDb.Should().BeNull();
        }

        [Fact]
        public async Task Delete_WithOtherUserTransaction_ShouldReturnNotFound()
        {
            // Arrange
            var transactionId = Guid.Parse("ffffffff-ffff-ffff-ffff-ffffffffffff");

            // Act
            var result = await _controller.Delete(transactionId);

            // Assert
            result.Should().BeOfType<NotFoundResult>();

            // Verify transaction still exists
            var transactionInDb = await _context.Transactions.FindAsync(transactionId);
            transactionInDb.Should().NotBeNull();
        }

        [Fact]
        public async Task GetIncomeVsExpenseStats_ShouldReturnStatistics()
        {
            // Act
            var result = await _controller.GetIncomeVsExpenseStats(null, null);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult!.Value.Should().NotBeNull();
        }

        [Fact]
        public async Task GetCategoryBreakdown_ShouldReturnCategoryStatistics()
        {
            // Act
            var result = await _controller.GetCategoryBreakdown(null, null);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult!.Value.Should().NotBeNull();
        }

        [Fact]
        public async Task GetStatisticsSummary_ShouldReturnSummaryStatistics()
        {
            // Act
            var result = await _controller.GetStatisticsSummary(null, null);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult!.Value.Should().NotBeNull();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
} 