using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FluentAssertions;
using api.Controllers;
using api.Database;
using api.Models;
using api.Dtos.User;
using api.Tests.Helpers;
using Microsoft.AspNetCore.Http;
using Moq;

namespace api.Tests.Controllers
{
    public class UsersControllerTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly UsersController _controller;
        private readonly Guid _userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        private readonly Guid _otherUserId = Guid.Parse("22222222-2222-2222-2222-222222222222");

        public UsersControllerTests()
        {
            _context = TestDbContextFactory.CreateInMemoryContext();
            _controller = new UsersController(_context);
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
                FullName = "Test User",
                ProfileImageUrl = "/images/default.jpg",
                MainWalletId = null,
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
                FullName = "Other User",
                ProfileImageUrl = null,
                MainWalletId = null,
                Wallets = new List<Wallet>(),
                Transactions = new List<Transaction>(),
                WalletMemberships = new List<WalletMember>(),
                CustomCategories = new List<Category>()
            };

            _context.Users.AddRange(user, otherUser);
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetCurrentUser_ShouldReturnCurrentUserData()
        {
            // Act
            var result = await _controller.GetCurrentUser();

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
            var okResult = result.Result as OkObjectResult;
            var userDto = okResult!.Value as UserDto;
            
            userDto.Should().NotBeNull();
            userDto!.Id.Should().Be(_userId);
            userDto.Email.Should().Be("test@example.com");
            userDto.FullName.Should().Be("Test User");
            userDto.ProfileImageUrl.Should().Be("/images/default.jpg");
        }

