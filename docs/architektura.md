# Architektura Systemu MyMoney

## Przegląd architektury

MyMoney to aplikacja typu SPA (Single Page Application) z architekturą klient-serwer składająca się z trzech warstw:

1. **Warstwa prezentacji** - React 18 z Material-UI
2. **Warstwa API** - ASP.NET Core Web API (.NET 9)
3. **Warstwa danych** - SQL Server 2022 z Entity Framework Core

## Architektura wysokiego poziomu

```
┌─────────────────┐    HTTP/JSON     ┌─────────────────┐    EF Core    ┌─────────────────┐
│   Frontend      │ ◄──────────────► │    Backend      │ ◄────────────► │   Baza Danych   │
│   (React 18)    │                  │   (.NET 9 API)  │                │  (SQL Server)   │
└─────────────────┘                  └─────────────────┘                └─────────────────┘
```

## Warstwa prezentacji (Frontend)

### Rzeczywista struktura komponentów

```
frontend/src/
├── components/          # Komponenty React
│   ├── AddExpenseDialog.js
│   ├── AddIncomeDialog.js
│   ├── Dashboard.js
│   ├── DeleteTransactionDialog.js
│   ├── EditTransactionDialog.js
│   ├── FinanceChart.js
│   ├── Header.js
│   └── Sidebar.js
├── pages/              # Strony aplikacji
│   ├── Accounts.js
│   ├── Budgets.js
│   ├── Categories.js
│   ├── Dashboard.js
│   ├── Login.js
│   ├── Settings.js
│   ├── Social.js
│   └── Statistics.js
├── services/           # Serwisy API
│   ├── categoryService.js
│   ├── transactionService.js
│   ├── userService.js
│   └── walletService.js
├── context/            # React Context
│   └── AuthContext.js
├── hooks/              # Custom hooks
│   └── useAuth.js
├── router/             # Routing
│   └── PrivateRoute.jsx
├── styles/             # Style CSS
└── apiClient.js        # Konfiguracja Axios
```

### Zarządzanie stanem

- **AuthContext** - stan uwierzytelniania (isAuthenticated, login, logout)
- **Local State** - stan komponentów (useState)
- **Custom Hook useAuth** - logika uwierzytelniania

### Komunikacja z backendem

**apiClient.js** - centralna konfiguracja Axios:
- Base URL: `http://localhost:5032/api`
- Automatyczne dodawanie Bearer token
- Interceptor do odświeżania tokenów przy 401
- Obsługa błędów i przekierowanie na login

## Warstwa API (Backend)

### Rzeczywista architektura

Backend używa prostej architektury **Controller + DbContext**:

```
api/
├── Controllers/            # Kontrolery API
│   ├── AuthController.cs   # Uwierzytelnianie (register, login, refresh)
│   ├── CategoriesController.cs # CRUD kategorii
│   ├── TransactionsController.cs # CRUD transakcji + statystyki
│   ├── UsersController.cs  # Profil użytkownika, upload zdjęć
│   └── WalletController.cs # CRUD kont finansowych
├── Services/               # Tylko TokenService
│   └── ITokenService.cs    # Generowanie i walidacja JWT
├── Database/               # Entity Framework
│   └── AppDbContext.cs     # Kontekst bazy danych
├── Models/                 # Modele danych
│   ├── User.cs
│   ├── Wallet.cs
│   ├── Transaction.cs
│   ├── Category.cs
│   └── WalletMember.cs
├── Dtos/                   # Data Transfer Objects
├── Migrations/             # Migracje EF
└── Program.cs              # Konfiguracja aplikacji
```

### Wzorce projektowe

1. **Dependency Injection** - TokenService wstrzykiwany do kontrolerów
2. **DTO Pattern** - obiekty transferu danych
3. **Repository Pattern** - **NIE UŻYWANY** (bezpośredni dostęp do DbContext)

### Uwierzytelnianie

- **JWT Tokens** - 1h access token, 24h refresh token
- **PasswordHasher** - hashowanie haseł
- **Bearer Authentication** - middleware JWT
- **Brak OAuth** - tylko email/hasło

## Warstwa danych

### Rzeczywisty model danych

