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
- **SQL Server** 2019 lub nowszy (lub SQL Server Express)
- **Git** (do klonowania repozytorium)

#### Dla wdrożenia z Docker:
- **Docker** 20.10 lub nowszy
- **Docker Compose** 2.0 lub nowszy

## Instalacja lokalna (bez Docker)

### Krok 1: Klonowanie repozytorium

```bash
git clone https://github.com/your-username/MyMoney.git
cd MyMoney
```

### Krok 2: Konfiguracja bazy danych

#### Instalacja SQL Server Express (Windows)

1. Pobierz SQL Server Express z [oficjalnej strony Microsoft](https://www.microsoft.com/pl-pl/sql-server/sql-server-downloads)
2. Uruchom instalator i wybierz "Basic installation"
3. Zanotuj connection string (domyślnie: `Server=localhost\\SQLEXPRESS;Database=MyMoneyDB;Trusted_Connection=true;`)

#### Konfiguracja na macOS/Linux

Użyj Docker do uruchomienia SQL Server:

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
   -p 1433:1433 --name sql-server \
   -d mcr.microsoft.com/mssql/server:2019-latest
```

### Krok 3: Konfiguracja backendu

1. Przejdź do katalogu API:
```bash
cd api
```

2. Skopiuj plik konfiguracyjny:
```bash
cp appsettings.json appsettings.Development.json
```

3. Edytuj `appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=MyMoneyDB;Trusted_Connection=true;TrustServerCertificate=true;"
  },
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-here-minimum-32-characters",
    "Issuer": "MyMoney",
    "Audience": "MyMoney-Users",
    "ExpirationMinutes": 60
  },
  "OAuth": {
    "Google": {
      "ClientId": "your-google-client-id",
      "ClientSecret": "your-google-client-secret"
    },
    "Facebook": {
      "AppId": "your-facebook-app-id",
      "AppSecret": "your-facebook-app-secret"
    }
  }
}
```

4. Zainstaluj zależności i uruchom migracje:
```bash
dotnet restore
dotnet ef database update
```

5. Uruchom backend:
```bash
dotnet run
```

Backend będzie dostępny pod adresem: `https://localhost:7001`

### Krok 4: Konfiguracja frontendu

1. Przejdź do katalogu frontend:
```bash
cd ../frontend
```

2. Skopiuj plik środowiskowy:
```bash
cp template.env .env
```

3. Edytuj plik `.env`:
```env
REACT_APP_API_URL=https://localhost:7001/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_FACEBOOK_APP_ID=your-facebook-app-id
```

4. Zainstaluj zależności:
```bash
npm install
```

5. Uruchom aplikację:
```bash
npm start
```

Frontend będzie dostępny pod adresem: `http://localhost:3000`

## Instalacja z Docker

### Krok 1: Klonowanie repozytorium

```bash
git clone https://github.com/your-username/MyMoney.git
cd MyMoney
```

### Krok 2: Konfiguracja zmiennych środowiskowych

1. Skopiuj przykładowy plik docker-compose:
```bash
cp docker-compose.yml docker-compose.override.yml
```

2. Edytuj `docker-compose.override.yml`:
```yaml
version: '3.8'

services:
  api:
    environment:
      - ConnectionStrings__DefaultConnection=Server=sqlserver;Database=MyMoneyDB;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=true;
      - JwtSettings__SecretKey=your-super-secret-key-here-minimum-32-characters
      - OAuth__Google__ClientId=your-google-client-id
      - OAuth__Google__ClientSecret=your-google-client-secret
      - OAuth__Facebook__AppId=your-facebook-app-id
      - OAuth__Facebook__AppSecret=your-facebook-app-secret

  frontend:
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
      - REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
      - REACT_APP_FACEBOOK_APP_ID=your-facebook-app-id
```

### Krok 3: Uruchomienie aplikacji

```bash
docker-compose up -d
```

Aplikacja będzie dostępna pod adresami:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger`

### Krok 4: Inicjalizacja bazy danych

```bash
# Uruchom migracje bazy danych
docker-compose exec api dotnet ef database update
```

## Konfiguracja OAuth

### Google OAuth

1. Przejdź do [Google Cloud Console](https://console.cloud.google.com/)
2. Utwórz nowy projekt lub wybierz istniejący
3. Włącz Google+ API
4. Utwórz credentials (OAuth 2.0 Client ID)
5. Dodaj authorized redirect URIs:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)

### Facebook OAuth

1. Przejdź do [Facebook Developers](https://developers.facebook.com/)
2. Utwórz nową aplikację
3. Dodaj Facebook Login product
4. Skonfiguruj Valid OAuth Redirect URIs:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)

## Weryfikacja instalacji

### Sprawdzenie backendu

```bash
curl -X GET "https://localhost:7001/api/health" -H "accept: text/plain"
```

Oczekiwana odpowiedź: `Healthy`

### Sprawdzenie frontendu

Otwórz przeglądarkę i przejdź do `http://localhost:3000`. Powinieneś zobaczyć stronę logowania.

### Sprawdzenie bazy danych

```bash
# Dla instalacji lokalnej
sqlcmd -S localhost\SQLEXPRESS -Q "SELECT name FROM sys.databases WHERE name = 'MyMoneyDB'"

# Dla Docker
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -Q "SELECT name FROM sys.databases WHERE name = 'MyMoneyDB'"
```

## Rozwiązywanie problemów instalacji

### Problem: Błąd połączenia z bazą danych

**Rozwiązanie:**
1. Sprawdź czy SQL Server jest uruchomiony
2. Zweryfikuj connection string
3. Sprawdź czy baza danych została utworzona

### Problem: Błąd CORS w przeglądarce

**Rozwiązanie:**
1. Sprawdź konfigurację CORS w `Program.cs`
2. Upewnij się, że frontend URL jest dodany do allowed origins

### Problem: Błąd certyfikatu SSL

**Rozwiązanie:**
1. Dla developmentu dodaj `TrustServerCertificate=true` do connection string
2. Zainstaluj certyfikat deweloperski: `dotnet dev-certs https --trust`

### Problem: Port już używany

**Rozwiązanie:**
1. Zmień porty w `launchSettings.json` (backend) i `package.json` (frontend)
2. Lub zatrzymaj proces używający portu: `lsof -ti:3000 | xargs kill -9`

## Konfiguracja środowiska produkcyjnego

### Zmienne środowiskowe produkcyjne

```bash
# Backend
export ConnectionStrings__DefaultConnection="your-production-connection-string"
export JwtSettings__SecretKey="your-production-secret-key"
export ASPNETCORE_ENVIRONMENT="Production"

# Frontend
export REACT_APP_API_URL="https://api.yourdomain.com"
export NODE_ENV="production"
```

### Budowanie dla produkcji

```bash
# Frontend
cd frontend
npm run build

# Backend
cd api
dotnet publish -c Release -o ./publish
```

### Konfiguracja HTTPS

1. Uzyskaj certyfikat SSL (Let's Encrypt, CloudFlare, itp.)
2. Skonfiguruj reverse proxy (nginx, Apache)
3. Zaktualizuj konfigurację CORS

---

**Uwaga:** Pamiętaj o regularnym aktualizowaniu zależności i monitorowaniu bezpieczeństwa aplikacji. 