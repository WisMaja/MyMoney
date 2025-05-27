# Bezpieczeństwo MyMoney

## Zaimplementowane zabezpieczenia

### 1. Uwierzytelnianie JWT

**Implementacja:**
- Access Token: ważny 1 godzinę
- Refresh Token: ważny 24 godziny
- Klucz podpisywania: `"e5be8f13-627b-4632-805f-37a86ce0d76d"` (hardcoded)
- Algorytm: HMAC SHA256

**Kod:**
```csharp
// TokenService.cs
var key = new SymmetricSecurityKey(
    Encoding.UTF8.GetBytes("e5be8f13-627b-4632-805f-37a86ce0d76d")
);

var token = new JwtSecurityToken(
    claims: userClaims,
    expires: DateTime.UtcNow.AddHours(1),
    signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
);
```

### 2. Hashowanie haseł

**Implementacja:**
- ASP.NET Core PasswordHasher
- Automatyczne solenie i hashowanie

**Kod:**
```csharp
// AuthController.cs
user.HashedPassword = new PasswordHasher<User>().HashPassword(user, dto.Password);

// Weryfikacja
var result = passwordHasher.VerifyHashedPassword(user, user.HashedPassword!, dto.Password);
```

### 3. Autoryzacja

**Implementacja:**
- Atrybut `[Authorize]` na kontrolerach
- Wyciąganie User ID z JWT claims
- Sprawdzanie dostępu do zasobów

**Kod:**
```csharp
[Authorize]
public class TransactionsController : ControllerBase
{
    private Guid GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : 
            throw new UnauthorizedAccessException("Invalid user ID in token.");
    }
}
```

### 4. CORS

**Implementacja:**
- Polityka "AllowAll" w trybie development
- Brak ograniczeń origin/methods/headers

**Kod:**
```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
```

### 5. Automatyczne odświeżanie tokenów

**Implementacja:**
- Interceptor w Axios (frontend)
- Automatyczne odświeżanie przy 401
- Przekierowanie na login przy błędzie

**Kod:**
```javascript
// apiClient.js
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Próba odświeżenia tokenu
            const response = await axios.post(`${API_URL}/auth/refresh`, {
                accessToken, refreshToken
            });
        }
    }
);
```

### 6. Upload plików

**Implementacja:**
- Walidacja typu pliku (JPEG, PNG, GIF)
- Limit rozmiaru: 5MB
- Unikalne nazwy plików

**Kod:**
```csharp
// UsersController.cs
const long maxFileSize = 5 * 1024 * 1024; // 5MB
var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif" };

if (profileImage.Length > maxFileSize)
    return BadRequest("File size too large. Maximum size is 5MB.");
```

### 7. Walidacja dostępu do zasobów

**Implementacja:**
- Sprawdzanie czy użytkownik ma dostęp do konta
- Sprawdzanie właściciela zasobu

**Kod:**
```csharp
// TransactionsController.cs
if (!await UserHasAccessToWallet(walletId, userId))
{
    return StatusCode(403, new { message = "No access to the wallet" });
}
```

## Problemy bezpieczeństwa

### 🔴 Krytyczne

1. **Hardcoded JWT Secret**
   - Klucz podpisywania JWT jest hardcoded w kodzie
   - Powinien być w zmiennych środowiskowych

2. **CORS AllowAll**
   - Brak ograniczeń CORS w development
   - Potencjalne ryzyko w produkcji

3. **Brak HTTPS**
   - Aplikacja działa na HTTP
   - Tokeny przesyłane niezaszyfrowane

4. **Brak walidacji haseł**
   - Brak wymagań dotyczących siły hasła
   - Brak ograniczeń długości

### 🟡 Średnie

1. **Brak rate limiting**
   - Możliwość ataków brute-force
   - Brak ograniczeń żądań

2. **Podstawowe logowanie**
   - Tylko Console.WriteLine
   - Brak strukturalnego logowania

3. **Brak walidacji input**
   - Podstawowa walidacja DTO
   - Brak sanityzacji danych

4. **Refresh token w bazie**
   - Przechowywanie w plain text
   - Brak rotacji tokenów

### 🟢 Niskie

1. **Brak CSP headers**
   - Brak Content Security Policy
   - Potencjalne XSS

2. **Brak security headers**
   - Brak X-Frame-Options
   - Brak X-Content-Type-Options

## Zalecenia

### Natychmiastowe

1. **Przenieś JWT secret do zmiennych środowiskowych**
```csharp
var key = new SymmetricSecurityKey(
    Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"])
);
```

2. **Włącz HTTPS**
```csharp
app.UseHttpsRedirection();
```

3. **Ograniczenie CORS**
```csharp
policy.WithOrigins("http://localhost:3000")
      .AllowCredentials();
```

### Krótkoterminowe

1. **Dodaj walidację haseł**
```csharp
[RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$")]
public string Password { get; set; }
```

2. **Dodaj rate limiting**
```csharp
builder.Services.AddRateLimiter(options => {
    options.AddFixedWindowLimiter("AuthPolicy", opt => {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
    });
});
```

3. **Strukturalne logowanie**
```csharp
builder.Services.AddSerilog();
```

### Długoterminowe

1. **Implementacja security headers**
2. **Szyfrowanie refresh tokenów**
3. **Audit log dla operacji finansowych**
4. **Dwuskładnikowe uwierzytelnianie (2FA)**
5. **Backup i recovery procedures**

## Brak implementacji

❌ **OAuth 2.0** - brak integracji z Google/Facebook  
❌ **2FA** - brak dwuskładnikowego uwierzytelniania  
❌ **Rate limiting** - brak ograniczeń żądań  
❌ **Security headers** - brak dodatkowych nagłówków  
❌ **Input sanitization** - podstawowa walidacja  
❌ **Audit logging** - brak logów bezpieczeństwa  
❌ **Password policies** - brak wymagań hasła  
❌ **Session management** - podstawowe JWT  
❌ **CSRF protection** - brak ochrony CSRF  
❌ **SQL injection protection** - tylko EF parametryzacja  