        [Fact]
        public async Task GetCurrentUser_WithNonExistentUser_ShouldReturnNotFound()
        {
            // Arrange - Setup controller with non-existent user
            var nonExistentUserId = Guid.NewGuid();
            var newController = new UsersController(_context);
            JwtTestHelper.SetupControllerWithUser(newController, nonExistentUserId);

            // Act
            var result = await newController.GetCurrentUser();

            // Assert
            result.Result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task UpdateCurrentUser_WithValidData_ShouldUpdateUser()
        {
            // Arrange
            var updateDto = new UpdateUserDto
            {
                FullName = "Updated Name",
                Email = "updated@example.com",
                ProfileImageUrl = "/images/updated.jpg"
            };

            // Act
            var result = await _controller.UpdateCurrentUser(updateDto);

            // Assert
            result.Should().BeOfType<NoContentResult>();

            // Verify in database
            var userInDb = await _context.Users.FindAsync(_userId);
            userInDb!.FullName.Should().Be("Updated Name");
            userInDb.Email.Should().Be("updated@example.com");
            userInDb.ProfileImageUrl.Should().Be("/images/updated.jpg");
        }

        [Fact]
        public async Task UpdateCurrentUser_WithPartialData_ShouldUpdateOnlyProvidedFields()
        {
            // Arrange
            var updateDto = new UpdateUserDto
            {
                FullName = "Only Name Updated",
                Email = null,
                ProfileImageUrl = null
            };

            // Act
            var result = await _controller.UpdateCurrentUser(updateDto);

            // Assert
            result.Should().BeOfType<NoContentResult>();

            // Verify in database
            var userInDb = await _context.Users.FindAsync(_userId);
            userInDb!.FullName.Should().Be("Only Name Updated");
            userInDb.Email.Should().Be("test@example.com"); // Should remain unchanged
            userInDb.ProfileImageUrl.Should().Be("/images/default.jpg"); // Should remain unchanged
        }

        [Fact]
        public async Task UpdateCurrentUser_WithEmptyStrings_ShouldNotUpdateFields()
        {
            // Arrange
            var updateDto = new UpdateUserDto
            {
                FullName = "",
                Email = "",
                ProfileImageUrl = ""
            };

            // Act
            var result = await _controller.UpdateCurrentUser(updateDto);

            // Assert
            result.Should().BeOfType<NoContentResult>();

            // Verify in database - fields should remain unchanged
            var userInDb = await _context.Users.FindAsync(_userId);
            userInDb!.FullName.Should().Be("Test User");
            userInDb.Email.Should().Be("test@example.com");
            userInDb.ProfileImageUrl.Should().Be("/images/default.jpg");
        }

        [Fact]
        public async Task UpdateCurrentUser_WithNonExistentUser_ShouldReturnNotFound()
        {
            // Arrange
            var nonExistentUserId = Guid.NewGuid();
            var newController = new UsersController(_context);
            JwtTestHelper.SetupControllerWithUser(newController, nonExistentUserId);
            
            var updateDto = new UpdateUserDto
            {
                FullName = "Updated Name"
            };

            // Act
            var result = await newController.UpdateCurrentUser(updateDto);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task UpdateProfileImage_WithValidFile_ShouldUpdateProfileImage()
        {
            // Arrange
            var mockFile = new Mock<IFormFile>();
            var content = "fake image content";
            var fileName = "test.jpg";
            var ms = new MemoryStream();
            var writer = new StreamWriter(ms);
            writer.Write(content);
            writer.Flush();
            ms.Position = 0;

            mockFile.Setup(_ => _.OpenReadStream()).Returns(ms);
            mockFile.Setup(_ => _.FileName).Returns(fileName);
            mockFile.Setup(_ => _.Length).Returns(ms.Length);
            mockFile.Setup(_ => _.ContentType).Returns("image/jpeg");

            // Act
            var result = await _controller.UpdateProfileImage(mockFile.Object);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult!.Value.Should().NotBeNull();

            // Verify user was updated in database
            var userInDb = await _context.Users.FindAsync(_userId);
            userInDb!.ProfileImageUrl.Should().NotBeNull();
            userInDb.ProfileImageUrl.Should().StartWith("/uploads/profile-images/");
        }

        [Fact]
        public async Task UpdateProfileImage_WithNullFile_ShouldReturnBadRequest()
        {
            // Act
            var result = await _controller.UpdateProfileImage(null!);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
            var badRequestResult = result as BadRequestObjectResult;
            badRequestResult!.Value.Should().Be("No file uploaded.");
        }

        [Fact]
        public async Task UpdateProfileImage_WithEmptyFile_ShouldReturnBadRequest()
        {
            // Arrange
            var mockFile = new Mock<IFormFile>();
            mockFile.Setup(_ => _.Length).Returns(0);

            // Act
            var result = await _controller.UpdateProfileImage(mockFile.Object);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
            var badRequestResult = result as BadRequestObjectResult;
            badRequestResult!.Value.Should().Be("No file uploaded.");
        }

        [Fact]
        public async Task UpdateProfileImage_WithTooLargeFile_ShouldReturnBadRequest()
        {
            // Arrange
            var mockFile = new Mock<IFormFile>();
            mockFile.Setup(_ => _.Length).Returns(6 * 1024 * 1024); // 6MB - over the 5MB limit
            mockFile.Setup(_ => _.ContentType).Returns("image/jpeg");

            // Act
            var result = await _controller.UpdateProfileImage(mockFile.Object);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
            var badRequestResult = result as BadRequestObjectResult;
            badRequestResult!.Value.Should().Be("File size too large. Maximum size is 5MB.");
        }

        [Fact]
        public async Task UpdateProfileImage_WithInvalidFileType_ShouldReturnBadRequest()
        {
            // Arrange
            var mockFile = new Mock<IFormFile>();
            mockFile.Setup(_ => _.Length).Returns(1024);
            mockFile.Setup(_ => _.ContentType).Returns("text/plain");

            // Act
            var result = await _controller.UpdateProfileImage(mockFile.Object);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
            var badRequestResult = result as BadRequestObjectResult;
            badRequestResult!.Value.Should().Be("Invalid file type. Only JPEG, PNG and GIF are allowed.");
        }

        [Fact]
        public async Task UpdateProfileImage_WithNonExistentUser_ShouldReturnNotFound()
        {
            // Arrange
            var nonExistentUserId = Guid.NewGuid();
            var newController = new UsersController(_context);
            JwtTestHelper.SetupControllerWithUser(newController, nonExistentUserId);

            var mockFile = new Mock<IFormFile>();
            mockFile.Setup(_ => _.Length).Returns(1024);
            mockFile.Setup(_ => _.ContentType).Returns("image/jpeg");

            // Act
            var result = await newController.UpdateProfileImage(mockFile.Object);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task DeleteCurrentUser_ShouldDeleteUser()
        {
            // Act
            var result = await _controller.DeleteCurrentUser();

            // Assert
            result.Should().BeOfType<NoContentResult>();

            // Verify deletion in database
            var userInDb = await _context.Users.FindAsync(_userId);
            userInDb.Should().BeNull();
        }

        [Fact]
        public async Task DeleteCurrentUser_WithNonExistentUser_ShouldReturnNotFound()
        {
            // Arrange
            var nonExistentUserId = Guid.NewGuid();
            var newController = new UsersController(_context);
            JwtTestHelper.SetupControllerWithUser(newController, nonExistentUserId);

            // Act
            var result = await newController.DeleteCurrentUser();

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
} 