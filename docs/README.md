# MyMoney - Dokumentacja Projektu

## Spis treści

1. [Wprowadzenie](#wprowadzenie)
2. [Architektura systemu](architektura.md)
3. [Instalacja i konfiguracja](instalacja.md)
4. [Przewodnik użytkownika](przewodnik-uzytkownika.md)
5. [Dokumentacja API](api.md)
6. [Dokumentacja frontendu](frontend.md)
7. [Baza danych](baza-danych.md)
8. [Testowanie](testowanie.md)
9. [Wdrożenie](wdrozenie.md)
10. [Bezpieczeństwo](bezpieczenstwo.md)
11. [Diagramy i wizualizacje](diagramy.md)

## Wprowadzenie

MyMoney to aplikacja webowa do zarządzania finansami osobistymi, która umożliwia użytkownikom śledzenie przychodów, wydatków oraz zarządzanie kontami finansowymi. Aplikacja została zbudowana jako SPA (Single Page Application) z architekturą klient-serwer.

### Główne funkcjonalności

**Zaimplementowane:**
- **Zarządzanie kontami** - tworzenie i zarządzanie kontami finansowych (Main Wallet + dodatkowe)
- **Śledzenie transakcji** - dodawanie przychodów i wydatków z kategoryzacją
- **Podstawowe statystyki** - wykresy przychodów vs wydatków
- **Zarządzanie kategoriami** - globalne i niestandardowe kategorie użytkownika
- **Udostępnianie kont** - dodawanie członków do kont finansowych
- **Uwierzytelnianie JWT** - rejestracja, logowanie, odświeżanie tokenów
- **Upload zdjęć profilowych** - z walidacją typu i rozmiaru

**Brak implementacji:**
- Budżetowanie
- Zaawansowane raporty finansowe
- OAuth (Google/Facebook)
- Funkcje społecznościowe
- Powiadomienia
- Eksport danych

### Technologie

**Frontend:**
- React 18.0.0 (JavaScript, nie TypeScript)
- Material-UI 5.6.2
- Chart.js 4.4.9 + React-chartjs-2 5.3.0
- Recharts 2.5.0
- React Router 6.3.0
- Axios 1.9.0

**Backend:**
- .NET 9
- ASP.NET Core Web API
- Entity Framework Core 9.0.5
- PostgreSQL
- JWT Authentication (Microsoft.AspNetCore.Authentication.JwtBearer 9.0.5)

**Infrastruktura:**
- Docker & Docker Compose (tylko SQL Server)
- Swagger UI (w trybie development)

### Wymagania systemowe

- Node.js 16+ (dla frontendu)
- .NET 9.0 SDK (dla backendu)
- Docker
- Git

### Struktura projektu

```
MyMoney/
├── frontend/           # Aplikacja React
│   ├── src/
│   │   ├── components/ # Komponenty React (Dashboard, dialogi, wykresy)
│   │   ├── pages/      # Strony (Login, Dashboard, Accounts, etc.)
│   │   ├── services/   # Serwisy API (transaction, wallet, category, user)
│   │   ├── context/    # AuthContext
│   │   ├── hooks/      # useAuth
│   │   ├── router/     # PrivateRoute
│   │   ├── styles/     # Style CSS
│   │   └── apiClient.js # Konfiguracja Axios
│   └── package.json    # Zależności npm
├── api/                # Backend .NET
│   ├── Controllers/    # Auth, Users, Wallets, Transactions, Categories
│   ├── Models/         # User, Wallet, Transaction, Category, WalletMember
│   ├── Services/       # TokenService (tylko JWT)
│   ├── Database/       # AppDbContext
│   ├── Dtos/           # Data Transfer Objects
│   ├── Migrations/     # Migracje EF
│   └── Program.cs      # Konfiguracja aplikacji
├── docs/               # Dokumentacja
├── docker-compose.yml  # SQL Server
└── docker-compose-prod.yml # Pełna aplikacja
```

## Porty i adresy

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5032
- **PostgresSQL:** supabase
- **Swagger UI:** http://localhost:5032/swagger (development)

## Szybki start

1. **Klonowanie:**
```bash
git clone <repository-url>
cd MyMoney
```

2. **Uruchomienie bazy danych:**
otworezenie bazy z supabase 

3. **Backend:**
```bash
cd api
dotnet run
```

4. **Frontend:**
```bash
cd frontend
npm install
npm start
```

5. **Pierwsza rejestracja:**
- Otwórz http://localhost:3000
- Kliknij "Need an account? Register"
- Wprowadź email i hasło (min. 8 znaków)
- Automatycznie zostanie utworzone "Main Wallet"

## Główne endpointy API

- `POST /api/auth/register` - Rejestracja
- `POST /api/auth/login` - Logowanie
- `POST /api/auth/refresh` - Odświeżanie tokenu
- `GET /api/users/me` - Profil użytkownika
- `GET /api/wallets` - Lista kont
- `GET /api/transactions` - Lista transakcji
- `POST /api/transactions/income` - Dodaj przychód
- `POST /api/transactions/expenses` - Dodaj wydatek
- `GET /api/categories` - Lista kategorii

## Baza danych

**Główne tabele:**
- `Users` - użytkownicy z hashowanymi hasłami
- `Wallets` - konta finansowe z saldem
- `Transactions` - transakcje (+ przychód, - wydatek)
- `Categories` - kategorie (globalne + użytkownika)
- `WalletMembers` - udostępnianie kont

**Automatyczne migracje:** Tak (przy starcie aplikacji)

## Bezpieczeństwo

**Zaimplementowane:**
- JWT tokeny (1h access, 24h refresh)
- Hashowanie haseł (ASP.NET Core PasswordHasher)
- Autoryzacja na poziomie kontrolerów
- Walidacja dostępu do zasobów
- Upload plików z walidacją

**Problemy:**
- Hardcoded JWT secret
- Brak HTTPS
- CORS AllowAll
- Brak rate limiting
- Podstawowe logowanie

## Status projektu

**Wersja:** Development  
**Stan:** Podstawowe funkcjonalności zaimplementowane  
**Gotowość produkcyjna:** Nie (wymagane poprawki bezpieczeństwa)

---

**Uwaga:** Dokumentacja opisuje rzeczywisty stan projektu bez zmyślonych funkcji.
