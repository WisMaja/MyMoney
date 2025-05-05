# Aplikacja do Śledzenia Finansów

Osobista aplikacja finansowa do śledzenia przychodów i wydatków.

## Struktura Projektu

- `frontend/`: Aplikacja React
- `backend/`: API backendowe (do zaimplementowania)

## Rozpoczęcie Pracy

### Uruchamianie z Dockerem

Aby uruchomić aplikację przy użyciu Dockera:

```bash
docker-compose up
```

### Lokalne Uruchamianie Frontendu

Aby uruchomić tylko aplikację frontendową:

1. Przejdź do katalogu frontend:
```bash
cd frontend
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Uruchom serwer deweloperski:
```bash
npm start
```

4. Otwórz przeglądarkę i przejdź do http://localhost:3000

## Funkcjonalności

- Logowanie przez Google i Facebook
- Śledzenie przychodów i wydatków
- Przeglądanie raportów finansowych i analityki

## Diagramy Przepływów Procesów

### Proces: Tworzenie Budżetów

```mermaid
flowchart LR
    A[Strona główna/widok wszystkich budżetów] --> B[Tworzenie budżetu]
    B --> C[Podawanie danych do budżetu]
    C --> D{Akceptacja?}
    D -->|Tak| E[Strona nowo utworzonego budżetu]
    D -->|Nie| A
```

### Proces: Dodawanie Wydatków

```mermaid
flowchart LR
    A[Strona główna/Dashboard] --> B[Przejście do sekcji Konta]
    B --> C[Wybór opcji "Dodaj Wydatek"]
    C --> D[Wypełnienie formularza wydatku]
    D --> E{Zatwierdzenie?}
    E -->|Tak| F[Zapisanie wydatku]
    F --> G[Aktualizacja salda konta]
    G --> H[Powrót do listy transakcji]
    E -->|Nie| B
```

### Proces: Dodawanie Przychodów

```mermaid
flowchart LR
    A[Strona główna/Dashboard] --> B[Przejście do sekcji Konta]
    B --> C[Wybór opcji "Dodaj Przychód"]
    C --> D[Wypełnienie formularza przychodu]
    D --> E{Zatwierdzenie?}
    E -->|Tak| F[Zapisanie przychodu]
    F --> G[Aktualizacja salda konta]
    G --> H[Powrót do listy transakcji]
    E -->|Nie| B
```

### Proces: Rejestracja Użytkownika

```mermaid
flowchart LR
    A[Strona logowania] --> B[Wybór opcji "Zarejestruj się"]
    B --> C[Wypełnienie formularza rejestracji]
    C --> D{Walidacja danych}
    D -->|Niepoprawne| C
    D -->|Poprawne| E[Utworzenie konta]
    E --> F[Wysłanie emaila z potwierdzeniem]
    F --> G[Strona logowania z komunikatem sukcesu]
```

### Proces: Zarządzanie Profilem Użytkownika

```mermaid
flowchart LR
    A[Dashboard] --> B[Przejście do sekcji Ustawienia]
    B --> C[Wybór zakładki Profil]
    C --> D[Edycja danych profilu]
    D --> E{Zapisać zmiany?}
    E -->|Tak| F[Zapisanie zmian w profilu]
    F --> G[Wyświetlenie komunikatu sukcesu]
    E -->|Nie| C
```

### Proces: Przeglądanie Statystyk

```mermaid
flowchart LR
    A[Dashboard] --> B[Przejście do sekcji Statystyki]
    B --> C[Wybór zakresu dat]
    C --> D[Generowanie wykresów]
    D --> E[Wyświetlenie wykresów i danych]
    E --> F{Zmiana parametrów?}
    F -->|Tak| C
    F -->|Nie| G[Powrót do Dashboard]
```

### Proces: Zarządzanie Kontami

```mermaid
flowchart LR
    A[Dashboard] --> B[Przejście do sekcji Konta]
    B --> C{Wybór akcji}
    C -->|Dodaj konto| D[Formularz nowego konta]
    C -->|Edytuj konto| E[Formularz edycji konta]
    C -->|Usuń konto| F[Potwierdzenie usunięcia]
    D --> G[Zapisanie nowego konta]
    E --> H[Zapisanie zmian w koncie]
    F -->|Potwierdzenie| I[Usunięcie konta]
    G --> J[Powrót do listy kont]
    H --> J
    I --> J
```

### Proces: Zarządzanie Znajomymi

```mermaid
flowchart LR
    A[Dashboard] --> B[Przejście do sekcji Znajomi]
    B --> C{Wybór akcji}
    C -->|Dodaj znajomego| D[Wyszukiwanie użytkownika]
    C -->|Akceptuj zaproszenie| E[Lista zaproszeń]
    C -->|Zarządzaj znajomymi| F[Lista znajomych]
    D --> G[Wysłanie zaproszenia]
    E --> H[Akceptacja/Odrzucenie zaproszenia]
    F --> I[Usunięcie znajomego]
    G --> J[Powrót do listy znajomych]
    H --> J
    I --> J
```

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
    UZYTKOWNIK ||--o{ KONTO : posiada
    UZYTKOWNIK ||--o{ TRANSAKCJA : tworzy
    UZYTKOWNIK ||--o{ BUDZET : ustawia
    UZYTKOWNIK }|--|{ UZYTKOWNIK : znajomy
    KONTO ||--o{ TRANSAKCJA : zawiera
    KATEGORIA ||--o{ TRANSAKCJA : klasyfikuje
    TRANSAKCJA }o--|| TYP_TRANSAKCJI : jest
    BUDZET }o--|| KATEGORIA : dotyczy

    UZYTKOWNIK {
        string id_uzytkownika PK
        string email
        string haslo
        string imie
        string nazwisko
        date data_rejestracji
        string ustawienia
    }
    
    KONTO {
        string id_konta PK
        string id_uzytkownika FK
        string nazwa
        float saldo
        string waluta
        string typ_konta
    }

    TRANSAKCJA {
        string id_transakcji PK
        string id_uzytkownika FK
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

    BUDZET {
        string id_budzetu PK
        string id_uzytkownika FK
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
    
    WyborMetodyLogowania --> LogowanieReczne
    WyborMetodyLogowania --> LogowanieGoogle
    WyborMetodyLogowania --> LogowanieFacebook
    
    LogowanieReczne --> ZadanieUwierzytelnienia
    LogowanieGoogle --> PrzekazanieDanychGoogle
    LogowanieFacebook --> PrzekazanieDanychFacebook
    
    PrzekazanieDanychGoogle --> ZadanieUwierzytelnienia
    PrzekazanieDanychFacebook --> ZadanieUwierzytelnienia
    
    ZadanieUwierzytelnienia --> WeryfikacjaDanych
    
    WeryfikacjaDanych --> BladLogowania: Dane niepoprawne
    WeryfikacjaDanych --> SesjaUzytkownika: Dane poprawne
    
    BladLogowania --> EkranLogowania
    
    SesjaUzytkownika --> [*]
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
