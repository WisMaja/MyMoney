# MyMoney - Aplikacja do Zarządzania Finansami

Aplikacja webowa do śledzenia przychodów, wydatków i planowania budżetu.

## Funkcjonalności

- Zarządzanie kontami finansowymi
- Dodawanie transakcji (przychody/wydatki)
- Wykresy i raporty finansowe
- Budżetowanie
- Udostępnianie kont innym użytkownikom
- Logowanie przez Google/Facebook

## Technologie

**Frontend:** React 18, Material-UI, Chart.js, React Router, Axios  
**Backend:** .NET 9, ASP.NET Core Web API, Entity Framework Core  
**Baza danych:** SQL Server 2022  
**Konteneryzacja:** Docker & Docker Compose

## Wymagania

- Node.js 16+
- .NET 9.0 SDK
- Docker & Docker Compose
- Git

## Instalacja i uruchamianie

### Opcja 1: Z Docker (najłatwiejsza)

```bash
# 1. Sklonuj projekt
git clone <repository-url>
cd MyMoney

# 2. Uruchom bazę danych
docker-compose up mssql -d

# 3. Sprawdź czy baza działa
docker ps

# 4. Uruchom backend
cd api
dotnet restore
dotnet run

# 5. W nowym terminalu uruchom frontend
cd frontend
npm install
npm start
```

**Gotowe!** Aplikacja działa na:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000 (lub sprawdź w terminalu)
- Swagger: http://localhost:5000/swagger

### Opcja 2: Bez Docker

**Potrzebujesz:** SQL Server lub SQL Server Express

```bash
# 1. Sklonuj projekt
git clone <repository-url>
cd MyMoney

# 2. Skonfiguruj bazę danych
# Edytuj api/appsettings.Development.json i dodaj:
```

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=MyMoneyDb;Trusted_Connection=true;TrustServerCertificate=true;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

```bash
# 3. Uruchom migracje bazy danych
cd api
dotnet restore
dotnet ef database update

# 4. Uruchom backend
dotnet run

# 5. W nowym terminalu uruchom frontend
cd frontend
npm install
npm start
```

### Opcja 3: Całość w Docker (gdy będzie gotowa)

```bash
# Uruchom wszystko naraz
docker-compose up

# Lub w tle
docker-compose up -d

# Zatrzymaj
docker-compose down
```

## Konfiguracja

### Backend (api/appsettings.Development.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=MyMoneyDb;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=true;"
  },
  "JwtSettings": {
    "SecretKey": "e5be8f13-627b-4632-805f-37a86ce0d76d",
    "ExpirationMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### Frontend (.env w katalogu frontend/)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_FACEBOOK_APP_ID=your-facebook-app-id
```

## Częste problemy

**Baza danych nie działa:**
```bash
# Sprawdź czy kontener działa
docker ps

# Restart kontenera
docker-compose restart mssql

# Sprawdź logi
docker-compose logs mssql
```

**Backend nie startuje:**
```bash
# Sprawdź czy masz .NET 9
dotnet --version

# Zainstaluj narzędzia EF
dotnet tool install --global dotnet-ef

# Sprawdź migracje
dotnet ef migrations list
```

**Frontend nie działa:**
```bash
# Sprawdź wersję Node.js
node --version

# Wyczyść cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Port zajęty:**
```bash
# Sprawdź co używa portu 3000
lsof -i :3000

# Zabij proces
kill -9 <PID>

# Lub uruchom na innym porcie
PORT=3001 npm start
```

## Struktura projektu

```
MyMoney/
├── frontend/              # React app
│   ├── src/
│   ├── public/
│   └── package.json
├── api/                   # .NET API
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   ├── Database/
│   └── api.csproj
├── docs/                  # Dokumentacja
├── docker-compose.yml
└── README.md
```

## Testowanie

```bash
# Frontend
cd frontend
npm test

# Backend
cd api
dotnet test
```

## Dokumentacja

- [Architektura](docs/architektura.md)
- [API](docs/api.md)
- [Frontend](docs/frontend.md)
- [Baza danych](docs/baza-danych.md)
- [Testowanie](docs/testowanie.md)
- [Diagramy](docs/diagramy.md)

