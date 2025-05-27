# Wdrożenie MyMoney

## Aktualny stan wdrożenia

### ❌ Brak wdrożenia produkcyjnego

Projekt MyMoney **nie jest wdrożony na żadnym środowisku produkcyjnym**. Dokumentacja opisuje rzeczywisty stan bez zmyślonych funkcji.

## Dostępne konfiguracje

### Docker - Częściowo skonfigurowany

**docker-compose.yml** (tylko SQL Server):
```yaml
services:
  mssql:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: local_mssql_server_MyMoney
    environment:
      SA_PASSWORD: "YourStrong!Passw0rd"
      ACCEPT_EULA: "Y"
    ports:
      - "1433:1433"
    volumes:
      - mssql_data:/var/opt/mssql
    restart: unless-stopped
```

**docker-compose-prod.yml** (pełna aplikacja):
```yaml
services:
  mssql:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      SA_PASSWORD: "YourStrong!Passw0rd"
      ACCEPT_EULA: "Y"
    ports:
      - "1433:1433"
    volumes:
      - mssql_data:/var/opt/mssql

  api:
    build:
      context: ./api
      dockerfile: Dockerfile-prod.dockerfile
    ports:
      - "80:80"
      - "5032:5032"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile-prod.dockerfile
    ports:
      - "3000:3000"
```

### Dockerfiles

**api/Dockerfile** (development):
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS dev
WORKDIR /app
COPY *.csproj ./
RUN dotnet restore
COPY . ./
RUN dotnet tool install --global dotnet-watch
ENV PATH="$PATH:/root/.dotnet/tools"
EXPOSE 5032
CMD ["dotnet", "watch", "run"]
```

**api/Dockerfile-prod.dockerfile**:
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app
COPY *.csproj ./
RUN dotnet restore
COPY . ./
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/out /out
ENTRYPOINT ["dotnet", "/out/api.dll"]
```

**frontend/Dockerfile** (development):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
EXPOSE 3000
CMD ["npm", "start"]
```

**frontend/Dockerfile-prod.dockerfile**:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY --from=build /app/build ./build
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
```

## Aktualne uruchomienie

### Lokalne (bez Docker)

```bash
# Backend
cd api
dotnet run  # http://localhost:5032

# Frontend  
cd frontend
npm start   # http://localhost:3000
```

### Z Docker (tylko baza danych)

```bash
docker-compose up -d  # Tylko SQL Server
# Potem uruchom backend i frontend lokalnie
```

### Pełny Docker (teoretyczny)

```bash
docker-compose -f docker-compose-prod.yml up -d
```

**Problem:** Nie testowane, może nie działać

## Brakujące elementy wdrożenia

### 1. Środowiska

**Brak:**
- Staging environment
- Production environment
- Development environment (poza lokalnym)

### 2. CI/CD Pipeline

**Brak:**
- GitHub Actions
- Automatyczne buildy
- Automatyczne testy
- Automatyczne wdrożenie

### 3. Infrastruktura chmurowa

**Brak:**
- Azure App Service
- AWS Elastic Beanstalk
- Google Cloud Platform
- Heroku

### 4. Konfiguracja produkcyjna

**Problemy:**
- Hardcoded JWT secret
- Brak HTTPS
- CORS AllowAll
- Brak zmiennych środowiskowych
- Brak konfiguracji logowania

### 5. Monitoring i logowanie

**Brak:**
- Application Insights
- Sentry
- Health checks
- Metryki wydajności

### 6. Backup i odzyskiwanie

**Brak:**
- Automatyczne backupy bazy danych
- Strategia disaster recovery
- Monitoring dostępności

## Konfiguracja środowisk (do zrobienia)

### appsettings.Production.json (NIE ISTNIEJE)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=prod-server;Database=MyMoney;User Id=prod-user;Password=prod-password;Encrypt=true;"
  },
  "JwtSettings": {
    "SecretKey": "production-secret-key-32-characters-minimum",
    "ExpirationMinutes": 60,
    "RefreshExpirationHours": 24
  },
  "AllowedHosts": "yourdomain.com"
}
```

### Zmienne środowiskowe (do skonfigurowania)

```bash
# Backend
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection="Server=..."
JwtSettings__SecretKey="..."

# Frontend
REACT_APP_API_URL=https://api.yourdomain.com/api
NODE_ENV=production
```

## Plan wdrożenia (do zaimplementowania)

### Faza 1: Przygotowanie

1. **Konfiguracja środowisk**
   - Utworzenie appsettings.Production.json
   - Konfiguracja zmiennych środowiskowych
   - Usunięcie hardcoded secrets

2. **Bezpieczeństwo**
   - Konfiguracja HTTPS
   - Poprawka CORS
   - Secure JWT secrets
   - Rate limiting

3. **Testy**
   - Implementacja testów jednostkowych
   - Testy integracyjne
   - Testy E2E

### Faza 2: CI/CD

1. **GitHub Actions**
   ```yaml
   # .github/workflows/deploy.yml (NIE ISTNIEJE)
   name: Deploy
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Run tests
           run: |
             cd frontend && npm test
             cd api && dotnet test
   
     deploy:
       needs: test
       runs-on: ubuntu-latest
       steps:
         - name: Deploy to production
           run: echo "Deploy steps here"
   ```

2. **Automatyzacja**
   - Build na każdy commit
   - Deploy na main branch
   - Rollback w przypadku błędów

### Faza 3: Infrastruktura

1. **Wybór platformy**
   - Azure App Service (zalecane dla .NET)
   - AWS Elastic Beanstalk
   - Docker na VPS

2. **Baza danych**
   - Azure SQL Database
   - AWS RDS
   - Managed SQL Server

3. **CDN i static files**
   - Azure Blob Storage
   - AWS S3 + CloudFront
   - Nginx dla static files

### Faza 4: Monitoring

1. **Logowanie**
   - Structured logging
   - Centralized logs
   - Error tracking

2. **Metryki**
   - Application performance
   - Database performance
   - User analytics

3. **Alerting**
   - Downtime alerts
   - Error rate alerts
   - Performance alerts

## Przykład wdrożenia Azure (do zaimplementowania)

### 1. Utworzenie zasobów

```bash
# Grupa zasobów
az group create --name MyMoneyRG --location "West Europe"

