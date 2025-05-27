using Microsoft.AspNetCore.Mvc;
using FluentAssertions;
using api.Controllers;
using api.Tests.Helpers;

namespace api.Tests.Controllers
{
    public class SecureControllerTests
    {
        private readonly SecureController _controller;
        private readonly Guid _userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

        public SecureControllerTests()
        {
            _controller = new SecureController();
        }

        [Fact]
        public void GetProfile_WithAuthenticatedUser_ShouldReturnUserInfo()
        {
            // Arrange
            JwtTestHelper.SetupControllerWithUser(_controller, _userId);

            // Act
            var result = _controller.GetProfile();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult!.Value.Should().NotBeNull();
        }

        [Fact]
        public void GetPublic_ShouldReturnPublicMessage()
        {
            // Act
            var result = _controller.GetPublic();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult!.Value.Should().NotBeNull();
        }

        [Fact]
        public void GetPublic_ShouldNotRequireAuthentication()
        {
            // This test verifies that GetPublic works without any authentication setup
            
            // Act
            var result = _controller.GetPublic();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult!.Value.Should().NotBeNull();
        }
    }
} 