import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Tłumaczenia angielskie (domyślne)
const enTranslations = {
  // Navigation
  nav: {
    dashboard: 'Dashboard',
    statistics: 'Statistics',
    accounts: 'Accounts',
    social: 'Social',
    settings: 'Settings',
    categories: 'Categories'
  },
  
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    yes: 'Yes',
    no: 'No',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    name: 'Name',
    description: 'Description',
    amount: 'Amount',
    date: 'Date',
    category: 'Category',
    wallet: 'Wallet',
    type: 'Type',
    status: 'Status',
    actions: 'Actions'
  },

  // Auth
  auth: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    forgotPassword: 'Forgot Password?',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    welcomeBack: 'Welcome Back',
    createAccount: 'Create Account',
    loginSuccess: 'Login successful',
    registerSuccess: 'Registration successful',
    loginError: 'Login failed',
    registerError: 'Registration failed'
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    totalBalance: 'Total Balance',
    monthlyIncome: 'Monthly Income',
    monthlyExpenses: 'Monthly Expenses',
    recentTransactions: 'Recent Transactions',
    quickActions: 'Quick Actions',
    addIncome: 'Add Income',
    addExpense: 'Add Expense',
    viewAll: 'View All',
    noTransactions: 'No transactions yet',
    balance: 'Balance',
    income: 'Income',
    expenses: 'Expenses'
  },

  // Transactions
  transactions: {
    title: 'Transactions',
    addTransaction: 'Add Transaction',
    editTransaction: 'Edit Transaction',
    deleteTransaction: 'Delete Transaction',
    transactionAdded: 'Transaction added successfully',
    transactionUpdated: 'Transaction updated successfully',
    transactionDeleted: 'Transaction deleted successfully',
    income: 'Income',
    expense: 'Expense',
    allTransactions: 'All Transactions',
    incomeTransactions: 'Income',
    expenseTransactions: 'Expenses',
    noTransactions: 'No transactions found',
    selectCategory: 'Select Category',
    selectWallet: 'Select Wallet',
    enterAmount: 'Enter Amount',
    enterDescription: 'Enter Description'
  },

  // Wallets
  wallets: {
    title: 'Wallets',
    myWallets: 'My Wallets',
    addWallet: 'Add Wallet',
    editWallet: 'Edit Wallet',
    deleteWallet: 'Delete Wallet',
    walletName: 'Wallet Name',
    walletType: 'Wallet Type',
    currency: 'Currency',
    initialBalance: 'Initial Balance',
    currentBalance: 'Current Balance',
    walletAdded: 'Wallet added successfully',
    walletUpdated: 'Wallet updated successfully',
    walletDeleted: 'Wallet deleted successfully',
    setAsMain: 'Set as Main',
    mainWallet: 'Main Wallet',
    personal: 'Personal',
    business: 'Business',
    savings: 'Savings',
    investment: 'Investment'
  },

  // Categories
  categories: {
    title: 'Categories',
    addCategory: 'Add Category',
    editCategory: 'Edit Category',
    deleteCategory: 'Delete Category',
    categoryName: 'Category Name',
    categoryAdded: 'Category added successfully',
    categoryUpdated: 'Category updated successfully',
    categoryDeleted: 'Category deleted successfully',
    globalCategories: 'Global Categories',
    customCategories: 'Custom Categories',
    noCategories: 'No categories found'
  },

  // Statistics
  statistics: {
    title: 'Statistics',
    overview: 'Overview',
    incomeVsExpenses: 'Income vs Expenses',
    categoryBreakdown: 'Category Breakdown',
    monthlyTrends: 'Monthly Trends',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
    lastYear: 'Last Year',
    totalIncome: 'Total Income',
    totalExpenses: 'Total Expenses',
    netIncome: 'Net Income',
    averageTransaction: 'Average Transaction',
    transactionCount: 'Transaction Count'
  },

  // Settings
  settings: {
    title: 'Settings',
    profile: 'Profile',
    preferences: 'Preferences',
    security: 'Security',
    language: 'Language',
    currency: 'Currency',
    notifications: 'Notifications',
    theme: 'Theme',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    profileUpdated: 'Profile updated successfully',
    passwordChanged: 'Password changed successfully',
    profileImage: 'Profile Image',
    uploadImage: 'Upload Image',
    removeImage: 'Remove Image',
    selectLanguage: 'Select Language',
    english: 'English',
    polish: 'Polish',
    languageChanged: 'Language changed successfully',
    fullName: 'Full Name',
    emailNotifications: 'Email Notifications',
    pushNotifications: 'Push Notifications',
    transactionAlerts: 'Transaction Alerts',
    weeklyReports: 'Weekly Reports',
    savingsGoalAlerts: 'Savings Goal Alerts',
    twoFactorAuth: 'Two-Factor Authentication',
    rememberDevices: 'Remember Devices',
    autoLogout: 'Auto Logout (minutes)',
    dangerZone: 'Danger Zone',
    deleteAccount: 'Delete Account',
    deleteAccountWarning: 'Deleting your account is permanent and cannot be undone. All your data will be lost.',
    deleteAccountConfirm: 'Are you sure you want to delete your account?'
  },

  // Social
  social: {
    title: 'Social',
    friends: 'Friends',
    addFriend: 'Add Friend',
    sharedWallets: 'Shared Wallets',
    invitations: 'Invitations',
    noFriends: 'No friends yet',
    noSharedWallets: 'No shared wallets',
    noInvitations: 'No invitations'
  },

  // Errors
  errors: {
    general: 'Something went wrong',
    network: 'Network error',
    unauthorized: 'Unauthorized access',
    forbidden: 'Access forbidden',
    notFound: 'Not found',
    validation: 'Validation error',
    required: 'This field is required',
    invalidEmail: 'Invalid email address',
    passwordTooShort: 'Password too short',
    passwordsNotMatch: 'Passwords do not match',
    amountRequired: 'Amount is required',
    amountInvalid: 'Invalid amount',
    nameRequired: 'Name is required',
    categoryRequired: 'Category is required',
    walletRequired: 'Wallet is required'
  },

  // Success messages
  success: {
    saved: 'Saved successfully',
    updated: 'Updated successfully',
    deleted: 'Deleted successfully',
    created: 'Created successfully'
  }
};