# App Service Plan
az appservice plan create --name MyMoneyPlan --resource-group MyMoneyRG --sku B1

# Web Apps
az webapp create --resource-group MyMoneyRG --plan MyMoneyPlan --name mymoney-api --runtime "DOTNETCORE:9.0"
az webapp create --resource-group MyMoneyRG --plan MyMoneyPlan --name mymoney-frontend --runtime "NODE:18-lts"

# SQL Database
az sql server create --name mymoney-sql --resource-group MyMoneyRG --admin-user admin --admin-password "StrongPassword123!"
az sql db create --resource-group MyMoneyRG --server mymoney-sql --name MyMoneyDB
```

### 2. Konfiguracja

```bash
# API settings
az webapp config appsettings set --resource-group MyMoneyRG --name mymoney-api --settings \
    ConnectionStrings__DefaultConnection="Server=mymoney-sql.database.windows.net;Database=MyMoneyDB;User Id=admin;Password=StrongPassword123!;Encrypt=true;" \
    JwtSettings__SecretKey="production-secret-key-32-characters-minimum" \
    ASPNETCORE_ENVIRONMENT="Production"

# Frontend settings
az webapp config appsettings set --resource-group MyMoneyRG --name mymoney-frontend --settings \
    REACT_APP_API_URL="https://mymoney-api.azurewebsites.net/api"
```

### 3. Wdrożenie

```bash
# API
cd api
dotnet publish -c Release -o ./publish
zip -r publish.zip ./publish/*
az webapp deployment source config-zip --resource-group MyMoneyRG --name mymoney-api --src publish.zip

# Frontend
cd frontend
npm run build
zip -r build.zip build/*
az webapp deployment source config-zip --resource-group MyMoneyRG --name mymoney-frontend --src build.zip
```

## Problemy do rozwiązania

### 1. Bezpieczeństwo
- 🔴 Hardcoded JWT secret w kodzie
- 🔴 Brak HTTPS
- 🔴 CORS AllowAll
- 🟡 Brak rate limiting
- 🟡 Brak input validation

### 2. Konfiguracja
- 🔴 Brak production appsettings
- 🔴 Brak zmiennych środowiskowych
- 🟡 Brak health checks
- 🟡 Brak structured logging

### 3. Infrastruktura
- 🔴 Brak środowiska produkcyjnego
- 🔴 Brak CI/CD
- 🔴 Brak monitoringu
- 🟡 Brak backup strategy

### 4. Wydajność
- 🟡 Brak cache'owania
- 🟡 Brak CDN
- 🟡 Brak optymalizacji obrazów
- 🟡 Brak compression

## Komendy do testowania Docker

### Lokalne testowanie

```bash
# Build images
docker build -t mymoney-api -f api/Dockerfile-prod.dockerfile api/
docker build -t mymoney-frontend -f frontend/Dockerfile-prod.dockerfile frontend/

# Run production compose
docker-compose -f docker-compose-prod.yml up -d

# Check logs
docker-compose -f docker-compose-prod.yml logs -f

# Stop
docker-compose -f docker-compose-prod.yml down
```

### Sprawdzenie statusu

```bash
# Check containers
docker ps

# Check networks
docker network ls

# Check volumes
docker volume ls

# Check images
docker images
```

## Checklist przed wdrożeniem

### Bezpieczeństwo
- [ ] Usunięcie hardcoded secrets
- [ ] Konfiguracja HTTPS
- [ ] Poprawka CORS
- [ ] Implementacja rate limiting
- [ ] Walidacja input

### Konfiguracja
- [ ] Production appsettings
- [ ] Zmienne środowiskowe
- [ ] Health checks
- [ ] Structured logging
- [ ] Error handling

### Testy
- [ ] Testy jednostkowe
- [ ] Testy integracyjne
- [ ] Testy E2E
- [ ] Load testing
- [ ] Security testing

### Infrastruktura
- [ ] Wybór platformy
- [ ] Konfiguracja bazy danych
- [ ] Backup strategy
- [ ] Monitoring setup
- [ ] CI/CD pipeline

### Dokumentacja
- [ ] Deployment guide
- [ ] Runbook
- [ ] Troubleshooting guide
- [ ] API documentation
- [ ] User manual

---

**Status:** Wdrożenie nie jest zaimplementowane. Projekt wymaga kompletnej konfiguracji przed wdrożeniem produkcyjnym. 