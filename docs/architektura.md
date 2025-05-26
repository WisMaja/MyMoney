# Architektura Systemu MyMoney

## Przegląd architektury

MyMoney został zaprojektowany jako aplikacja typu SPA (Single Page Application) z architekturą klient-serwer. System składa się z trzech głównych warstw:

1. **Warstwa prezentacji** - aplikacja React
2. **Warstwa logiki biznesowej** - API .NET Core
3. **Warstwa danych** - baza danych SQL Server

## Architektura wysokiego poziomu

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐    SQL    ┌─────────────────┐
│   Frontend      │ ◄──────────────► │    Backend      │ ◄────────► │   Baza Danych   │
│   (React)       │                  │   (.NET Core)   │            │  (SQL Server)   │
└─────────────────┘                  └─────────────────┘            └─────────────────┘
```

## Warstwa prezentacji (Frontend)

### Struktura komponentów

Frontend oparty jest na React z wykorzystaniem wzorca komponentowego:

```
src/
├── components/          # Komponenty wielokrotnego użytku
│   ├── common/         # Podstawowe komponenty UI
│   ├── forms/          # Komponenty formularzy
│   └── charts/         # Komponenty wykresów
├── pages/              # Komponenty stron
│   ├── Dashboard/      # Strona główna
│   ├── Transactions/   # Zarządzanie transakcjami
│   ├── Accounts/       # Zarządzanie kontami
│   ├── Statistics/     # Statystyki i raporty
│   └── Settings/       # Ustawienia użytkownika
├── services/           # Usługi komunikacji z API
├── context/            # Konteksty React (stan globalny)
├── hooks/              # Custom hooks
└── router/             # Konfiguracja routingu
```

### Zarządzanie stanem

Aplikacja wykorzystuje kombinację:
- **React Context** - dla stanu globalnego (uwierzytelnianie, dane użytkownika)
- **Local State** - dla stanu komponentów
- **Custom Hooks** - dla logiki biznesowej i komunikacji z API

### Komunikacja z backendem

Wszystkie żądania HTTP są obsługiwane przez:
- **Axios** - klient HTTP
- **apiClient.js** - centralna konfiguracja API
- **Interceptory** - automatyczne dodawanie tokenów JWT

## Warstwa logiki biznesowej (Backend)

### Architektura API

Backend wykorzystuje wzorzec **Controller-Service-Repository**:

```
Controllers/            # Kontrolery API (warstwa prezentacji)
├── AuthController      # Uwierzytelnianie
├── UserController      # Zarządzanie użytkownikami
├── WalletController    # Zarządzanie kontami
├── TransactionsController # Transakcje
└── CategoryController  # Kategorie

Services/               # Logika biznesowa
├── AuthService         # Usługi uwierzytelniania
├── UserService         # Usługi użytkowników
├── WalletService       # Usługi kont
└── TransactionService  # Usługi transakcji

Database/               # Warstwa dostępu do danych
├── ApplicationDbContext # Kontekst Entity Framework
└── Repositories/       # Repozytoria (jeśli używane)
```

### Wzorce projektowe

1. **Dependency Injection** - wstrzykiwanie zależności
2. **Repository Pattern** - abstrakcja dostępu do danych
3. **DTO Pattern** - obiekty transferu danych
4. **Middleware Pattern** - przetwarzanie żądań HTTP

### Uwierzytelnianie i autoryzacja

- **JWT Tokens** - bezstanowe uwierzytelnianie
- **Role-based authorization** - autoryzacja oparta na rolach
- **OAuth 2.0** - integracja z Google/Facebook

## Warstwa danych

### Model danych

Główne encje systemu:

```
User (Użytkownik)
├── Id: Guid
├── Email: string
├── PasswordHash: string
├── FirstName: string
├── LastName: string
└── CreatedAt: DateTime

Wallet (Konto)
├── Id: Guid
├── UserId: Guid (FK)
├── Name: string
├── Balance: decimal
├── Currency: string
└── Type: WalletType

Transaction (Transakcja)
├── Id: Guid
├── WalletId: Guid (FK)
├── CategoryId: Guid (FK)
├── Amount: decimal
├── Description: string
├── Date: DateTime
└── Type: TransactionType

Category (Kategoria)
├── Id: Guid
├── Name: string
├── Type: CategoryType
└── Icon: string

WalletMember (Członek konta)
├── WalletId: Guid (FK)
├── UserId: Guid (FK)
└── Role: MemberRole
```

### Relacje między encjami

- **User ↔ Wallet**: 1:N (użytkownik może mieć wiele kont)
- **Wallet ↔ Transaction**: 1:N (konto może mieć wiele transakcji)
- **Category ↔ Transaction**: 1:N (kategoria może mieć wiele transakcji)
- **User ↔ WalletMember**: N:M (użytkownicy mogą dzielić konta)

## Bezpieczeństwo

### Uwierzytelnianie

1. **Rejestracja/Logowanie** - hashowanie haseł (bcrypt)
2. **JWT Tokens** - podpisane tokeny z czasem wygaśnięcia
3. **Refresh Tokens** - odnawianie sesji
4. **OAuth 2.0** - logowanie przez dostawców zewnętrznych

### Autoryzacja

1. **Middleware autoryzacji** - sprawdzanie uprawnień
2. **Resource-based authorization** - dostęp do zasobów
3. **Role-based access** - różne poziomy dostępu

### Ochrona danych

1. **HTTPS** - szyfrowanie komunikacji
2. **CORS** - kontrola dostępu cross-origin
3. **Input validation** - walidacja danych wejściowych
4. **SQL Injection protection** - parametryzowane zapytania

## Wydajność i skalowalność

### Optymalizacje frontendu

- **Code splitting** - podział kodu na chunki
- **Lazy loading** - ładowanie komponentów na żądanie
- **Memoization** - cache'owanie wyników obliczeń
- **Virtual scrolling** - dla długich list

### Optymalizacje backendu

- **Entity Framework optimizations** - optymalne zapytania
- **Caching** - cache'owanie często używanych danych
- **Pagination** - stronicowanie wyników
- **Async/await** - asynchroniczne operacje

### Monitorowanie

- **Logging** - szczegółowe logowanie błędów
- **Health checks** - sprawdzanie stanu aplikacji
- **Performance metrics** - metryki wydajności

## Wdrożenie

### Środowiska

1. **Development** - środowisko deweloperskie
2. **Staging** - środowisko testowe
3. **Production** - środowisko produkcyjne

### Konteneryzacja

- **Docker** - konteneryzacja aplikacji
- **Docker Compose** - orkiestracja kontenerów
- **Multi-stage builds** - optymalizacja obrazów

### CI/CD

Potencjalne narzędzia do wdrożenia:
- **GitHub Actions** - automatyzacja wdrożeń
- **Azure DevOps** - pipeline CI/CD
- **Docker Hub** - rejestr obrazów

---

**Uwaga:** Architektura może ewoluować wraz z rozwojem projektu i nowymi wymaganiami. 