## Testowanie frontendowe — React (MyMoney Frontend)

### Przegląd

Aplikacja frontendowa MyMoney, zbudowana w React, zawiera zestaw testów jednostkowych i komponentowych napisanych w **Jest** oraz **React Testing Library**. Testy koncentrują się na poprawności renderowania, interakcji użytkownika oraz integracji z API (mockowanej).

### Statystyki testów

- **Frameworki**: Jest, React Testing Library
- **Testowane komponenty**: `Login.js` (obsługuje rejestrację z walidacją hasła i logowanie się)
- **Pokrycie komponentu `Login.js`**: **11 testów**, wszystkie przechodzą (100%)
- **Czas wykonania testów frontendowych**: < 1 sekunda

---

### Login.js — szczegóły testów

#### Zakres testów
- Renderowanie komponentu logowania (formularz, pola, przycisk)
- Walidacja pól wejściowych (wymagalność, poprawność adresu e-mail)
- Obsługa błędnych danych logowania
- Wywołanie funkcji logowania (mock API)
- Sprawdzenie przekierowania po zalogowaniu
- Obsługa błędów API (np. 401 Unauthorized)

#### Przykładowe testy

```javascript
describe('Login Page', () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockLogin.mockReset();
    mockLogout.mockReset();
    mockIsAuthenticated = false;
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    renderWithRouter(<Login />);
    expect(screen.getByText(/login to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/password/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
});
  
