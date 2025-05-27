# Dokumentacja Bazy Danych MyMoney

## Przegląd

Baza danych MyMoney używa Microsoft SQL Server z Entity Framework Core 9.0.5 jako ORM. Struktura obsługuje podstawowe zarządzanie użytkownikami, kontami finansowymi, transakcjami i kategoriami.

## Schemat bazy danych

### Diagram ERD

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      Users      │       │     Wallets     │       │  Transactions   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ Id (PK)         │◄──────┤ CreatedByUserId │       │ Id (PK)         │
│ Email           │       │ Id (PK)         │◄──────┤ WalletId (FK)   │
│ HashedPassword  │       │ Name            │       │ UserId (FK)     │
│ RefreshToken    │       │ Type (enum)     │       │ CategoryId (FK) │
│ RefreshTokenExp │       │ InitialBalance  │       │ Amount          │
│ FullName        │       │ ManualBalance   │       │ Description     │
│ ProfileImageUrl │       │ Currency        │       │ CreatedAt       │
│ MainWalletId    │       │ CreatedAt       │       │ UpdatedAt       │
│ CreatedAt       │       │ UpdatedAt       │       └─────────────────┘
│ LastLogin       │       │ BalanceResetAt  │                 │
└─────────────────┘       └─────────────────┘                 │
         │                          │                         │
         │                          │                         │
         │                ┌─────────────────┐       ┌─────────────────┐
         │                │ WalletMembers   │       │   Categories    │
         │                ├─────────────────┤       ├─────────────────┤
         └────────────────┤ UserId (FK)     │       │ Id (PK)         │
                          │ WalletId (FK)   │       │ Name            │
                          └─────────────────┘       │ UserId (FK)     │
                                                    └─────────────────┘
```

## Tabele

### 1. Users

Przechowuje informacje o użytkownikach systemu.

**Kolumny:**
- `Id` (uniqueidentifier, PK) - Unikalny identyfikator użytkownika
- `Email` (nvarchar(max), nullable) - Adres email użytkownika
- `HashedPassword` (nvarchar(max), nullable) - Zahashowane hasło (PasswordHasher)
- `RefreshToken` (nvarchar(max), nullable) - Token odświeżania JWT
- `RefreshTokenExpiration` (datetime2, nullable) - Data wygaśnięcia refresh token
- `FullName` (nvarchar(max), nullable) - Pełne imię i nazwisko
- `ProfileImageUrl` (nvarchar(max), nullable) - URL do zdjęcia profilowego
- `MainWalletId` (uniqueidentifier, nullable, FK) - ID głównego konta użytkownika
- `CreatedAt` (datetime2) - Data utworzenia konta
- `LastLogin` (datetime2, nullable) - Data ostatniego logowania

**Indeksy:**
- `IX_Users_MainWalletId` - na kolumnie MainWalletId

**Relacje:**
- `MainWallet` - jeden do jednego z Wallets (SetNull przy usunięciu)

### 2. Wallets

Przechowuje informacje o kontach finansowych.

**Kolumny:**
- `Id` (uniqueidentifier, PK) - Unikalny identyfikator konta
- `Name` (nvarchar(100), required) - Nazwa konta
- `Type` (int, required) - Typ konta (enum WalletType: Personal=0, Credit=1, Savings=2)
- `InitialBalance` (decimal(18,2)) - Początkowe saldo
- `ManualBalance` (decimal(18,2), nullable) - Ręcznie ustawione saldo
- `BalanceResetAt` (datetime2, nullable) - Data resetowania salda
- `Currency` (nvarchar(10), required) - Waluta (domyślnie "PLN")
- `CreatedByUserId` (uniqueidentifier, FK) - ID użytkownika który utworzył konto
- `CreatedAt` (datetime2) - Data utworzenia
- `UpdatedAt` (datetime2) - Data ostatniej modyfikacji

**Indeksy:**
- `IX_Wallets_CreatedByUserId` - na kolumnie CreatedByUserId

**Relacje:**
- `CreatedByUser` - wiele do jednego z Users (Restrict przy usunięciu)
- `Transactions` - jeden do wielu z Transactions
- `Members` - jeden do wielu z WalletMembers

### 3. WalletMembers

Tabela łącząca użytkowników z kontami (relacja many-to-many).

**Kolumny:**
- `WalletId` (uniqueidentifier, PK, FK) - ID konta
- `UserId` (uniqueidentifier, PK, FK) - ID użytkownika

**Klucz główny:**
- Klucz złożony: (WalletId, UserId)

**Indeksy:**
- `IX_WalletMembers_UserId` - na kolumnie UserId

**Relacje:**
- `User` - wiele do jednego z Users (Restrict przy usunięciu)
- `Wallet` - wiele do jednego z Wallets (Cascade przy usunięciu)

### 4. Categories

Przechowuje kategorie transakcji (globalne i użytkownika).

**Kolumny:**
- `Id` (uniqueidentifier, PK) - Unikalny identyfikator kategorii
- `Name` (nvarchar(100), required) - Nazwa kategorii
- `UserId` (uniqueidentifier, nullable, FK) - ID użytkownika (NULL = kategoria globalna)

**Indeksy:**
- `IX_Categories_UserId` - na kolumnie UserId
- `IX_Categories_Name_UserId` - unikalny indeks na (Name, UserId)

**Relacje:**
- `User` - wiele do jednego z Users
- `Transactions` - jeden do wielu z Transactions

### 5. Transactions

Przechowuje wszystkie transakcje finansowe.

**Kolumny:**
- `Id` (uniqueidentifier, PK) - Unikalny identyfikator transakcji
- `WalletId` (uniqueidentifier, FK) - ID konta
- `UserId` (uniqueidentifier, FK) - ID użytkownika który utworzył transakcję
- `CategoryId` (uniqueidentifier, nullable, FK) - ID kategorii
- `Amount` (decimal(18,2)) - Kwota (dodatnia = przychód, ujemna = wydatek)
- `Description` (nvarchar(255), nullable) - Opis transakcji
- `CreatedAt` (datetime2) - Data utworzenia rekordu
- `UpdatedAt` (datetime2) - Data ostatniej modyfikacji

**Indeksy:**
- `IX_Transactions_CategoryId` - na kolumnie CategoryId
- `IX_Transactions_UserId` - na kolumnie UserId
- `IX_Transactions_WalletId` - na kolumnie WalletId

**Relacje:**
- `Category` - wiele do jednego z Categories
- `User` - wiele do jednego z Users (Cascade przy usunięciu)
- `Wallet` - wiele do jednego z Wallets (Cascade przy usunięciu)

## Konfiguracja Entity Framework

### Connection String

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=MyMoney;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;"
  }
}
```

