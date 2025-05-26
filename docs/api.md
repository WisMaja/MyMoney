# Dokumentacja API MyMoney

## Przegląd

API MyMoney to RESTful API zbudowane w .NET 9.0, które obsługuje wszystkie operacje związane z zarządzaniem finansami osobistymi. API wykorzystuje uwierzytelnianie JWT i obsługuje operacje CRUD dla użytkowników, kont, transakcji i kategorii.

## Adres bazowy

```
Development: https://localhost:7001/api
Production: https://api.yourdomain.com/api
```

## Uwierzytelnianie

API wykorzystuje JWT (JSON Web Tokens) do uwierzytelniania. Większość endpointów wymaga nagłówka Authorization.

### Format nagłówka

```http
Authorization: Bearer <your-jwt-token>
```

### Tokeny

- **Access Token**: Ważny przez 60 minut
- **Refresh Token**: Ważny przez 7 dni

## Kontrolery i Endpointy

### 1. AuthController - Uwierzytelnianie

#### POST /api/auth/register
Rejestracja nowego użytkownika z automatycznym utworzeniem głównego konta.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
- `204 No Content` - Rejestracja udana
- `409 Conflict` - Użytkownik już istnieje
- `500 Internal Server Error` - Błąd serwera

**Przykład:**
```bash
curl -X POST "https://localhost:7001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jan.kowalski@example.com",
    "password": "MojeHaslo123!"
  }'
```

#### POST /api/auth/login
Logowanie użytkownika.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "abc123def456..."
}
```

**Status Codes:**
- `200 OK` - Logowanie udane
- `401 Unauthorized` - Nieprawidłowe dane

#### POST /api/auth/refresh
Odświeżenie tokenu dostępu.

**Request Body:**
```json
{
  "accessToken": "expired-jwt-token",
  "refreshToken": "valid-refresh-token"
}
```

**Response:**
```json
{
  "accessToken": "new-jwt-token",
  "refreshToken": "new-refresh-token"
}
```

#### PUT /api/auth/change-password
Zmiana hasła użytkownika (wymaga uwierzytelniania).

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Response:**
- `204 No Content` - Hasło zmienione
- `400 Bad Request` - Nieprawidłowe aktualne hasło
- `401 Unauthorized` - Brak autoryzacji

### 2. UserController - Zarządzanie użytkownikami

#### GET /api/user/profile
Pobieranie profilu aktualnego użytkownika.

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "mainWalletId": "456e7890-e89b-12d3-a456-426614174001"
}
```

#### PUT /api/user/profile
Aktualizacja profilu użytkownika.

**Request Body:**
```json
{
  "email": "newemail@example.com"
}
```

### 3. WalletController - Zarządzanie kontami

#### GET /api/wallet
Pobieranie wszystkich kont użytkownika.

**Response:**
```json
[
  {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "name": "Main Wallet",
    "type": "Personal",
    "initialBalance": 1000.00,
    "currentBalance": 850.50,
    "currency": "zł",
    "createdByUserId": "123e4567-e89b-12d3-a456-426614174000"
  }
]
```

#### POST /api/wallet
Tworzenie nowego konta.

**Request Body:**
```json
{
  "name": "Konto oszczędnościowe",
  "type": "Personal",
  "initialBalance": 500.00,
  "currency": "zł"
}
```

**Response:**
```json
{
  "id": "789e0123-e89b-12d3-a456-426614174002",
  "name": "Konto oszczędnościowe",
  "type": "Personal",
  "initialBalance": 500.00,
  "currentBalance": 500.00,
  "currency": "zł",
  "createdByUserId": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### GET /api/wallet/{id}
Pobieranie szczegółów konkretnego konta.

**Response:**
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "name": "Main Wallet",
  "type": "Personal",
  "initialBalance": 1000.00,
  "currentBalance": 850.50,
  "currency": "zł",
  "members": [
    {
      "userId": "123e4567-e89b-12d3-a456-426614174000",
      "role": "Owner"
    }
  ],
  "transactions": [
    {
      "id": "abc123def456",
      "amount": -50.00,
      "description": "Zakupy spożywcze",
      "date": "2024-12-01T10:30:00Z"
    }
  ]
}
```

