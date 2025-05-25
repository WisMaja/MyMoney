# Dokumentacja Frontendu MyMoney

## Przegląd

Frontend MyMoney to nowoczesna aplikacja Single Page Application (SPA) zbudowana w React 18 z wykorzystaniem Material-UI, TypeScript i najnowszych wzorców projektowych. Aplikacja zapewnia intuicyjny interfejs użytkownika do zarządzania finansami osobistymi.

## Technologie i biblioteki

### Główne technologie

- **React 18.0.0** - Biblioteka do budowania interfejsów użytkownika
- **TypeScript 4.9.5** - Typowany JavaScript
- **Material-UI (MUI) 5.6.2** - Komponenty UI zgodne z Material Design
- **React Router 6.3.0** - Routing po stronie klienta
- **Axios 1.9.0** - Klient HTTP do komunikacji z API

### Biblioteki pomocnicze

- **Chart.js 4.4.9** - Wykresy i wizualizacje
- **Recharts 2.5.0** - Alternatywne wykresy dla React
- **React Hook Form 7.43.0** - Zarządzanie formularzami
- **Yup 1.0.2** - Walidacja schematów
- **Date-fns 2.29.3** - Manipulacja datami
- **React Query 4.29.0** - Zarządzanie stanem serwera

## Struktura projektu

```
frontend/
├── public/                 # Pliki statyczne
│   ├── index.html         # Główny plik HTML
│   ├── manifest.json      # Manifest PWA
│   └── icons/             # Ikony aplikacji
├── src/
│   ├── components/        # Komponenty wielokrotnego użytku
│   │   ├── common/        # Podstawowe komponenty UI
│   │   ├── forms/         # Komponenty formularzy
│   │   ├── charts/        # Komponenty wykresów
│   │   └── layout/        # Komponenty layoutu
│   ├── pages/             # Komponenty stron
│   │   ├── Dashboard/     # Strona główna
│   │   ├── Transactions/  # Zarządzanie transakcjami
│   │   ├── Wallets/       # Zarządzanie kontami
│   │   ├── Statistics/    # Statystyki i raporty
│   │   ├── Settings/      # Ustawienia
│   │   └── Auth/          # Uwierzytelnianie
│   ├── services/          # Usługi API
│   ├── context/           # Konteksty React
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Funkcje pomocnicze
│   ├── types/             # Definicje typów TypeScript
│   ├── constants/         # Stałe aplikacji
│   └── styles/            # Style globalne
├── package.json           # Zależności i skrypty
├── tsconfig.json          # Konfiguracja TypeScript
└── .env                   # Zmienne środowiskowe
```

## Komponenty

### Komponenty podstawowe (common/)

#### Button
```typescript
interface ButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ ... }) => {
  // Implementacja
};
```

#### LoadingSpinner
```typescript
interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ ... }) => {
  // Implementacja
};
```

#### ErrorBoundary
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  // Implementacja
}
```

### Komponenty formularzy (forms/)

#### TransactionForm
```typescript
interface TransactionFormProps {
  initialData?: Transaction;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ ... }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<TransactionFormData>({
    resolver: yupResolver(transactionSchema)
  });

  // Implementacja
};
```

#### WalletForm
```typescript
interface WalletFormProps {
  initialData?: Wallet;
  onSubmit: (data: WalletFormData) => Promise<void>;
  onCancel: () => void;
}

const WalletForm: React.FC<WalletFormProps> = ({ ... }) => {
  // Implementacja
};
```

### Komponenty wykresów (charts/)

#### ExpenseChart
```typescript
interface ExpenseChartProps {
  data: ExpenseData[];
  type: 'pie' | 'bar' | 'line';
  period: 'week' | 'month' | 'year';
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ ... }) => {
  // Implementacja z Chart.js lub Recharts
};
```

#### BalanceChart
```typescript
interface BalanceChartProps {
  walletId: string;
  period: DateRange;
}

