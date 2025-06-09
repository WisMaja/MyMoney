# Wdrożenie aplikacji do Azure za pomocą Azure Service


## 1. Utworzono Grupe zasobów MyMoney



## 2. Utworzono AppService MyMoney
### 2.1 Utworzenie zasobu
![image](https://github.com/user-attachments/assets/98905f31-faf9-4070-ba5f-2cabb1825f2b)
Teraz pod tym adresem po właczeniu usługi znajduje sie api:
mymoneyapp-d6fzceh5g6ekb3gw.polandcentral-01.azurewebsites.net

### 2.2 Deploy kodu przy pomocy wbudowanych narzędzi
zalogowano sie do azure
stworzono bilda zipa czy cos takiego
i zrobienie deploy

## 3. Podmieniono w .env we Frontendzie adres backendu
```sh
REACT_APP_API_URL=https://mymoneyapp-d6fzceh5g6ekb3gw.polandcentral-01.azurewebsites.net/api
```
Teraz lokalny frontend działa wraz z backendem wdrożonym na chmure Azure
## 4. Wdrożenie bazy przy pomocy Azure Database for PostgreSQL flexible server
### 4.1 Utworzenie servera na którym bedzi estała baza
### 4.2 Utworzenie bazy danych
### 4.3 Podmienienie connectionstring w appsetings.json
### 4.4 Wykonanie stworzonych juz migracji przy pomocy 


## 5. 

---

**Dodatkowe informacje:**
- Upewnij się, że masz zainstalowane narzędzia Azure CLI oraz Docker.
- Zmienna `<ACR_PASSWORD>` powinna być zastąpiona rzeczywistym hasłem z komendy `az acr credential show`.
