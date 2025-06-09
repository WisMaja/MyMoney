# Wdrożenie aplikacji do Azure za pomocą Azure Service


## 1. Utworzono Grupe zasobów MyMoney



## 2. Utworzono AppService MyMoney
![image](https://github.com/user-attachments/assets/98905f31-faf9-4070-ba5f-2cabb1825f2b)


## 3. Zaloguj się do ACR

```sh
az acr login --name mymoneyacr
```

## 4. Otaguj obraz Dockera

```sh
docker tag frontend-mymoney:latest mymoneyacr.azurecr.io/frontend-mymoney:latest
```

## 5. Zaloguj się do rejestru Docker

```sh
docker login mymoneyacr.azurecr.io
```

## 6. Wypchnij obraz do ACR

```sh
docker push mymoneyacr.azurecr.io/frontend-mymoney:latest
```

## 7. Utwórz instancję kontenera w Azure

```sh
az container create \
  --resource-group my-money \
  --name mymoneycontainerinstance \
  --image mymoneyacr.azurecr.io/frontend-mymoney:latest \
  --registry-login-server mymoneyacr.azurecr.io \
  --dns-name-label frontendmymoney \
  --ports 80 3000 \
  --registry-username mymoneyacr \
  --registry-password <ACR_PASSWORD>
```

> **Uwaga:** Hasło do rejestru możesz pobrać poniższą komendą:

```sh
az acr credential show --name mymoneyacr
```

Zaleca się nie trzymać hasła w plikach ani w repozytorium.

---

**Dodatkowe informacje:**
- Upewnij się, że masz zainstalowane narzędzia Azure CLI oraz Docker.
- Zmienna `<ACR_PASSWORD>` powinna być zastąpiona rzeczywistym hasłem z komendy `az acr credential show`.