const BalanceChart: React.FC<BalanceChartProps> = ({ ... }) => {
  // Implementacja
};
```

## Strony (Pages)

### Dashboard
Główna strona aplikacji zawierająca:
- Podsumowanie finansowe
- Ostatnie transakcje
- Wykresy wydatków
- Szybkie akcje

```typescript
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { wallets, loading: walletsLoading } = useWallets();
  const { transactions, loading: transactionsLoading } = useTransactions({
    limit: 10,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Implementacja
};
```

### Transactions
Strona zarządzania transakcjami:
- Lista transakcji z filtrowaniem
- Dodawanie nowych transakcji
- Edycja i usuwanie transakcji

```typescript
const Transactions: React.FC = () => {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const {
    transactions,
    loading,
    error,
    totalCount,
    refetch
  } = useTransactions(filters);

  // Implementacja
};
```

### Wallets
Strona zarządzania kontami:
- Lista kont użytkownika
- Tworzenie nowych kont
- Edycja i usuwanie kont
- Zarządzanie członkami kont

```typescript
const Wallets: React.FC = () => {
  const { wallets, createWallet, updateWallet, deleteWallet } = useWallets();
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

  // Implementacja
};
```

## Zarządzanie stanem

### Context API

#### AuthContext
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Implementacja
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

#### WalletContext
```typescript
interface WalletContextType {
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  setSelectedWallet: (wallet: Wallet | null) => void;
  createWallet: (data: CreateWalletData) => Promise<Wallet>;
  updateWallet: (id: string, data: UpdateWalletData) => Promise<Wallet>;
  deleteWallet: (id: string) => Promise<void>;
  refreshWallets: () => Promise<void>;
}
```

### Custom Hooks

#### useTransactions
```typescript
interface UseTransactionsOptions {
  walletId?: string;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
  createTransaction: (data: CreateTransactionData) => Promise<Transaction>;
  updateTransaction: (id: string, data: UpdateTransactionData) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactions = (options: UseTransactionsOptions = {}): UseTransactionsReturn => {
  // Implementacja z React Query
};
```

#### useWallets
```typescript
export const useWallets = () => {
  const queryClient = useQueryClient();
  
  const {
    data: wallets = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletService.getWallets(),
    staleTime: 5 * 60 * 1000, // 5 minut
  });

  const createWalletMutation = useMutation({
    mutationFn: walletService.createWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });

  // Pozostałe mutacje...

  return {
    wallets,
    loading: isLoading,
    error: error?.message,
    createWallet: createWalletMutation.mutateAsync,
    // Pozostałe funkcje...
  };
};
```

## Usługi API

### apiClient.ts
```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - dodawanie tokenu
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - obsługa błędów i odświeżanie tokenu
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.refreshToken();
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken() {
    // Implementacja odświeżania tokenu
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  // Pozostałe metody HTTP...
}

export const apiClient = new ApiClient();
```

### transactionService.ts
```typescript
import { apiClient } from './apiClient';

export interface TransactionFilters {
  walletId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  page?: number;
  pageSize?: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class TransactionService {
  async getTransactions(filters: TransactionFilters = {}): Promise<TransactionsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    return apiClient.get(`/transactions?${params.toString()}`);
  }

  async getTransaction(id: string): Promise<Transaction> {
    return apiClient.get(`/transactions/${id}`);
  }

  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    return apiClient.post('/transactions', data);
  }

  async updateTransaction(id: string, data: UpdateTransactionData): Promise<Transaction> {
    return apiClient.put(`/transactions/${id}`, data);
  }

  async deleteTransaction(id: string): Promise<void> {
    return apiClient.delete(`/transactions/${id}`);
  }

  async getStatistics(filters: TransactionFilters = {}): Promise<TransactionStatistics> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    return apiClient.get(`/transactions/statistics?${params.toString()}`);
  }
}

