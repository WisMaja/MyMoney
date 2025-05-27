# Testowanie MyMoney

## Aktualny stan testowania

### ❌ Brak implementacji

Projekt MyMoney **nie ma zaimplementowanych testów**. Dokumentacja opisuje rzeczywisty stan bez zmyślonych funkcji.

## Skonfigurowane narzędzia

### Frontend - Jest (częściowo skonfigurowany)

**Zainstalowane pakiety:**
```json
{
  "devDependencies": {
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.6.3", 
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^13.5.0",
    "babel-jest": "^29.7.0",
    "jest": "^27.5.1"
  }
}
```

**Konfiguracja:**
- `jest.config.js` - podstawowa konfiguracja jsdom
- `setupTests.js` - import @testing-library/jest-dom
- `eslintConfig` zawiera "react-app/jest"

**Dostępne skrypty:**
```bash
npm test          # react-scripts test
npm run build     # react-scripts build  
npm start         # react-scripts start
```

**Istniejący test:**
- `src/pages/Login.test.js` - podstawowy test komponentu Login

### Backend - Brak testów

**Projekt .NET:**
- Brak projektów testowych (*.Tests.csproj)
- Brak pakietów testowych (xUnit, NUnit, MSTest)
- Brak konfiguracji testów w api.csproj

## Co jest potrzebne do implementacji

### Frontend - Testy jednostkowe

**Brakujące testy dla komponentów:**
- `AddExpenseDialog.js`
- `AddIncomeDialog.js` 
- `Dashboard.js`
- `TransactionList.js`
- `CategorySelect.js`
- `WalletSelector.js`

**Brakujące testy dla serwisów:**
- `services/transactionService.js`
- `services/walletService.js`
- `services/categoryService.js`
- `services/userService.js`

**Brakujące testy dla hooks:**
- `hooks/useAuth.js`

**Brakujące testy dla context:**
- `context/AuthContext.js`

### Backend - Testy jednostkowe

**Potrzebne pakiety:**
```xml
<PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
<PackageReference Include="xunit" Version="2.6.1" />
<PackageReference Include="xunit.runner.visualstudio" Version="2.5.3" />
<PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="9.0.5" />
<PackageReference Include="Moq" Version="4.20.69" />
<PackageReference Include="FluentAssertions" Version="6.12.0" />
```

**Brakujące testy dla kontrolerów:**
- `AuthController` - rejestracja, logowanie, refresh
- `UsersController` - profil, upload zdjęcia
- `WalletsController` - CRUD operacje
- `TransactionsController` - CRUD operacje
- `CategoriesController` - CRUD operacje

**Brakujące testy dla serwisów:**
- `TokenService` - generowanie i walidacja JWT

**Brakujące testy dla modeli:**
- Walidacja modeli DTO
- Relacje Entity Framework

### Testy integracyjne

**Brak:**
- Testów API endpoints
- Testów bazy danych
- Testów autoryzacji JWT

### Testy E2E

**Brak:**
- Cypress lub Playwright
- Testów przepływów użytkownika
- Testów UI

## Przykład implementacji (do zrobienia)

### Frontend - Test komponentu

```javascript
// src/components/AddExpenseDialog.test.js (NIE ISTNIEJE)
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddExpenseDialog from './AddExpenseDialog';

describe('AddExpenseDialog', () => {
  it('should render expense form', () => {
    render(<AddExpenseDialog open={true} onClose={() => {}} />);
    expect(screen.getByText(/add expense/i)).toBeInTheDocument();
  });
});
```

### Backend - Test kontrolera

```csharp
// Tests/Controllers/AuthControllerTests.cs (NIE ISTNIEJE)
using Xunit;
using Microsoft.AspNetCore.Mvc;
using api.Controllers;

public class AuthControllerTests
{
    [Fact]
    public async Task Register_ValidData_ReturnsOk()
    {
        // Arrange
        var controller = new AuthController(/* dependencies */);
        
        // Act
        var result = await controller.Register(new RegisterDto 
        { 
            Email = "test@test.com", 
            Password = "password123" 
        });
        
        // Assert
        Assert.IsType<OkResult>(result);
    }
}
```

## Uruchomienie istniejących testów

### Frontend

```bash
cd frontend
npm test
```

**Wynik:** Uruchomi się jeden test `Login.test.js`

### Backend

```bash
cd api
dotnet test
```

**Wynik:** Błąd - brak projektów testowych

## Pokrycie kodu

**Aktualnie:** 0% - brak testów

**Cel:** Minimum 70% pokrycia dla:
- Kontrolery API
- Serwisy biznesowe  
- Komponenty React
- Custom hooks

## CI/CD

**Aktualnie:** Brak pipeline'ów

**Potrzebne:**
- GitHub Actions workflow
- Automatyczne uruchamianie testów
- Raportowanie pokrycia kodu
- Blokowanie merge bez testów

## Plan implementacji testów

### Faza 1: Podstawowe testy jednostkowe
1. Testy kontrolerów API (AuthController, UsersController)
2. Testy głównych komponentów React (Dashboard, Login)
3. Testy serwisów API (transactionService, userService)

### Faza 2: Testy integracyjne
1. Testy endpoints z bazą danych
2. Testy autoryzacji JWT
3. Testy przepływów API

### Faza 3: Testy E2E
1. Instalacja Cypress
2. Testy logowania/rejestracji
3. Testy zarządzania transakcjami

### Faza 4: CI/CD
1. GitHub Actions workflow
2. Automatyczne testy przy PR
3. Deployment tylko po przejściu testów

## Problemy do rozwiązania

1. **Brak struktury testów** - trzeba utworzyć projekty testowe
2. **Brak mock'ów** - potrzebne mockowanie API i bazy danych
3. **Brak test data** - potrzebne dane testowe
4. **Brak CI/CD** - automatyzacja testów
5. **Brak pokrycia kodu** - monitoring jakości

## Komendy do implementacji

### Utworzenie projektu testowego .NET

```bash
cd api
dotnet new xunit -n api.Tests
dotnet sln add api.Tests/api.Tests.csproj
dotnet add api.Tests reference api/api.csproj
```

### Dodanie pakietów testowych

```bash
cd api.Tests
dotnet add package Microsoft.EntityFrameworkCore.InMemory
dotnet add package Moq
dotnet add package FluentAssertions
dotnet add package Microsoft.AspNetCore.Mvc.Testing
```

### Konfiguracja coverage frontendu

```bash
cd frontend
npm test -- --coverage --watchAll=false
```

---

**Status:** Testowanie nie jest zaimplementowane. Projekt wymaga kompletnej implementacji testów przed wdrożeniem produkcyjnym. 