### Konfiguracja modelu (OnModelCreating)

```csharp
// Precyzja dla kwot pieniężnych
modelBuilder.Entity<Transaction>()
    .Property(t => t.Amount)
    .HasPrecision(18, 2);

// Relacja User -> MainWallet (bez cykli kaskadowych)
modelBuilder.Entity<User>()
    .HasOne(u => u.MainWallet)
    .WithMany()
    .HasForeignKey(u => u.MainWalletId)
    .OnDelete(DeleteBehavior.SetNull);

// Relacja Wallet -> CreatedByUser (ograniczenie kaskady)
modelBuilder.Entity<Wallet>()
    .HasOne(w => w.CreatedByUser)
    .WithMany(u => u.Wallets)
    .HasForeignKey(w => w.CreatedByUserId)
    .OnDelete(DeleteBehavior.Restrict);

// WalletMembers: klucz złożony
modelBuilder.Entity<WalletMember>()
    .HasKey(wm => new { wm.WalletId, wm.UserId });

// Unikalna kategoria na użytkownika
modelBuilder.Entity<Category>()
    .HasIndex(c => new { c.Name, c.UserId })
    .IsUnique();
```

## Migracje

Projekt używa Entity Framework Core Migrations. Główne migracje:

1. **InitialCreate** (2025-05-15) - Podstawowa struktura tabel
2. **Auth** (2025-05-16) - Dodanie pól uwierzytelniania
3. **EditModels** (2025-05-18) - Modyfikacje modeli
4. **UpdateWallet** (2025-05-18) - Aktualizacje tabeli Wallets
5. **AddInitialBalance** (2025-05-18) - Dodanie InitialBalance
6. **AddManualBalance** (2025-05-18) - Dodanie ManualBalance i BalanceResetAt

### Uruchamianie migracji

```bash
# Dodanie nowej migracji
dotnet ef migrations add NazwaMigracji

# Zastosowanie migracji
dotnet ef database update

# Cofnięcie migracji
dotnet ef database update PreviousMigrationName
```

## Funkcjonalności bazy danych

### Automatyczne tworzenie głównego konta

Przy rejestracji użytkownika automatycznie tworzone jest główne konto:

```csharp
var mainWallet = new Wallet
{
    Name = "Main Wallet",
    Type = WalletType.Personal,
    InitialBalance = 0,
    Currency = "zł",
    CreatedByUserId = user.Id
};

user.MainWalletId = mainWallet.Id;
```

### Obliczanie salda konta

Saldo konta jest obliczane na podstawie:
- InitialBalance (początkowe saldo)
- ManualBalance (ręcznie ustawione saldo, jeśli istnieje)
- Suma wszystkich transakcji

### Kategorie globalne vs użytkownika

- Kategorie globalne: `UserId = null`
- Kategorie użytkownika: `UserId = konkretny GUID`
- Unikalność nazwy kategorii w ramach użytkownika

### Bezpieczeństwo

- Hasła hashowane przez `PasswordHasher<User>`
- JWT tokeny z refresh tokenami
- Ograniczenia kaskadowe zapobiegające przypadkowemu usunięciu danych
- Walidacja na poziomie modelu i bazy danych 