export const transactionService = new TransactionService();
```

## Routing

### Router konfiguracja
```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
      },
      {
        path: 'transactions',
        element: <ProtectedRoute><Transactions /></ProtectedRoute>,
      },
      {
        path: 'wallets',
        element: <ProtectedRoute><Wallets /></ProtectedRoute>,
      },
      {
        path: 'statistics',
        element: <ProtectedRoute><Statistics /></ProtectedRoute>,
      },
      {
        path: 'settings',
        element: <ProtectedRoute><Settings /></ProtectedRoute>,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
```

### ProtectedRoute
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner overlay />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

## Stylowanie

### Theme konfiguracja
```typescript
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    // Pozostałe style typografii...
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    // Pozostałe komponenty...
  },
});

export const AppTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
```

## Walidacja formularzy

### Schematy Yup
```typescript
import * as yup from 'yup';

export const transactionSchema = yup.object({
  walletId: yup.string().required('Konto jest wymagane'),
  categoryId: yup.string().required('Kategoria jest wymagana'),
  amount: yup
    .number()
    .required('Kwota jest wymagana')
    .positive('Kwota musi być większa od zera'),
  description: yup.string().max(500, 'Opis może mieć maksymalnie 500 znaków'),
  date: yup.date().required('Data jest wymagana').max(new Date(), 'Data nie może być z przyszłości'),
  type: yup.string().oneOf(['Income', 'Expense']).required('Typ transakcji jest wymagany'),
});

export const walletSchema = yup.object({
  name: yup
    .string()
    .required('Nazwa konta jest wymagana')
    .min(2, 'Nazwa musi mieć co najmniej 2 znaki')
    .max(100, 'Nazwa może mieć maksymalnie 100 znaków'),
  type: yup.string().oneOf(['Personal', 'Shared', 'Business']).required('Typ konta jest wymagany'),
  initialBalance: yup.number().required('Początkowe saldo jest wymagane'),
  currency: yup.string().required('Waluta jest wymagana'),
});
```

## Testowanie

### Konfiguracja testów
```typescript
// setupTests.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Przykład testu komponentu
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionForm } from '../TransactionForm';

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

const renderTransactionForm = (props = {}) => {
  return render(
    <TransactionForm
      onSubmit={mockOnSubmit}
      onCancel={mockOnCancel}
      {...props}
    />
  );
};

describe('TransactionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    renderTransactionForm();
    
    expect(screen.getByLabelText(/kwota/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/opis/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/kategoria/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    renderTransactionForm();
    
    fireEvent.change(screen.getByLabelText(/kwota/i), {
      target: { value: '100' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /zapisz/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 100
        })
      );
    });
  });
});
```

## Optymalizacja wydajności

### Code Splitting
```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Statistics = lazy(() => import('./pages/Statistics'));

const App: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/statistics" element={<Statistics />} />
      </Routes>
    </Suspense>
  );
};
```

### Memoization
```typescript
import { memo, useMemo, useCallback } from 'react';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionList = memo<TransactionListProps>(({ 
  transactions, 
  onEdit, 
  onDelete 
}) => {
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions]);

  const handleEdit = useCallback((transaction: Transaction) => {
    onEdit(transaction);
  }, [onEdit]);

  const handleDelete = useCallback((id: string) => {
    onDelete(id);
  }, [onDelete]);

  return (
    // Implementacja
  );
});
```

## Progressive Web App (PWA)

### Service Worker
```typescript
// public/sw.js
const CACHE_NAME = 'mymoney-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
```

### Manifest
```json
{
  "short_name": "MyMoney",
  "name": "MyMoney - Zarządzanie Finansami",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#1976d2",
  "background_color": "#ffffff"
}
```

---

**Uwaga:** Frontend jest stale rozwijany i aktualizowany. Regularne aktualizacje zależności i optymalizacje wydajności są kluczowe dla utrzymania dobrej jakości aplikacji. 