#### PUT /api/wallet/{id}
Aktualizacja konta.

**Request Body:**
```json
{
  "name": "Nowa nazwa konta",
  "currency": "EUR"
}
```

#### DELETE /api/wallet/{id}
Usuwanie konta (tylko właściciel).

**Response:**
- `204 No Content` - Konto usunięte
- `403 Forbidden` - Brak uprawnień
- `404 Not Found` - Konto nie istnieje

#### POST /api/wallet/{id}/members
Dodawanie członka do konta.

**Request Body:**
```json
{
  "email": "friend@example.com"
}
```

#### DELETE /api/wallet/{walletId}/members/{userId}
Usuwanie członka z konta.

### 4. TransactionsController - Zarządzanie transakcjami

#### GET /api/transactions
Pobieranie transakcji z filtrowaniem i paginacją.

**Query Parameters:**
- `walletId` (optional) - ID konta
- `categoryId` (optional) - ID kategorii
- `startDate` (optional) - Data początkowa (YYYY-MM-DD)
- `endDate` (optional) - Data końcowa (YYYY-MM-DD)
- `type` (optional) - Typ transakcji (Income/Expense)
- `page` (default: 1) - Numer strony
- `pageSize` (default: 20) - Rozmiar strony

**Przykład:**
```
GET /api/transactions?walletId=456e7890-e89b-12d3-a456-426614174001&startDate=2024-12-01&endDate=2024-12-31&page=1&pageSize=10
```

**Response:**
```json
{
  "transactions": [
    {
      "id": "abc123def456",
      "walletId": "456e7890-e89b-12d3-a456-426614174001",
      "categoryId": "cat123",
      "amount": -50.00,
      "description": "Zakupy spożywcze",
      "date": "2024-12-01T10:30:00Z",
      "type": "Expense",
      "category": {
        "id": "cat123",
        "name": "Jedzenie",
        "type": "Expense",
        "icon": "🍕"
      }
    }
  ],
  "totalCount": 150,
  "page": 1,
  "pageSize": 10,
  "totalPages": 15
}
```

#### POST /api/transactions
Tworzenie nowej transakcji.

**Request Body:**
```json
{
  "walletId": "456e7890-e89b-12d3-a456-426614174001",
  "categoryId": "cat123",
  "amount": -75.50,
  "description": "Tankowanie samochodu",
  "date": "2024-12-01T15:30:00Z",
  "type": "Expense"
}
```

**Response:**
```json
{
  "id": "def456ghi789",
  "walletId": "456e7890-e89b-12d3-a456-426614174001",
  "categoryId": "cat123",
  "amount": -75.50,
  "description": "Tankowanie samochodu",
  "date": "2024-12-01T15:30:00Z",
  "type": "Expense"
}
```

#### GET /api/transactions/{id}
Pobieranie szczegółów transakcji.

#### PUT /api/transactions/{id}
Aktualizacja transakcji.

#### DELETE /api/transactions/{id}
Usuwanie transakcji.

#### GET /api/transactions/statistics
Pobieranie statystyk transakcji.

**Query Parameters:**
- `walletId` (optional) - ID konta
- `startDate` (optional) - Data początkowa
- `endDate` (optional) - Data końcowa

**Response:**
```json
{
  "totalIncome": 3000.00,
  "totalExpenses": 2150.50,
  "balance": 849.50,
  "transactionCount": 45,
  "expensesByCategory": [
    {
      "categoryName": "Jedzenie",
      "amount": 650.00,
      "percentage": 30.2
    },
    {
      "categoryName": "Transport",
      "amount": 400.00,
      "percentage": 18.6
    }
  ],
  "monthlyTrend": [
    {
      "month": "2024-11",
      "income": 2500.00,
      "expenses": 1800.00
    },
    {
      "month": "2024-12",
      "income": 2600.00,
      "expenses": 1950.00
    }
  ]
}
```

