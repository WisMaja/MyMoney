using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using api.Database;
using api.Dtos.Wallet;
using api.Dtos.User;
using api.Models;
using Microsoft.AspNetCore.Hosting;

namespace api.Tests.Integration;

public class WalletsIntegrationTests : IClassFixture<WebApplicationFactory<Program>>, IDisposable
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private string? _accessToken;
    private static readonly string DatabaseName = $"IntegrationTestDb_{Guid.NewGuid()}";

    public WalletsIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing"); // Ustawiam środowisko testowe
            
            builder.ConfigureServices(services =>
            {
                // Remove all existing DbContext and EF related registrations
                var descriptorsToRemove = services.Where(d => 
                    d.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                    d.ServiceType == typeof(AppDbContext) ||
                    (d.ServiceType.IsGenericType && d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>)) ||
                    d.ServiceType == typeof(DbContextOptions) ||
                    d.ImplementationType?.FullName?.Contains("EntityFramework") == true ||
                    d.ServiceType.FullName?.Contains("EntityFramework") == true)
                    .ToList();

                foreach (var descriptor in descriptorsToRemove)
                {
                    services.Remove(descriptor);
                }

                // Add in-memory database for testing - use the same database name for all tests
                services.AddDbContext<AppDbContext>(options =>
                {
                    options.UseInMemoryDatabase(DatabaseName)
                           .ConfigureWarnings(warnings => warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning));
                });
            });
        });

        _client = _factory.CreateClient();
    }

    private async Task<string> GetAccessTokenAsync()
    {
        if (_accessToken != null) return _accessToken;

        // Register a test user (if not already exists)
        var registerDto = new RegisterRequestDto
        {
            Email = "integration@test.com",
            Password = "TestPassword123!"
        };

        var registerJson = JsonSerializer.Serialize(registerDto);
        var registerContent = new StringContent(registerJson, Encoding.UTF8, "application/json");
        
        var registerResponse = await _client.PostAsync("/api/auth/register", registerContent);
        
        // If user already exists (409 Conflict), that's fine - we'll just login
        if (registerResponse.StatusCode != System.Net.HttpStatusCode.Conflict)
        {
            registerResponse.EnsureSuccessStatusCode();
        }

        // Login to get token
        var loginDto = new LoginRequestDto
        {
            Email = "integration@test.com",
            Password = "TestPassword123!"
        };

        var loginJson = JsonSerializer.Serialize(loginDto);
        var loginContent = new StringContent(loginJson, Encoding.UTF8, "application/json");
        
        var loginResponse = await _client.PostAsync("/api/auth/login", loginContent);
        loginResponse.EnsureSuccessStatusCode();

        var loginResponseContent = await loginResponse.Content.ReadAsStringAsync();
        var tokenResponse = JsonSerializer.Deserialize<TokenResponseDto>(loginResponseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        _accessToken = tokenResponse!.AccessToken;
        return _accessToken;
    }

    private async Task SetAuthorizationHeaderAsync()
    {
        var token = await GetAccessTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    [Fact]
    public async Task GetWallets_ShouldReturnUserWallets()
    {
        // Arrange
        await SetAuthorizationHeaderAsync();

        // Act
        var response = await _client.GetAsync("/api/wallets");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var wallets = JsonSerializer.Deserialize<List<WalletDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        wallets.Should().NotBeNull();
        wallets!.Should().HaveCountGreaterThan(0);
        wallets.Should().Contain(w => w.Name == "Main Wallet");
    }

    [Fact]
    public async Task CreateWallet_ShouldCreateNewWallet()
    {
        // Arrange
        await SetAuthorizationHeaderAsync();
        
        var createDto = new CreateWalletDto
        {
            Name = "Integration Test Wallet",
            Type = WalletType.Personal,
            Currency = "USD",
            InitialBalance = 1000
        };

        var json = JsonSerializer.Serialize(createDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/wallets", content);

        // Assert
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        var wallet = JsonSerializer.Deserialize<WalletDto>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        wallet.Should().NotBeNull();
        wallet!.Name.Should().Be("Integration Test Wallet");
        wallet.Currency.Should().Be("USD");
        wallet.InitialBalance.Should().Be(1000);
    }

    [Fact]
    public async Task GetWallet_WithValidId_ShouldReturnWallet()
    {
        // Arrange
        await SetAuthorizationHeaderAsync();
        
        // First create a wallet
        var createDto = new CreateWalletDto
        {
            Name = "Test Wallet for Get",
            Type = WalletType.Personal,
            Currency = "EUR",
            InitialBalance = 500
        };

        var createJson = JsonSerializer.Serialize(createDto);
        var createContent = new StringContent(createJson, Encoding.UTF8, "application/json");
        var createResponse = await _client.PostAsync("/api/wallets", createContent);
        createResponse.EnsureSuccessStatusCode();

        var createResponseContent = await createResponse.Content.ReadAsStringAsync();
        var createdWallet = JsonSerializer.Deserialize<WalletDto>(createResponseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // Act
        var response = await _client.GetAsync($"/api/wallets/{createdWallet!.Id}");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var wallet = JsonSerializer.Deserialize<WalletDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        wallet.Should().NotBeNull();
        wallet!.Id.Should().Be(createdWallet.Id);
        wallet.Name.Should().Be("Test Wallet for Get");
    }

    [Fact]
    public async Task GetWalletBalance_ShouldReturnBalanceInfo()
    {
        // Arrange
        await SetAuthorizationHeaderAsync();
        
        // Get the main wallet (created during registration)
        var walletsResponse = await _client.GetAsync("/api/wallets");
        walletsResponse.EnsureSuccessStatusCode();
        var walletsContent = await walletsResponse.Content.ReadAsStringAsync();
        var wallets = JsonSerializer.Deserialize<List<WalletDto>>(walletsContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var mainWallet = wallets!.First(w => w.Name == "Main Wallet");

        // Act
        var response = await _client.GetAsync($"/api/wallets/{mainWallet.Id}/balance");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        
        // Parse as JsonElement to check dynamic object properties
        var balanceInfo = JsonSerializer.Deserialize<JsonElement>(content);
        
        balanceInfo.TryGetProperty("currentBalance", out _).Should().BeTrue();
        balanceInfo.TryGetProperty("totalIncome", out _).Should().BeTrue();
        balanceInfo.TryGetProperty("totalExpenses", out _).Should().BeTrue();
    }

    [Fact]
    public async Task Unauthorized_Request_ShouldReturn401()
    {
        // Arrange - Don't set authorization header

        // Act
        var response = await _client.GetAsync("/api/wallets");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
    }

    public void Dispose()
    {
        _client.Dispose();
    }
} 