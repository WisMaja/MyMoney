using Microsoft.EntityFrameworkCore;
using api.Database;
using api.Models;

namespace api.Tests.Helpers;

public static class TestDbContextFactory
{
    public static AppDbContext CreateInMemoryContext(string? databaseName = null)
    {
        // Generuj unikalną nazwę bazy dla każdego testu jeśli nie podano
        databaseName ??= $"TestDb_{Guid.NewGuid()}";
        
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: databaseName)
            .ConfigureWarnings(warnings => warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        var context = new AppDbContext(options);
        
        // Ensure the database is created
        context.Database.EnsureCreated();
        
        return context;
    }

    public static AppDbContext CreateContextWithTestData(string? databaseName = null)
    {
        var context = CreateInMemoryContext(databaseName);
        
        SeedTestData(context);
        
        return context;
    }

    private static void SeedTestData(AppDbContext context)
    {
        // Test users
        var testUser1 = new User
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Email = "test1@example.com",
            HashedPassword = "hashedpassword123",
            FullName = "Test User 1",
            CreatedAt = DateTime.UtcNow,
            Wallets = new List<Wallet>(),
            Transactions = new List<Transaction>(),
            WalletMemberships = new List<WalletMember>(),
            CustomCategories = new List<Category>()
        };

        var testUser2 = new User
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Email = "test2@example.com",
            HashedPassword = "hashedpassword456",
            FullName = "Test User 2",
            CreatedAt = DateTime.UtcNow,
            Wallets = new List<Wallet>(),
            Transactions = new List<Transaction>(),
            WalletMemberships = new List<WalletMember>(),
            CustomCategories = new List<Category>()
        };

        context.Users.AddRange(testUser1, testUser2);

        // Test categories
        var category1 = new Category
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Name = "Food",
            UserId = null, // Global category
            User = null, // Dla globalnych kategorii User może być null
            Transactions = new List<Transaction>()
        };

        var category2 = new Category
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            Name = "Transport",
            UserId = testUser1.Id, // Custom category
            User = testUser1,
            Transactions = new List<Transaction>()
        };

        context.Categories.AddRange(category1, category2);

        // Test wallets
        var wallet1 = new Wallet
        {
            Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
            Name = "Main Wallet",
            Type = WalletType.Personal,
            Currency = "PLN",
            InitialBalance = 1000,
            CreatedByUserId = testUser1.Id,
            CreatedByUser = testUser1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Transactions = new List<Transaction>(),
            Members = new List<WalletMember>()
        };

        var wallet2 = new Wallet
        {
            Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
            Name = "Savings",
            Type = WalletType.Savings,
            Currency = "PLN",
            InitialBalance = 5000,
            CreatedByUserId = testUser1.Id,
            CreatedByUser = testUser1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Transactions = new List<Transaction>(),
            Members = new List<WalletMember>()
        };

        context.Wallets.AddRange(wallet1, wallet2);

        // Test wallet members
        var walletMember1 = new WalletMember
        {
            WalletId = wallet1.Id,
            UserId = testUser1.Id
        };

        var walletMember2 = new WalletMember
        {
            WalletId = wallet2.Id,
            UserId = testUser1.Id
        };

        context.WalletMembers.AddRange(walletMember1, walletMember2);

        // Test transactions
        var transaction1 = new Transaction
        {
            Id = Guid.Parse("77777777-7777-7777-7777-777777777777"),
            Amount = 100,
            Description = "Grocery shopping",
            CategoryId = category1.Id,
            WalletId = wallet1.Id,
            UserId = testUser1.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var transaction2 = new Transaction
        {
            Id = Guid.Parse("88888888-8888-8888-8888-888888888888"),
            Amount = -50,
            Description = "Bus ticket",
            CategoryId = category2.Id,
            WalletId = wallet1.Id,
            UserId = testUser1.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Transactions.AddRange(transaction1, transaction2);

        // Set main wallet for test user
        testUser1.MainWalletId = wallet1.Id;

        context.SaveChanges();
    }
} 