# Dokumentacja API MyMoney

## Przegląd

API MyMoney to RESTful API zbudowane w .NET 9, które obsługuje operacje związane z zarządzaniem finansami osobistymi. API wykorzystuje uwierzytelnianie JWT i obsługuje operacje CRUD dla użytkowników, kont, transakcji i kategorii.

## Adres bazowy

```
Development: http://localhost:5032/api
```

## Uwierzytelnianie

API wykorzystuje JWT (JSON Web Tokens) do uwierzytelniania. Większość endpointów wymaga nagłówka Authorization.

### Format nagłówka

```http
Authorization: Bearer <your-jwt-token>
```

### Tokeny

- **Access Token**: Ważny przez 1 godzinę
- **Refresh Token**: Ważny przez 24 godziny

## Kontrolery i Endpointy

### 1. AuthController - Uwierzytelnianie

#### POST /api/auth/register
Rejestracja nowego użytkownika z automatycznym utworzeniem głównego konta "Main Wallet".

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

### 2. UsersController - Zarządzanie użytkownikami

#### GET /api/users/me
Pobieranie profilu aktualnego użytkownika.

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "fullName": "Jan Kowalski",
  "email": "user@example.com",
  "profileImageUrl": "/uploads/profile-images/image.jpg",
  "mainWalletId": "456e7890-e89b-12d3-a456-426614174001"
}
```

#### PUT /api/users/me
Aktualizacja profilu użytkownika.

**Request Body:**
```json
{
  "fullName": "Nowe Imię Nazwisko",
  "email": "newemail@example.com",
  "profileImageUrl": "data:image/jpeg;base64,..."
}
```

#### PUT /api/users/me/profile-image
Upload zdjęcia profilowego (multipart/form-data).

**Request:** FormData z plikiem `profileImage`

**Ograniczenia:**
- Maksymalny rozmiar: 5MB
- Dozwolone typy: JPEG, PNG, GIF

**Response:**
```json
{
  "profileImageUrl": "/uploads/profile-images/filename.jpg"
}
```

#### DELETE /api/users/me
Usuwanie konta użytkownika.

**Response:**
- `204 No Content` - Konto usunięte

### 3. WalletsController - Zarządzanie kontami

#### GET /api/wallets
Pobieranie wszystkich kont użytkownika (własnych + udostępnionych).

**Response:**
```json
[
  {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "name": "Main Wallet",
    "type": "Personal",
    "currency": "zł",
    "initialBalance": 0.00,
    "manualBalance": null,
    "balanceResetAt": null,
    "currentBalance": 850.50,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/wallets/{id}
Pobieranie szczegółów konkretnego konta.

#### GET /api/wallets/main
Pobieranie głównego konta użytkownika.

#### GET /api/wallets/{id}/balance
Pobieranie salda konta.

**Response:**
```json
{
  "currentBalance": 850.50,
  "initialBalance": 0.00,
  "manualBalance": null,
  "transactionSum": 850.50
}
```

#### POST /api/wallets
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

#### PUT /api/wallets/{id}
Aktualizacja konta.

**Request Body:**
```json
{
  "name": "Nowa nazwa konta",
  "currency": "EUR"
}
```

#### PUT /api/wallets/{id}/set-balance
Ustawienie ręcznego salda konta.

**Request Body:**
```json
{
  "balance": 1000.00
}
```

#### DELETE /api/wallets/{id}
Usuwanie konta (tylko właściciel).

#### POST /api/wallets/{id}/members
Dodawanie członka do konta.

**Request Body:**
```json
{
  "email": "friend@example.com"
}
```

#### DELETE /api/wallets/{walletId}/members/{userId}
Usuwanie członka z konta.

### 4. TransactionsController - Zarządzanie transakcjami

#### GET /api/transactions
Pobieranie wszystkich transakcji użytkownika.

**Response:**
```json
[
  {
    "id": "abc123def456",
    "amount": -50.00,
    "description": "Zakupy spożywcze",
    "createdAt": "2024-12-01T10:30:00Z",
    "updatedAt": "2024-12-01T10:30:00Z",
    "categoryId": "cat123",
    "category": {
      "id": "cat123",
      "name": "Jedzenie"
    },
    "walletId": "wallet123"
  }
]
```

#### GET /api/transactions/income
Pobieranie tylko przychodów (amount > 0).

#### GET /api/transactions/expenses
Pobieranie tylko wydatków (amount < 0).

#### GET /api/transactions/wallet/{walletId}
Pobieranie transakcji z konkretnego konta.

#### GET /api/transactions/{id}
Pobieranie szczegółów transakcji.

#### POST /api/transactions/income
Dodawanie przychodu.

**Request Body:**
```json
{
  "walletId": "456e7890-e89b-12d3-a456-426614174001",
  "categoryId": "cat123",
  "amount": 1000.00,
  "description": "Wynagrodzenie",
  "createdAt": "2024-12-01T10:30:00Z"
}
```

**Uwaga:** Kwota zostanie automatycznie ustawiona jako dodatnia.

#### POST /api/transactions/expenses
Dodawanie wydatku.

**Request Body:**
```json
{
  "walletId": "456e7890-e89b-12d3-a456-426614174001",
  "categoryId": "cat123",
  "amount": 50.00,
  "description": "Zakupy",
  "createdAt": "2024-12-01T10:30:00Z"
}
```

**Uwaga:** Kwota zostanie automatycznie ustawiona jako ujemna.

#### PUT /api/transactions/income/{id}
Aktualizacja przychodu (tylko transakcje z amount > 0).

#### PUT /api/transactions/expenses/{id}
Aktualizacja wydatku (tylko transakcje z amount < 0).

#### DELETE /api/transactions/{id}
Usuwanie transakcji.

#### GET /api/transactions/statistics/income-expense
Pobieranie statystyk przychodów vs wydatków.

**Query Parameters:**
- `from` (optional) - Data początkowa (YYYY-MM-DD)
- `to` (optional) - Data końcowa (YYYY-MM-DD)

### 5. CategoriesController - Zarządzanie kategoriami

#### GET /api/categories
Pobieranie wszystkich kategorii (globalne + niestandardowe użytkownika).

**Response:**
```json
[
  {
    "id": "cat123",
    "name": "Jedzenie",
    "userId": null
  },
  {
    "id": "cat456",
    "name": "Moja kategoria",
    "userId": "user123"
  }
]
```

#### GET /api/categories/{id}
Pobieranie szczegółów kategorii.

#### POST /api/categories
Tworzenie niestandardowej kategorii.

**Request Body:**
```json
{
  "name": "Hobby"
}
```

#### PUT /api/categories/{id}
Aktualizacja kategorii (tylko niestandardowe).

#### DELETE /api/categories/{id}
Usuwanie kategorii (tylko niestandardowe).

## Kody błędów

### Standardowe kody HTTP

- `200 OK` - Żądanie wykonane pomyślnie
- `201 Created` - Zasób utworzony
- `204 No Content` - Operacja wykonana, brak treści
- `400 Bad Request` - Nieprawidłowe dane wejściowe
- `401 Unauthorized` - Brak autoryzacji
- `403 Forbidden` - Brak uprawnień
- `404 Not Found` - Zasób nie znaleziony
- `409 Conflict` - Konflikt (np. duplikat)
- `500 Internal Server Error` - Błąd serwera

### Przykłady błędów

```json
{
  "message": "Error fetching transactions",
  "error": "Database connection failed"
}
```

## Przykład użycia

### Kompletny przepływ rejestracji i pierwszej transakcji

```bash
# 1. Rejestracja
curl -X POST "http://localhost:5032/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jan.kowalski@example.com",
    "password": "MojeHaslo123!"
  }'

# 2. Logowanie
TOKEN=$(curl -X POST "http://localhost:5032/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jan.kowalski@example.com",
    "password": "MojeHaslo123!"
  }' | jq -r '.accessToken')

# 3. Pobieranie profilu
curl -X GET "http://localhost:5032/api/users/me" \
  -H "Authorization: Bearer $TOKEN"

# 4. Pobieranie głównego konta
WALLET_ID=$(curl -X GET "http://localhost:5032/api/wallets/main" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.id')

# 5. Pobieranie kategorii
CATEGORY_ID=$(curl -X GET "http://localhost:5032/api/categories" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

# 6. Dodanie wydatku
curl -X POST "http://localhost:5032/api/transactions/expenses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"walletId\": \"$WALLET_ID\",
    \"categoryId\": \"$CATEGORY_ID\",
    \"amount\": 25.50,
    \"description\": \"Lunch w restauracji\"
  }"
```