// Tłumaczenia polskie
const plTranslations = {
  // Navigation
  nav: {
    dashboard: 'Panel główny',
    statistics: 'Statystyki',
    accounts: 'Konta',
    social: 'Społeczność',
    settings: 'Ustawienia',
    categories: 'Kategorie'
  },
  
  // Common
  common: {
    save: 'Zapisz',
    cancel: 'Anuluj',
    delete: 'Usuń',
    edit: 'Edytuj',
    add: 'Dodaj',
    close: 'Zamknij',
    confirm: 'Potwierdź',
    loading: 'Ładowanie...',
    error: 'Błąd',
    success: 'Sukces',
    warning: 'Ostrzeżenie',
    info: 'Informacja',
    yes: 'Tak',
    no: 'Nie',
    search: 'Szukaj',
    filter: 'Filtruj',
    sort: 'Sortuj',
    name: 'Nazwa',
    description: 'Opis',
    amount: 'Kwota',
    date: 'Data',
    category: 'Kategoria',
    wallet: 'Portfel',
    type: 'Typ',
    status: 'Status',
    actions: 'Akcje'
  },

  // Auth
  auth: {
    login: 'Zaloguj się',
    register: 'Zarejestruj się',
    logout: 'Wyloguj się',
    email: 'Email',
    password: 'Hasło',
    confirmPassword: 'Potwierdź hasło',
    fullName: 'Imię i nazwisko',
    forgotPassword: 'Zapomniałeś hasła?',
    dontHaveAccount: 'Nie masz konta?',
    alreadyHaveAccount: 'Masz już konto?',
    signIn: 'Zaloguj się',
    signUp: 'Zarejestruj się',
    welcomeBack: 'Witaj ponownie',
    createAccount: 'Utwórz konto',
    loginSuccess: 'Logowanie pomyślne',
    registerSuccess: 'Rejestracja pomyślna',
    loginError: 'Błąd logowania',
    registerError: 'Błąd rejestracji'
  },

  // Dashboard
  dashboard: {
    title: 'Panel główny',
    totalBalance: 'Całkowite saldo',
    monthlyIncome: 'Miesięczne przychody',
    monthlyExpenses: 'Miesięczne wydatki',
    recentTransactions: 'Ostatnie transakcje',
    quickActions: 'Szybkie akcje',
    addIncome: 'Dodaj przychód',
    addExpense: 'Dodaj wydatek',
    viewAll: 'Zobacz wszystkie',
    noTransactions: 'Brak transakcji',
    balance: 'Saldo',
    income: 'Przychody',
    expenses: 'Wydatki'
  },

  // Transactions
  transactions: {
    title: 'Transakcje',
    addTransaction: 'Dodaj transakcję',
    editTransaction: 'Edytuj transakcję',
    deleteTransaction: 'Usuń transakcję',
    transactionAdded: 'Transakcja dodana pomyślnie',
    transactionUpdated: 'Transakcja zaktualizowana pomyślnie',
    transactionDeleted: 'Transakcja usunięta pomyślnie',
    income: 'Przychód',
    expense: 'Wydatek',
    allTransactions: 'Wszystkie transakcje',
    incomeTransactions: 'Przychody',
    expenseTransactions: 'Wydatki',
    noTransactions: 'Nie znaleziono transakcji',
    selectCategory: 'Wybierz kategorię',
    selectWallet: 'Wybierz portfel',
    enterAmount: 'Wprowadź kwotę',
    enterDescription: 'Wprowadź opis'
  },

  // Wallets
  wallets: {
    title: 'Portfele',
    myWallets: 'Moje portfele',
    addWallet: 'Dodaj portfel',
    editWallet: 'Edytuj portfel',
    deleteWallet: 'Usuń portfel',
    walletName: 'Nazwa portfela',
    walletType: 'Typ portfela',
    currency: 'Waluta',
    initialBalance: 'Saldo początkowe',
    currentBalance: 'Aktualne saldo',
    walletAdded: 'Portfel dodany pomyślnie',
    walletUpdated: 'Portfel zaktualizowany pomyślnie',
    walletDeleted: 'Portfel usunięty pomyślnie',
    setAsMain: 'Ustaw jako główny',
    mainWallet: 'Główny portfel',
    personal: 'Osobisty',
    business: 'Biznesowy',
    savings: 'Oszczędności',
    investment: 'Inwestycyjny'
  },

  // Categories
  categories: {
    title: 'Kategorie',
    addCategory: 'Dodaj kategorię',
    editCategory: 'Edytuj kategorię',
    deleteCategory: 'Usuń kategorię',
    categoryName: 'Nazwa kategorii',
    categoryAdded: 'Kategoria dodana pomyślnie',
    categoryUpdated: 'Kategoria zaktualizowana pomyślnie',
    categoryDeleted: 'Kategoria usunięta pomyślnie',
    globalCategories: 'Kategorie globalne',
    customCategories: 'Kategorie niestandardowe',
    noCategories: 'Nie znaleziono kategorii'
  },

  // Statistics
  statistics: {
    title: 'Statystyki',
    overview: 'Przegląd',
    incomeVsExpenses: 'Przychody vs Wydatki',
    categoryBreakdown: 'Podział według kategorii',
    monthlyTrends: 'Trendy miesięczne',
    thisMonth: 'Ten miesiąc',
    lastMonth: 'Ostatni miesiąc',
    thisYear: 'Ten rok',
    lastYear: 'Ostatni rok',
    totalIncome: 'Całkowite przychody',
    totalExpenses: 'Całkowite wydatki',
    netIncome: 'Dochód netto',
    averageTransaction: 'Średnia transakcja',
    transactionCount: 'Liczba transakcji'
  },

  // Settings
  settings: {
    title: 'Ustawienia',
    profile: 'Profil',
    preferences: 'Preferencje',
    security: 'Bezpieczeństwo',
    language: 'Język',
    currency: 'Waluta',
    notifications: 'Powiadomienia',
    theme: 'Motyw',
    changePassword: 'Zmień hasło',
    currentPassword: 'Aktualne hasło',
    newPassword: 'Nowe hasło',
    confirmNewPassword: 'Potwierdź nowe hasło',
    profileUpdated: 'Profil zaktualizowany pomyślnie',
    passwordChanged: 'Hasło zmienione pomyślnie',
    profileImage: 'Zdjęcie profilowe',
    uploadImage: 'Prześlij zdjęcie',
    removeImage: 'Usuń zdjęcie',
    selectLanguage: 'Wybierz język',
    english: 'Angielski',
    polish: 'Polski',
    languageChanged: 'Język zmieniony pomyślnie',
    fullName: 'Imię i nazwisko',
    emailNotifications: 'Powiadomienia email',
    pushNotifications: 'Powiadomienia push',
    transactionAlerts: 'Alerty transakcji',
    weeklyReports: 'Tygodniowe raporty',
    savingsGoalAlerts: 'Alerty celów oszczędzania',
    twoFactorAuth: 'Dwufaktorowa autoryzacja',
    rememberDevices: 'Pamiętaj urządzenia',
    autoLogout: 'Auto wylogowanie (minuty)',
    dangerZone: 'Zona niebezpieczna',
    deleteAccount: 'Usuń konto',
    deleteAccountWarning: 'Usuwanie konta jest trwałe i nie można go cofnąć. Wszystkie dane zostaną utracone.',
    deleteAccountConfirm: 'Czy na pewno chcesz usunąć konto?'
  },

  // Social
  social: {
    title: 'Społeczność',
    friends: 'Znajomi',
    addFriend: 'Dodaj znajomego',
    sharedWallets: 'Udostępnione portfele',
    invitations: 'Zaproszenia',
    noFriends: 'Brak znajomych',
    noSharedWallets: 'Brak udostępnionych portfeli',
    noInvitations: 'Brak zaproszeń'
  },

  // Errors
  errors: {
    general: 'Coś poszło nie tak',
    network: 'Błąd sieci',
    unauthorized: 'Brak autoryzacji',
    forbidden: 'Dostęp zabroniony',
    notFound: 'Nie znaleziono',
    validation: 'Błąd walidacji',
    required: 'To pole jest wymagane',
    invalidEmail: 'Nieprawidłowy adres email',
    passwordTooShort: 'Hasło za krótkie',
    passwordsNotMatch: 'Hasła nie pasują do siebie',
    amountRequired: 'Kwota jest wymagana',
    amountInvalid: 'Nieprawidłowa kwota',
    nameRequired: 'Nazwa jest wymagana',
    categoryRequired: 'Kategoria jest wymagana',
    walletRequired: 'Portfel jest wymagany'
  },

  // Success messages
  success: {
    saved: 'Zapisano pomyślnie',
    updated: 'Zaktualizowano pomyślnie',
    deleted: 'Usunięto pomyślnie',
    created: 'Utworzono pomyślnie'
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      pl: {
        translation: plTranslations
      }
    },
    lng: 'en', // domyślny język
    fallbackLng: 'en',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },

    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 