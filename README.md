# Money Tracker Application

A personal finance application to track income and expenses.

## Project Structure

- `frontend/`: React application
- `backend/`: Backend API (to be implemented)

## Getting Started

### Running with Docker

To run the application using Docker:

```bash
docker-compose up
```

### Running Frontend Locally

To run just the frontend application:

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and go to http://localhost:3000

## Features

- Social login with Google, Facebook, and Apple
- Track income and expenses (to be implemented)
- View financial reports and analytics (to be implemented)

## Diagramy

### Diagram Przypadków Użycia

```mermaid
graph TD
    User((Użytkownik))
    Admin((Administrator))
    
    UC1[Rejestracja konta]
    UC2[Logowanie]
    UC3[Dodawanie wydatków]
    UC4[Dodawanie przychodów]
    UC5[Przeglądanie statystyk]
    UC6[Zarządzanie kontami]
    UC7[Zarządzanie budżetem]
    UC8[Zarządzanie znajomymi]
    UC9[Zarządzanie ustawieniami]
    UC10[Zarządzanie użytkownikami]
    
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC9
    Admin --> UC2
    Admin --> UC10
```

### Diagram Komponentów

```mermaid
graph TB
    subgraph Frontend
        Login[Login] --> Dashboard[Dashboard]
        Dashboard --> Accounts[Konta]
        Dashboard --> Statistics[Statystyki]
        Dashboard --> Social[Znajomi]
        Dashboard --> Settings[Ustawienia]
        Dashboard --> Budget[Budżet]
        Accounts --> AddIncome[Dodaj Przychód]
        Accounts --> AddExpense[Dodaj Wydatek]
    end
    
    subgraph Backend
        API[API RESTful] --> AuthService[Usługa Uwierzytelniania]
        API --> UserService[Usługa Użytkowników]
        API --> TransactionService[Usługa Transakcji]
        API --> AccountService[Usługa Kont]
        API --> StatisticsService[Usługa Statystyk]
        API --> SocialService[Usługa Społecznościowa]
    end
    
    subgraph Database
        UserDB[(Baza danych użytkowników)]
        TransactionDB[(Baza danych transakcji)]
        AccountDB[(Baza danych kont)]
        SocialDB[(Baza danych znajomych)]
    end
    
    Frontend --API Calls--> Backend
    AuthService --> UserDB
    UserService --> UserDB
    TransactionService --> TransactionDB
    AccountService --> AccountDB
    StatisticsService --> TransactionDB
    SocialService --> SocialDB
```

### Diagram Przepływu Procesu - Dodawanie Transakcji

```mermaid
sequenceDiagram
    Użytkownik->>+Frontend: Wybiera "Dodaj Wydatek"
    Frontend->>Frontend: Wyświetla formularz
    Użytkownik->>Frontend: Wprowadza dane transakcji
    Frontend->>+Backend: Wysyła dane transakcji
    Backend->>Backend: Waliduje dane
    Backend->>+Baza Danych: Zapisuje transakcję
    Baza Danych-->>-Backend: Potwierdzenie zapisu
    Backend-->>-Frontend: Status sukcesu
    Frontend-->>-Użytkownik: Komunikat potwierdzający
    Frontend->>Frontend: Odświeża listę transakcji
```

### Diagram Encji (ERD)

```mermaid
erDiagram
    UŻYTKOWNIK ||--o{ KONTO : posiada
    UŻYTKOWNIK ||--o{ TRANSAKCJA : tworzy
    UŻYTKOWNIK ||--o{ BUDŻET : ustawia
    UŻYTKOWNIK }|--|{ UŻYTKOWNIK : znajomy
    KONTO ||--o{ TRANSAKCJA : zawiera
    KATEGORIA ||--o{ TRANSAKCJA : klasyfikuje
    TRANSAKCJA }o--|| TYP_TRANSAKCJI : jest
    BUDŻET }o--|| KATEGORIA : dotyczy

    UŻYTKOWNIK {
        string id_użytkownika PK
        string email
        string hasło
        string imię
        string nazwisko
        date data_rejestracji
        string ustawienia
    }
    
    KONTO {
        string id_konta PK
        string id_użytkownika FK
        string nazwa
        float saldo
        string waluta
        string typ_konta
    }

    TRANSAKCJA {
        string id_transakcji PK
        string id_użytkownika FK
        string id_konta FK
        string id_kategorii FK
        string typ_transakcji FK
        float kwota
        date data_transakcji
        string opis
    }

    KATEGORIA {
        string id_kategorii PK
        string nazwa
        string typ
        string ikona
    }

    TYP_TRANSAKCJI {
        string id_typu PK
        string nazwa
    }

    BUDŻET {
        string id_budżetu PK
        string id_użytkownika FK
        string id_kategorii FK
        float kwota_planowana
        date data_od
        date data_do
    }
```

### Diagram Stanów - Proces Logowania

```mermaid
stateDiagram-v2
    [*] --> EkranLogowania
    EkranLogowania --> WyborMetodyLogowania
    
    WyborMetodyLogowania --> LogowanieRęczne
    WyborMetodyLogowania --> LogowanieGoogle
    WyborMetodyLogowania --> LogowanieFacebook
    
    LogowanieRęczne --> ŻądanieUwierzytelnienia
    LogowanieGoogle --> PrzekazanieDanychGoogle
    LogowanieFacebook --> PrzekazanieDanychFacebook
    
    PrzekazanieDanychGoogle --> ŻądanieUwierzytelnienia
    PrzekazanieDanychFacebook --> ŻądanieUwierzytelnienia
    
    ŻądanieUwierzytelnienia --> WeryfikacjaDanych
    
    WeryfikacjaDanych --> BłądLogowania: Dane niepoprawne
    WeryfikacjaDanych --> SesjaUżytkownika: Dane poprawne
    
    BłądLogowania --> EkranLogowania
    
    SesjaUżytkownika --> [*]
```

### Diagram Architektury Systemu

```mermaid
flowchart TD
    subgraph "Warstwa Prezentacji"
        UI[Interfejs Użytkownika React]
    end
    
    subgraph "Warstwa Usług"
        AS[Usługi Uwierzytelniania]
        TS[Usługi Transakcji]
        SS[Usługi Statystyk]
        US[Usługi Użytkownika]
        BS[Usługi Budżetu]
        SCS[Usługi Społecznościowe]
    end
    
    subgraph "Warstwa Danych"
        DB[(Baza Danych)]
    end
    
    subgraph "Usługi Zewnętrzne"
        GL[Google Login API]
        FL[Facebook Login API]
    end
    
    UI <--> AS
    UI <--> TS
    UI <--> SS
    UI <--> US
    UI <--> BS
    UI <--> SCS
    
    AS <--> DB
    TS <--> DB
    SS <--> DB
    US <--> DB
    BS <--> DB
    SCS <--> DB
    
    AS <--> GL
    AS <--> FL
```