# Instalacja i Konfiguracja MyMoney

## Wymagania systemowe

### Minimalne wymagania

- **System operacyjny:** Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **RAM:** 4 GB (zalecane 8 GB)
- **Miejsce na dysku:** 2 GB wolnego miejsca
- **Procesor:** Dual-core 2.0 GHz lub lepszy

### Wymagane oprogramowanie

#### Dla rozwoju lokalnego:
- **Node.js** 16.0 lub nowszy
- **.NET 9.0 SDK**
- **SQL Server** 2022 (lub Docker z SQL Server)
- **Git**

#### Dla wdrożenia z Docker:
- **Docker** 20.10 lub nowszy
- **Docker Compose** 2.0 lub nowszy

## Instalacja lokalna (bez Docker)

### Krok 1: Klonowanie repozytorium

```bash
git clone <repository-url>
cd MyMoney
```

### Krok 2: Konfiguracja bazy danych

#### Uruchomienie SQL Server przez Docker

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong!Passw0rd" \
   -p 1433:1433 --name sql-server \
   -d mcr.microsoft.com/mssql/server:2022-latest
```

### Krok 3: Konfiguracja backendu

1. Przejdź do katalogu API:
```bash
cd api
```

2. Sprawdź plik `appsettings.json` (już skonfigurowany):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=MyMoney;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;"
  }
}
```

3. Zainstaluj zależności i uruchom migracje:
```bash
dotnet restore
dotnet ef database update
```

4. Uruchom backend:
```bash
dotnet run
```

Backend będzie dostępny pod adresem: `http://localhost:5032`

### Krok 4: Konfiguracja frontendu

1. Przejdź do katalogu frontend:
```bash
cd ../frontend
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Uruchom aplikację:
```bash
npm start
```

Frontend będzie dostępny pod adresem: `http://localhost:3000`

**Uwaga:** Frontend automatycznie łączy się z API pod adresem `http://localhost:5032/api` (zdefiniowane w `apiClient.js`).

## Instalacja z Docker (tylko baza danych)

### Krok 1: Klonowanie repozytorium

```bash
git clone <repository-url>
cd MyMoney
```

### Krok 2: Uruchomienie bazy danych

```bash
docker-compose up -d
```

To uruchomi tylko SQL Server 2022 na porcie 1433.

### Krok 3: Uruchomienie aplikacji lokalnie

Następnie uruchom backend i frontend lokalnie jak w poprzedniej sekcji.

## Instalacja produkcyjna z Docker

### Krok 1: Użyj pliku docker-compose-prod.yml

```bash
docker-compose -f docker-compose-prod.yml up -d
```

To uruchomi:
- SQL Server 2022 na porcie 1433
- API na porcie 5032
- Frontend na porcie 3000

## Weryfikacja instalacji

### Sprawdzenie backendu

```bash
curl http://localhost:5032/api/auth
```

### Sprawdzenie frontendu

Otwórz przeglądarkę i przejdź do `http://localhost:3000`. Powinieneś zobaczyć stronę logowania.

### Sprawdzenie bazy danych

```bash
# Dla Docker
docker exec -it local_mssql_server_MyMoney /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -Q "SELECT name FROM sys.databases WHERE name = 'MyMoney'"
```

## Rozwiązywanie problemów

### Problem: Błąd połączenia z bazą danych

**Rozwiązanie:**
1. Sprawdź czy kontener SQL Server jest uruchomiony: `docker ps`
2. Sprawdź logi: `docker logs local_mssql_server_MyMoney`
3. Zweryfikuj connection string w `appsettings.json`

### Problem: Port już używany

**Rozwiązanie:**
1. Sprawdź co używa portu: `lsof -i :5032` lub `netstat -ano | findstr :5032`
2. Zatrzymaj proces lub zmień port w `Properties/launchSettings.json`

### Problem: Błąd CORS w przeglądarce

**Rozwiązanie:**
1. Sprawdź konfigurację CORS w `Program.cs` (powinna być ustawiona na "AllowAll")
2. Upewnij się, że backend działa na porcie 5032

### Problem: Migracje nie działają

**Rozwiązanie:**
```bash
# Sprawdź status migracji
dotnet ef migrations list

# Usuń bazę i utwórz ponownie
dotnet ef database drop
dotnet ef database update
```

## Struktura projektu

```
MyMoney/
├── api/                    # Backend .NET 9
│   ├── Controllers/        # Kontrolery API
│   ├── Models/            # Modele danych
│   ├── Database/          # DbContext
│   ├── Migrations/        # Migracje EF
│   ├── Services/          # Serwisy (TokenService)
│   ├── Dtos/              # Data Transfer Objects
│   └── appsettings.json   # Konfiguracja
├── frontend/              # Frontend React 18
│   ├── src/
│   │   ├── components/    # Komponenty React
│   │   ├── pages/         # Strony aplikacji
│   │   ├── context/       # React Context (AuthContext)
│   │   ├── hooks/         # Custom hooks (useAuth)
│   │   ├── services/      # Serwisy API
│   │   ├── styles/        # Style CSS
│   │   └── apiClient.js   # Konfiguracja Axios
│   └── package.json       # Zależności npm
├── docs/                  # Dokumentacja
├── docker-compose.yml     # Docker dla bazy danych
└── docker-compose-prod.yml # Docker produkcyjny
```

## Konfiguracja środowiska

### Zmienne środowiskowe backendu

Backend używa standardowej konfiguracji .NET:
- `appsettings.json` - konfiguracja podstawowa
- `appsettings.Development.json` - konfiguracja deweloperska (opcjonalna)

### Zmienne środowiskowe frontendu

Frontend automatycznie używa:
- `REACT_APP_API_URL` - domyślnie `http://localhost:5032/api` (w `apiClient.js`)

## Funkcjonalności

### Uwierzytelnianie
- JWT tokeny (1h access, 24h refresh)
- Automatyczne odświeżanie tokenów
- Hashowanie haseł przez PasswordHasher

### Baza danych
- SQL Server 2022
- Entity Framework Core 9.0.5
- Automatyczne migracje przy starcie

### API
- ASP.NET Core Web API
- Swagger UI dostępne w trybie Development
- CORS skonfigurowany na "AllowAll"

### Frontend
- React 18 z Material-UI
- React Router 6.3.0
- Axios dla HTTP
- Chart.js dla wykresów

---

**Uwaga:** Aplikacja jest w fazie rozwoju. Niektóre funkcje mogą być niekompletne. 