# 🚀 MyMoney - Przewodnik Wdrożenia na Azure

Ten przewodnik opisuje jak wdrożyć aplikację MyMoney na Microsoft Azure przy użyciu Azure App Service i Azure SQL Database.

## 📋 Wymagania

Przed rozpoczęciem upewnij się, że masz zainstalowane:

- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Hub Account](https://hub.docker.com/) (darmowe konto)
- Subskrypcję Azure

## 🏗️ Architektura Wdrożenia

Aplikacja zostanie wdrożona jako:
- **Frontend + Backend**: Jeden kontener Docker na Azure App Service
- **Baza danych**: Azure SQL Database
- **Hosting**: Azure App Service (Linux)

## 🔧 Przygotowanie

### 1. Klonowanie repozytorium
```bash
git clone <your-repo-url>
cd MyMoney
```

### 2. Utworzenie konta Docker Hub
1. Przejdź na [hub.docker.com](https://hub.docker.com)
2. Utwórz darmowe konto
3. Zapamiętaj swoją nazwę użytkownika i hasło

## 🚀 Automatyczne Wdrożenie

### Opcja A: Linux/macOS (Bash)
```bash
chmod +x deploy.sh
./deploy.sh
```

### Opcja B: Windows (PowerShell)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\deploy.ps1
```

Skrypt automatycznie:
1. ✅ Sprawdzi wymagane narzędzia
2. 🔐 Zaloguje do Azure
3. 📦 Utworzy grupę zasobów
4. 🐳 Zbuduje obraz Docker
5. 📤 Wyśle obraz na Docker Hub
6. 🔐 Wygeneruje bezpieczne hasła
7. 🚀 Wdroży infrastrukturę na Azure
8. 🌐 Udostępni URL aplikacji

## 🛠️ Ręczne Wdrożenie

### Krok 1: Logowanie do Azure
```bash
az login
```

### Krok 2: Utworzenie grupy zasobów
```bash
az group create --name mymoney-rg --location westeurope
```

### Krok 3: Budowanie obrazu Docker
```bash
docker build -t mymoney:latest .
```

### Krok 4: Wysłanie na Docker Hub
```bash
# Zastąp YOUR_USERNAME swoją nazwą użytkownika Docker Hub
docker tag mymoney:latest YOUR_USERNAME/mymoney:latest
docker push YOUR_USERNAME/mymoney:latest
```

### Krok 5: Edycja parametrów
Edytuj plik `azure-deployment-parameters.json`:
```json
{
    "linuxFxVersion": {
        "value": "DOCKER|YOUR_USERNAME/mymoney:latest"
    },
    "dockerRegistryUsername": {
        "value": "YOUR_USERNAME"
    },
    "dockerRegistryPassword": {
        "value": "YOUR_PASSWORD"
    }
}
```

### Krok 6: Wdrożenie ARM Template
```bash
az deployment group create \
    --resource-group mymoney-rg \
    --template-file azure-deployment-template.json \
    --parameters @azure-deployment-parameters.json
```

## 🔧 Konfiguracja

### Zmienne środowiskowe
Aplikacja automatycznie konfiguruje następujące zmienne:

- `ConnectionStrings__DefaultConnection`: Połączenie z Azure SQL
- `JwtSettings__SecretKey`: Klucz JWT
- `ASPNETCORE_ENVIRONMENT`: Production
- `REACT_APP_API_URL`: URL aplikacji

### Porty
- **Frontend**: 3000 (główny port aplikacji)
- **Backend API**: 5032 (wewnętrzny)

## 🗄️ Baza Danych

### Automatyczna migracja
Aplikacja automatycznie:
1. Tworzy bazę danych Azure SQL
2. Uruchamia migracje Entity Framework
3. Inicjalizuje dane początkowe

### Połączenie z bazą
- **Serwer**: `{app-name}-sql.database.windows.net`
- **Baza**: `MyMoney`
- **Użytkownik**: `mymoneyadmin`
- **Hasło**: Generowane automatycznie

## 🔐 Bezpieczeństwo

### Automatycznie generowane:
- Hasło administratora SQL (25 znaków)
- Klucz JWT (64 znaki)
- Unikalne nazwy zasobów

### Konfiguracja bezpieczeństwa:
- HTTPS wymuszony
- Firewall SQL skonfigurowany dla Azure
- Podstawowe uwierzytelnianie wyłączone

## 📊 Monitorowanie

### Azure Portal
1. Przejdź do [portal.azure.com](https://portal.azure.com)
2. Znajdź grupę zasobów `mymoney-rg`
3. Sprawdź:
   - App Service (aplikacja)
   - SQL Server (baza danych)
   - App Service Plan (hosting)

### Logi aplikacji
```bash
az webapp log tail --name {app-name} --resource-group mymoney-rg
```

## 🔄 Aktualizacja Aplikacji

### 1. Zbuduj nowy obraz
```bash
docker build -t mymoney:latest .
docker tag mymoney:latest YOUR_USERNAME/mymoney:latest
docker push YOUR_USERNAME/mymoney:latest
```

### 2. Restart aplikacji
```bash
az webapp restart --name {app-name} --resource-group mymoney-rg
```

## 🧹 Czyszczenie Zasobów

Aby usunąć wszystkie zasoby:
```bash
az group delete --name mymoney-rg --yes --no-wait
```

## 🆘 Rozwiązywanie Problemów

### Problem: Aplikacja nie startuje
**Rozwiązanie**: Sprawdź logi
```bash
az webapp log tail --name {app-name} --resource-group mymoney-rg
```

### Problem: Błąd połączenia z bazą
**Rozwiązanie**: Sprawdź firewall SQL
```bash
az sql server firewall-rule list --server {sql-server} --resource-group mymoney-rg
```

### Problem: Docker build fails
**Rozwiązanie**: Sprawdź czy wszystkie pliki są w kontekście build
```bash
docker build --no-cache -t mymoney:latest .
```

## 💰 Koszty

### Szacowane koszty miesięczne (EUR):
- **App Service B1**: ~13 EUR
- **SQL Database Basic**: ~5 EUR
- **Łącznie**: ~18 EUR/miesiąc

### Optymalizacja kosztów:
- Użyj F1 (Free) dla testów
- Zatrzymaj zasoby gdy nie są używane
- Monitoruj użycie w Azure Cost Management

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź logi aplikacji
2. Sprawdź status zasobów w Azure Portal
3. Sprawdź dokumentację Azure App Service

## 🎉 Gratulacje!

Twoja aplikacja MyMoney jest teraz dostępna w chmurze Azure! 🌐

URL: `https://{app-name}.azurewebsites.net` 