# Wdrożenie MyMoney

## Przegląd strategii wdrożenia

MyMoney może być wdrożona na różne sposoby, w zależności od wymagań i budżetu. Dokumentacja obejmuje wdrożenie lokalne, w chmurze oraz przy użyciu kontenerów Docker.

## Środowiska

### 1. Development (Deweloperskie)
- **Cel**: Rozwój i testowanie funkcjonalności
- **Infrastruktura**: Lokalne maszyny deweloperów
- **Baza danych**: SQL Server Express lub Docker
- **Dostęp**: Tylko zespół deweloperski

### 2. Staging (Testowe)
- **Cel**: Testowanie integracyjne i akceptacyjne
- **Infrastruktura**: Serwer testowy lub chmura
- **Baza danych**: SQL Server (kopia produkcyjnej)
- **Dostęp**: Zespół deweloperski + testerzy

### 3. Production (Produkcyjne)
- **Cel**: Środowisko dla użytkowników końcowych
- **Infrastruktura**: Serwery produkcyjne lub chmura
- **Baza danych**: SQL Server z replikacją
- **Dostęp**: Użytkownicy końcowi

## Wdrożenie lokalne

### Wymagania serwera

**Minimalne:**
- CPU: 2 rdzenie, 2.0 GHz
- RAM: 4 GB
- Dysk: 50 GB SSD
- OS: Windows Server 2019+ lub Ubuntu 20.04+

**Zalecane:**
- CPU: 4 rdzenie, 3.0 GHz
- RAM: 8 GB
- Dysk: 100 GB SSD
- OS: Windows Server 2022 lub Ubuntu 22.04

### Instalacja na Windows Server

#### Krok 1: Instalacja wymaganych komponentów

```powershell
# Instalacja IIS
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer
Enable-WindowsOptionalFeature -Online -FeatureName IIS-CommonHttpFeatures
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpErrors
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpLogging
Enable-WindowsOptionalFeature -Online -FeatureName IIS-Security
Enable-WindowsOptionalFeature -Online -FeatureName IIS-RequestFiltering

# Instalacja .NET 9.0 Hosting Bundle
Invoke-WebRequest -Uri "https://download.dotnet.microsoft.com/dotnet/9.0/dotnet-hosting-9.0.0-win.exe" -OutFile "dotnet-hosting.exe"
.\dotnet-hosting.exe /quiet

# Restart IIS
iisreset
```

#### Krok 2: Konfiguracja SQL Server

```sql
-- Utworzenie bazy danych
CREATE DATABASE MyMoneyDB;

-- Utworzenie użytkownika aplikacji
CREATE LOGIN MyMoneyApp WITH PASSWORD = 'StrongPassword123!';
USE MyMoneyDB;
CREATE USER MyMoneyApp FOR LOGIN MyMoneyApp;
ALTER ROLE db_owner ADD MEMBER MyMoneyApp;
```

#### Krok 3: Wdrożenie aplikacji

```powershell
# Publikacja backendu
cd api
dotnet publish -c Release -o C:\inetpub\wwwroot\mymoney-api

# Budowanie frontendu
cd ..\frontend
npm install
npm run build

# Kopiowanie frontendu
Copy-Item -Path "build\*" -Destination "C:\inetpub\wwwroot\mymoney-frontend" -Recurse
```

#### Krok 4: Konfiguracja IIS

```xml
<!-- web.config dla API -->
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <handlers>
        <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
      </handlers>
      <aspNetCore processPath="dotnet" 
                  arguments=".\api.dll" 
                  stdoutLogEnabled="false" 
                  stdoutLogFile=".\logs\stdout" 
                  hostingModel="inprocess" />
    </system.webServer>
  </location>
</configuration>
```

### Instalacja na Ubuntu

#### Krok 1: Instalacja wymaganych pakietów

```bash
# Aktualizacja systemu
sudo apt update && sudo apt upgrade -y

# Instalacja .NET 9.0
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt update
sudo apt install -y dotnet-sdk-9.0 aspnetcore-runtime-9.0

# Instalacja Nginx
sudo apt install -y nginx

# Instalacja Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Krok 2: Konfiguracja bazy danych

```bash
# Instalacja SQL Server (Docker)
sudo docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
   -p 1433:1433 --name sqlserver --restart unless-stopped \
   -d mcr.microsoft.com/mssql/server:2019-latest
```

#### Krok 3: Wdrożenie aplikacji

```bash
# Utworzenie użytkownika aplikacji
sudo useradd -m -s /bin/bash mymoney
sudo mkdir -p /var/www/mymoney
sudo chown mymoney:mymoney /var/www/mymoney

