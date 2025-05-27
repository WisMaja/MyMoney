# Dokumentacja Frontendu MyMoney

## Przegląd

Frontend MyMoney to aplikacja React 18 z Material-UI. Aplikacja używa JavaScript (nie TypeScript) i zapewnia interfejs do zarządzania finansami osobistymi.

## Technologie

### Główne zależności (package.json)

- **React 18.0.0** - Biblioteka UI
- **Material-UI 5.6.2** - Komponenty UI
- **React Router 6.3.0** - Routing
- **Axios 1.9.0** - HTTP client
- **Chart.js 4.4.9** - Wykresy
- **React-chartjs-2 5.3.0** - Integracja Chart.js z React
- **Recharts 2.5.0** - Alternatywne wykresy

### Narzędzia deweloperskie

- **React Scripts 5.0.1** - Build tools
- **Testing Library** - Testowanie
- **Jest** - Test runner

## Struktura projektu

```
frontend/src/
├── components/           # Komponenty React
│   ├── AddExpenseDialog.js
│   ├── AddIncomeDialog.js
│   ├── Dashboard.js
│   ├── DeleteTransactionDialog.js
│   ├── EditTransactionDialog.js
│   ├── FinanceChart.js
│   ├── Header.js
│   └── Sidebar.js
├── pages/               # Strony aplikacji
│   ├── Accounts.js
│   ├── Budgets.js
│   ├── Categories.js
│   ├── Dashboard.js
│   ├── Login.js
│   ├── Settings.js
│   ├── Social.js
│   └── Statistics.js
├── services/            # Usługi API
├── context/             # React Context
│   └── AuthContext.js
├── hooks/               # Custom hooks
├── router/              # Routing
│   └── PrivateRoute.jsx
├── styles/              # Style CSS
├── apiClient.js         # Konfiguracja Axios
├── App.js               # Główny komponent
└── index.js             # Entry point
```

## Komponenty

### Główne komponenty

**Header.js** - Nagłówek aplikacji z:
- Tytułem strony
- Avatarem użytkownika
- Menu użytkownika (ustawienia, wylogowanie)

**Sidebar.js** - Menu boczne z nawigacją

**Dashboard.js** - Komponent dashboardu (duplikat w components/ i pages/)

### Dialogi transakcji

**AddIncomeDialog.js** - Dialog dodawania przychodu
**AddExpenseDialog.js** - Dialog dodawania wydatku  
**EditTransactionDialog.js** - Dialog edycji transakcji
**DeleteTransactionDialog.js** - Dialog usuwania transakcji

### Wykresy

**FinanceChart.js** - Komponenty wykresów finansowych

## Strony

### Login.js
- Formularz logowania i rejestracji
- Walidacja hasła (8 znaków, cyfra, znak specjalny, wielka/mała litera)
- Obsługa błędów

### Dashboard.js  
- Podsumowanie konta głównego
- Lista ostatnich transakcji
- Przyciski dodawania transakcji

### Accounts.js
- Lista kont użytkownika
- Tworzenie/edycja kont

### Categories.js
- Zarządzanie kategoriami
- Kategorie globalne vs własne

### Statistics.js
- Wykresy i statystyki

### Settings.js
- Ustawienia profilu
- Zmiana hasła
- Usuwanie konta

### Budgets.js
- Zarządzanie budżetami

### Social.js
- Funkcje społecznościowe

## Zarządzanie stanem

### AuthContext.js

Prosty kontekst uwierzytelniania:

```javascript
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = (accessToken, refreshToken) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
```

## API Client

### apiClient.js

Konfiguracja Axios z:
- Automatycznym dodawaniem Bearer token
- Odświeżaniem tokenów przy 401
- Przekierowaniem na login przy błędach auth

```javascript
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor dodający token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor obsługujący refresh token
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Logika odświeżania tokenu przy 401
    }
);
```

## Routing

### App.js

Główna konfiguracja routingu:

```javascript
<Routes>
  <Route path="/" element={<Navigate replace to="/dashboard" />} />
  <Route path="/login" element={<Login />} />
  
  {/* Protected routes */}
  <Route path="/dashboard" element={
    <PrivateRoute><Dashboard /></PrivateRoute>
  } />
  <Route path="/statistics" element={
    <PrivateRoute><Statistics /></PrivateRoute>
  } />
  <Route path="/accounts" element={
    <PrivateRoute><Accounts /></PrivateRoute>
  } />
  <Route path="/budgets" element={
    <PrivateRoute><Budgets /></PrivateRoute>
  } />
  <Route path="/categories" element={
    <PrivateRoute><Categories /></PrivateRoute>
  } />
  <Route path="/social" element={
    <PrivateRoute><Social /></PrivateRoute>
  } />
  <Route path="/settings" element={
    <PrivateRoute><Settings /></PrivateRoute>
  } />
</Routes>
```

### PrivateRoute.jsx

Komponent chroniący trasy przed nieuwierzytelnionymi użytkownikami.

## Stylowanie

Aplikacja używa:
- **Material-UI** - główne komponenty UI
- **CSS files** - dodatkowe style w katalogu styles/
- **App.css** - globalne style aplikacji

## Testowanie

Podstawowa konfiguracja testów:
- **setupTests.js** - konfiguracja testów
- **Testing Library** - narzędzia do testowania
- **Jest** - test runner

## Zmienne środowiskowe

- `REACT_APP_API_URL` - URL do API backendu (domyślnie: http://localhost:5032/api)

## Uruchamianie

```bash
# Instalacja zależności
npm install

# Uruchomienie w trybie development
npm start

# Budowanie do produkcji  
npm run build

# Uruchomienie testów
npm test
```