### 5. CategoryController - Zarządzanie kategoriami

#### GET /api/category
Pobieranie wszystkich kategorii (domyślnych + niestandardowych użytkownika).

**Response:**
```json
[
  {
    "id": "cat123",
    "name": "Jedzenie",
    "type": "Expense",
    "icon": "🍕",
    "isDefault": true
  },
  {
    "id": "cat456",
    "name": "Moja kategoria",
    "type": "Expense",
    "icon": "💼",
    "isDefault": false
  }
]
```

#### POST /api/category
Tworzenie niestandardowej kategorii.

**Request Body:**
```json
{
  "name": "Hobby",
  "type": "Expense",
  "icon": "🎨"
}
```

#### PUT /api/category/{id}
Aktualizacja kategorii (tylko niestandardowe).

#### DELETE /api/category/{id}
Usuwanie kategorii (tylko niestandardowe).

## Kody błędów

### Standardowe kody HTTP

- `200 OK` - Żądanie wykonane pomyślnie
- `201 Created` - Zasób utworzony
- `204 No Content` - Operacja wykonana, brak treści do zwrócenia
- `400 Bad Request` - Nieprawidłowe dane wejściowe
- `401 Unauthorized` - Brak autoryzacji
- `403 Forbidden` - Brak uprawnień
- `404 Not Found` - Zasób nie znaleziony
- `409 Conflict` - Konflikt (np. duplikat)
- `500 Internal Server Error` - Błąd serwera

### Niestandardowe błędy

```json
{
  "error": "ValidationError",
  "message": "Kwota transakcji musi być większa od zera",
  "details": {
    "field": "amount",
    "code": "INVALID_AMOUNT"
  }
}
```

## Limity i ograniczenia

### Rate Limiting
- **Uwierzytelnianie**: 5 żądań/minutę na IP
- **API ogólne**: 100 żądań/minutę na użytkownika
- **Transakcje**: 50 żądań/minutę na użytkownika

### Limity danych
- **Maksymalna liczba kont**: 10 na użytkownika
- **Maksymalna liczba transakcji**: 10,000 na konto
- **Maksymalna liczba kategorii niestandardowych**: 50 na użytkownika
- **Maksymalny rozmiar strony**: 100 elementów

## Przykłady użycia

### Kompletny przepływ rejestracji i pierwszej transakcji

```bash
# 1. Rejestracja
curl -X POST "https://localhost:7001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jan.kowalski@example.com",
    "password": "MojeHaslo123!"
  }'

# 2. Logowanie
TOKEN=$(curl -X POST "https://localhost:7001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jan.kowalski@example.com",
    "password": "MojeHaslo123!"
  }' | jq -r '.accessToken')

# 3. Pobieranie profilu
curl -X GET "https://localhost:7001/api/user/profile" \
  -H "Authorization: Bearer $TOKEN"

# 4. Pobieranie kont
WALLET_ID=$(curl -X GET "https://localhost:7001/api/wallet" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

# 5. Pobieranie kategorii
CATEGORY_ID=$(curl -X GET "https://localhost:7001/api/category" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | select(.name=="Jedzenie") | .id')

# 6. Dodanie transakcji
curl -X POST "https://localhost:7001/api/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"walletId\": \"$WALLET_ID\",
    \"categoryId\": \"$CATEGORY_ID\",
    \"amount\": -25.50,
    \"description\": \"Lunch w restauracji\",
    \"type\": \"Expense\"
  }"
```

## Swagger/OpenAPI

Dokumentacja interaktywna dostępna pod adresem:
```
https://localhost:7001/swagger
```

## Wersjonowanie

Aktualna wersja API: **v1**

Przyszłe wersje będą dostępne pod:
```
/api/v2/...
```

---

**Uwaga:** Wszystkie daty w API są w formacie ISO 8601 UTC. Kwoty są reprezentowane jako liczby dziesiętne z dokładnością do 2 miejsc po przecinku. 