using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FluentAssertions;
using api.Controllers;
using api.Database;
using api.Models;
using api.Dtos.Category;
using api.Tests.Helpers;

namespace api.Tests.Controllers
{
    public class CategoriesControllerTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly CategoriesController _controller;
        private readonly Guid _userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        private readonly Guid _otherUserId = Guid.Parse("22222222-2222-2222-2222-222222222222");

        public CategoriesControllerTests()
        {
            _context = TestDbContextFactory.CreateInMemoryContext();
            _controller = new CategoriesController(_context);
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

            var globalCategory = new Category
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                Name = "Global Category",
                UserId = null,
                User = null,
                Transactions = new List<Transaction>()
            };

            var userCategory = new Category
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                Name = "User Category",
                UserId = _userId,
                User = user,
                Transactions = new List<Transaction>()
            };

            var otherUserCategory = new Category
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
                Name = "Other User Category",
                UserId = _otherUserId,
                User = otherUser,
                Transactions = new List<Transaction>()
            };

            _context.Users.AddRange(user, otherUser);
            _context.Categories.AddRange(globalCategory, userCategory, otherUserCategory);
            _context.SaveChanges();
        }

        [Fact]
        public async Task CreateCategory_WithValidData_ShouldCreateCategory()
        {
            // Arrange
            var dto = new CreateCategoryDto { Name = "New Category" };

            // Act
            var result = await _controller.CreateCategory(dto);

            // Assert
            result.Should().BeOfType<CreatedAtActionResult>();
            var createdResult = result as CreatedAtActionResult;
            createdResult!.ActionName.Should().Be("GetCategory");
            createdResult.Value.Should().NotBeNull();

            // Verify in database
            var categoryInDb = await _context.Categories
                .FirstOrDefaultAsync(c => c.Name == "New Category" && c.UserId == _userId);
            categoryInDb.Should().NotBeNull();
        }

        [Fact]
        public async Task GetCategory_WithValidUserCategory_ShouldReturnCategory()
        {
            // Arrange
            var categoryId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

            // Act
            var result = await _controller.GetCategory(categoryId);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            var category = okResult!.Value as CategoryDto;
            
            category.Should().NotBeNull();
            category!.Id.Should().Be(categoryId);
            category.Name.Should().Be("User Category");
            category.IsGlobal.Should().BeFalse();
        }

        [Fact]
        public async Task GetCategory_WithValidGlobalCategory_ShouldReturnCategory()
        {
            // Arrange
            var categoryId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");

            // Act
            var result = await _controller.GetCategory(categoryId);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            var category = okResult!.Value as CategoryDto;
            
            category.Should().NotBeNull();
            category!.Id.Should().Be(categoryId);
            category.Name.Should().Be("Global Category");
            category.IsGlobal.Should().BeTrue();
        }

        [Fact]
        public async Task GetCategory_WithOtherUserCategory_ShouldReturnNotFound()
        {
            // Arrange
            var categoryId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");

            // Act
            var result = await _controller.GetCategory(categoryId);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task GetCategory_WithNonExistentCategory_ShouldReturnNotFound()
        {
            // Arrange
            var categoryId = Guid.NewGuid();

            // Act
            var result = await _controller.GetCategory(categoryId);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task GetAll_ShouldReturnUserAndGlobalCategories()
        {
            // Act
            var result = await _controller.GetAll();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            var categories = okResult!.Value as IEnumerable<CategoryDto>;
            
            categories.Should().NotBeNull();
            categories.Should().HaveCount(2); // Global + User category
            
            categories.Should().Contain(c => c.Name == "Global Category" && c.IsGlobal == true);
            categories.Should().Contain(c => c.Name == "User Category" && c.IsGlobal == false);
            categories.Should().NotContain(c => c.Name == "Other User Category");
        }

        [Fact]
        public async Task DeleteCategory_WithValidUserCategory_ShouldDeleteCategory()
        {
            // Arrange
            var categoryId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

            // Act
            var result = await _controller.DeleteCategory(categoryId);

            // Assert
            result.Should().BeOfType<NoContentResult>();

            // Verify deletion in database
            var categoryInDb = await _context.Categories.FindAsync(categoryId);
            categoryInDb.Should().BeNull();
        }

        [Fact]
        public async Task DeleteCategory_WithGlobalCategory_ShouldReturnForbid()
        {
            // Arrange
            var categoryId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");

            // Act
            var result = await _controller.DeleteCategory(categoryId);

            // Assert
            result.Should().BeOfType<ForbidResult>();

            // Verify category still exists
            var categoryInDb = await _context.Categories.FindAsync(categoryId);
            categoryInDb.Should().NotBeNull();
        }

        [Fact]
        public async Task DeleteCategory_WithOtherUserCategory_ShouldReturnForbid()
        {
            // Arrange
            var categoryId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");

            // Act
            var result = await _controller.DeleteCategory(categoryId);

            // Assert
            result.Should().BeOfType<ForbidResult>();

            // Verify category still exists
            var categoryInDb = await _context.Categories.FindAsync(categoryId);
            categoryInDb.Should().NotBeNull();
        }

        [Fact]
        public async Task DeleteCategory_WithNonExistentCategory_ShouldReturnNotFound()
        {
            // Arrange
            var categoryId = Guid.NewGuid();

            // Act
            var result = await _controller.DeleteCategory(categoryId);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task UpdateCategory_WithValidUserCategory_ShouldUpdateCategory()
        {
            // Arrange
            var categoryId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
            var dto = new UpdateCategoryDto { Name = "Updated Category Name" };

            // Act
            var result = await _controller.UpdateCategory(categoryId, dto);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            var category = okResult!.Value as CategoryDto;
            
            category.Should().NotBeNull();
            category!.Id.Should().Be(categoryId);
            category.Name.Should().Be("Updated Category Name");
            category.IsGlobal.Should().BeFalse();

            // Verify in database
            var categoryInDb = await _context.Categories.FindAsync(categoryId);
            categoryInDb!.Name.Should().Be("Updated Category Name");
        }

        [Fact]
        public async Task UpdateCategory_WithGlobalCategory_ShouldReturnForbid()
        {
            // Arrange
            var categoryId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
            var dto = new UpdateCategoryDto { Name = "Updated Name" };

            // Act
            var result = await _controller.UpdateCategory(categoryId, dto);

            // Assert
            result.Should().BeOfType<ForbidResult>();

            // Verify category unchanged
            var categoryInDb = await _context.Categories.FindAsync(categoryId);
            categoryInDb!.Name.Should().Be("Global Category");
        }

        [Fact]
        public async Task UpdateCategory_WithOtherUserCategory_ShouldReturnForbid()
        {
            // Arrange
            var categoryId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");
            var dto = new UpdateCategoryDto { Name = "Updated Name" };

            // Act
            var result = await _controller.UpdateCategory(categoryId, dto);

            // Assert
            result.Should().BeOfType<ForbidResult>();

            // Verify category unchanged
            var categoryInDb = await _context.Categories.FindAsync(categoryId);
            categoryInDb!.Name.Should().Be("Other User Category");
        }

        [Fact]
        public async Task UpdateCategory_WithNonExistentCategory_ShouldReturnNotFound()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            var dto = new UpdateCategoryDto { Name = "Updated Name" };

            // Act
            var result = await _controller.UpdateCategory(categoryId, dto);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
} 