```
User
├── Id: Guid
├── Email: string
├── HashedPassword: string
├── RefreshToken: string
├── RefreshTokenExpiration: DateTime
├── FullName: string
├── ProfileImageUrl: string
├── MainWalletId: Guid
├── CreatedAt: DateTime
└── LastLogin: DateTime

Wallet
├── Id: Guid
├── Name: string
├── Type: WalletType (enum)
├── InitialBalance: decimal
├── ManualBalance: decimal
├── Currency: string
├── CreatedByUserId: Guid
├── CreatedAt: DateTime
├── UpdatedAt: DateTime
└── BalanceResetAt: DateTime

Transaction
├── Id: Guid
├── WalletId: Guid
├── UserId: Guid
├── CategoryId: Guid
├── Amount: decimal (+ przychód, - wydatek)
├── Description: string
├── CreatedAt: DateTime
└── UpdatedAt: DateTime

Category
├── Id: Guid
├── Name: string
└── UserId: Guid (null = globalna)

WalletMember
├── WalletId: Guid
└── UserId: Guid
```

### Relacje między encjami

- **User ↔ Wallet**: 1:N (CreatedByUserId)
- **User ↔ Transaction**: 1:N (UserId)
- **User ↔ Category**: 1:N (UserId, null = globalna)
- **Wallet ↔ Transaction**: 1:N (WalletId)
- **Category ↔ Transaction**: 1:N (CategoryId)
- **User ↔ WalletMember**: N:M (udostępnianie kont)

## Bezpieczeństwo

### Uwierzytelnianie

1. **Rejestracja** - walidacja hasła (8 znaków, cyfra, znak specjalny, wielka/mała litera)
2. **JWT Tokens** - podpisane kluczem "e5be8f13-627b-4632-805f-37a86ce0d76d"
3. **Refresh Tokens** - przechowywane w bazie danych
4. **PasswordHasher** - hashowanie haseł ASP.NET Core

### Autoryzacja

1. **[Authorize]** - atrybut na kontrolerach
2. **GetUserIdFromToken()** - wyciąganie ID użytkownika z JWT
3. **UserHasAccessToWallet()** - sprawdzanie dostępu do kont

### Ochrona danych

1. **CORS "AllowAll"** - w trybie development
2. **Entity Framework** - parametryzowane zapytania
3. **Input validation** - atrybuty walidacji na DTO
4. **TrustServerCertificate** - dla SQL Server

## Funkcjonalności

### Rzeczywiste endpointy API

**AuthController:**
- POST /api/auth/register
- POST /api/auth/login  
- POST /api/auth/refresh

**TransactionsController:**
- GET /api/transactions (wszystkie)
- GET /api/transactions/income
- GET /api/transactions/expenses
- GET /api/transactions/wallet/{walletId}
- GET /api/transactions/{id}
- POST /api/transactions/income
- POST /api/transactions/expenses
- PUT /api/transactions/income/{id}
- PUT /api/transactions/expenses/{id}
- DELETE /api/transactions/{id}
- GET /api/transactions/statistics/income-expense

**WalletsController:**
- GET /api/wallets
- GET /api/wallets/{id}
- GET /api/wallets/main
- POST /api/wallets
- PUT /api/wallets/{id}
- DELETE /api/wallets/{id}

**CategoriesController:**
- GET /api/categories
- GET /api/categories/{id}
- POST /api/categories
- PUT /api/categories/{id}
- DELETE /api/categories/{id}

**UsersController:**
- GET /api/users/me
- PUT /api/users/me
- POST /api/users/me/profile-image

## Konfiguracja

### Program.cs

```csharp
// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Entity Framework
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { /* konfiguracja JWT */ });

// TokenService
builder.Services.AddScoped<ITokenService, TokenService>();

// Automatyczne migracje
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}
```

### Connection String

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=MyMoney;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;"
  }
}
```

## Wdrożenie

### Docker

**docker-compose.yml** - tylko SQL Server:
```yaml
services:
  mssql:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      SA_PASSWORD: "YourStrong!Passw0rd"
      ACCEPT_EULA: "Y"
    ports:
      - "1433:1433"
```

**docker-compose-prod.yml** - pełna aplikacja:
- SQL Server na porcie 1433
- API na porcie 5032  
- Frontend na porcie 3000

### Uruchamianie

```bash
# Backend
cd api
dotnet run  # http://localhost:5032

# Frontend  
cd frontend
npm start   # http://localhost:3000
```