# Publikacja backendu
cd api
dotnet publish -c Release -o /var/www/mymoney/api
sudo chown -R mymoney:mymoney /var/www/mymoney/api

# Budowanie frontendu
cd ../frontend
npm install
npm run build
sudo cp -r build/* /var/www/mymoney/frontend/
sudo chown -R www-data:www-data /var/www/mymoney/frontend
```

#### Krok 4: Konfiguracja systemd

```ini
# /etc/systemd/system/mymoney-api.service
[Unit]
Description=MyMoney API
After=network.target

[Service]
Type=notify
User=mymoney
WorkingDirectory=/var/www/mymoney/api
ExecStart=/usr/bin/dotnet /var/www/mymoney/api/api.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=mymoney-api
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

```bash
# Uruchomienie usługi
sudo systemctl enable mymoney-api
sudo systemctl start mymoney-api
sudo systemctl status mymoney-api
```

#### Krok 5: Konfiguracja Nginx

```nginx
# /etc/nginx/sites-available/mymoney
server {
    listen 80;
    server_name yourdomain.com;
    
    # Frontend
    location / {
        root /var/www/mymoney/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Aktywacja konfiguracji
sudo ln -s /etc/nginx/sites-available/mymoney /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Wdrożenie w chmurze

### Azure App Service

#### Krok 1: Utworzenie zasobów

```bash
# Logowanie do Azure
az login

# Utworzenie grupy zasobów
az group create --name MyMoneyRG --location "West Europe"

# Utworzenie planu App Service
az appservice plan create --name MyMoneyPlan --resource-group MyMoneyRG --sku B1 --is-linux

# Utworzenie Web App dla API
az webapp create --resource-group MyMoneyRG --plan MyMoneyPlan --name mymoney-api --runtime "DOTNETCORE:9.0"

# Utworzenie Web App dla frontendu
az webapp create --resource-group MyMoneyRG --plan MyMoneyPlan --name mymoney-frontend --runtime "NODE:18-lts"

# Utworzenie SQL Database
az sql server create --name mymoney-sql --resource-group MyMoneyRG --location "West Europe" --admin-user mymoneyadmin --admin-password "YourStrong@Passw0rd"
az sql db create --resource-group MyMoneyRG --server mymoney-sql --name MyMoneyDB --service-objective Basic
```

#### Krok 2: Konfiguracja zmiennych środowiskowych

```bash
# Konfiguracja API
az webapp config appsettings set --resource-group MyMoneyRG --name mymoney-api --settings \
    ConnectionStrings__DefaultConnection="Server=mymoney-sql.database.windows.net;Database=MyMoneyDB;User Id=mymoneyadmin;Password=YourStrong@Passw0rd;Encrypt=true;" \
    JwtSettings__SecretKey="your-super-secret-key-here-minimum-32-characters" \
    ASPNETCORE_ENVIRONMENT="Production"

# Konfiguracja frontendu
az webapp config appsettings set --resource-group MyMoneyRG --name mymoney-frontend --settings \
    REACT_APP_API_URL="https://mymoney-api.azurewebsites.net/api"
```

#### Krok 3: Wdrożenie kodu

```bash
# Wdrożenie API
cd api
az webapp deployment source config-zip --resource-group MyMoneyRG --name mymoney-api --src publish.zip

# Wdrożenie frontendu
cd ../frontend
npm run build
zip -r build.zip build/*
az webapp deployment source config-zip --resource-group MyMoneyRG --name mymoney-frontend --src build.zip
```

### AWS Elastic Beanstalk

#### Krok 1: Przygotowanie aplikacji

```bash
# Instalacja EB CLI
pip install awsebcli

# Inicjalizacja projektu
cd api
eb init mymoney-api --platform "64bit Amazon Linux 2 v2.2.0 running .NET Core" --region us-west-2

# Utworzenie środowiska
eb create production --database.engine sqlserver-ex --database.username mymoneyadmin
```

#### Krok 2: Konfiguracja

```yaml
# .ebextensions/01-environment.config
option_settings:
  aws:elasticbeanstalk:application:environment:
    ASPNETCORE_ENVIRONMENT: Production
    ConnectionStrings__DefaultConnection: "Server=your-rds-endpoint;Database=MyMoneyDB;User Id=mymoneyadmin;Password=YourPassword;"
```

#### Krok 3: Wdrożenie

```bash
# Wdrożenie API
eb deploy

# Wdrożenie frontendu do S3 + CloudFront
cd ../frontend
npm run build
aws s3 sync build/ s3://mymoney-frontend-bucket --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Wdrożenie z Docker

### Docker Compose - Produkcja

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Passw0rd
    volumes:
      - sqlserver_data:/var/opt/mssql
    ports:
      - "1433:1433"
    restart: unless-stopped

  api:
    build:
      context: ./api
      dockerfile: Dockerfile-prod.dockerfile
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=sqlserver;Database=MyMoneyDB;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=true;
    depends_on:
      - sqlserver
    ports:
      - "5000:80"
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile-prod.dockerfile
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
    ports:
      - "3000:80"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - api
      - frontend
    restart: unless-stopped

volumes:
  sqlserver_data:
```

### Konfiguracja Nginx dla Docker

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:80;
    }
    
    upstream frontend {
        server frontend:80;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        location /api/ {
            proxy_pass http://api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        location / {
            proxy_pass http://frontend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Uruchomienie produkcyjne

```bash
# Budowanie i uruchomienie
docker-compose -f docker-compose.prod.yml up -d

# Sprawdzenie statusu
docker-compose -f docker-compose.prod.yml ps

# Logi
docker-compose -f docker-compose.prod.yml logs -f
```

## Kubernetes

### Deployment manifesty

```yaml
# api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mymoney-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mymoney-api
  template:
    metadata:
      labels:
        app: mymoney-api
    spec:
      containers:
      - name: api
        image: mymoney/api:latest
        ports:
        - containerPort: 80
        env:
        - name: ASPNETCORE_ENVIRONMENT
          value: "Production"
        - name: ConnectionStrings__DefaultConnection
          valueFrom:
            secretKeyRef:
              name: mymoney-secrets
              key: connection-string
---
apiVersion: v1
kind: Service
metadata:
  name: mymoney-api-service
spec:
  selector:
    app: mymoney-api
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

```yaml
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mymoney-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mymoney-frontend
  template:
    metadata:
      labels:
        app: mymoney-frontend
    spec:
      containers:
      - name: frontend
        image: mymoney/frontend:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: mymoney-frontend-service
spec:
  selector:
    app: mymoney-frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mymoney-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: mymoney.yourdomain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: mymoney-api-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: mymoney-frontend-service
            port:
              number: 80
```

## SSL/TLS

### Let's Encrypt z Certbot

```bash
# Instalacja Certbot
sudo apt install certbot python3-certbot-nginx

# Uzyskanie certyfikatu
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Automatyczne odnawianie
sudo crontab -e
# Dodaj linię:
0 12 * * * /usr/bin/certbot renew --quiet
```

### Konfiguracja HTTPS w Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Reszta konfiguracji...
}

# Przekierowanie HTTP na HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitorowanie i logowanie

### Konfiguracja logowania

```json
// appsettings.Production.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    },
    "File": {
      "Path": "/var/log/mymoney/app.log",
      "FileSizeLimitBytes": 10485760,
      "MaxRollingFiles": 10
    }
  }
}
```

### Health Checks

```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString)
    .AddCheck("api", () => HealthCheckResult.Healthy());

app.MapHealthChecks("/health");
```

### Monitoring z Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'mymoney-api'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'
```

## Backup i odzyskiwanie

### Automatyczny backup bazy danych

```bash
#!/bin/bash
# backup-script.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mymoney"
DB_NAME="MyMoneyDB"

# Utworzenie katalogu backup
mkdir -p $BACKUP_DIR

# Backup bazy danych
sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -Q "BACKUP DATABASE [$DB_NAME] TO DISK = N'$BACKUP_DIR/MyMoneyDB_$DATE.bak'"

# Usunięcie starych backupów (starszych niż 30 dni)
find $BACKUP_DIR -name "*.bak" -mtime +30 -delete

echo "Backup completed: MyMoneyDB_$DATE.bak"
```

```bash
# Dodanie do crontab
0 2 * * * /path/to/backup-script.sh
```

## Checklist wdrożenia

### Pre-deployment
- [ ] Testy jednostkowe przechodzą
- [ ] Testy integracyjne przechodzą
- [ ] Code review zakończony
- [ ] Dokumentacja zaktualizowana
- [ ] Zmienne środowiskowe skonfigurowane
- [ ] Certyfikaty SSL gotowe

### Deployment
- [ ] Backup bazy danych utworzony
- [ ] Aplikacja wdrożona
- [ ] Migracje bazy danych uruchomione
- [ ] Health checks przechodzą
- [ ] SSL działa poprawnie
- [ ] Monitoring skonfigurowany

### Post-deployment
- [ ] Testy smoke przeszły
- [ ] Logi sprawdzone
- [ ] Wydajność zweryfikowana
- [ ] Użytkownicy powiadomieni
- [ ] Dokumentacja wdrożenia zaktualizowana

---

**Uwaga:** Zawsze testuj procedury wdrożenia w środowisku staging przed wdrożeniem produkcyjnym. 