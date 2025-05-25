# Dokumentacja Bazy Danych MyMoney

## Przegląd

Baza danych MyMoney została zaprojektowana w oparciu o Microsoft SQL Server z wykorzystaniem Entity Framework Core jako ORM. Struktura bazy danych obsługuje zarządzanie użytkownikami, kontami finansowymi, transakcjami oraz kategoriami.

## Schemat bazy danych

### Diagram ERD

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      Users      │       │     Wallets     │       │  Transactions   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ Id (PK)         │◄──────┤ CreatedByUserId │       │ Id (PK)         │
│ Email           │       │ Id (PK)         │◄──────┤ WalletId (FK)   │
│ HashedPassword  │       │ Name            │       │ CategoryId (FK) │
│ RefreshToken    │       │ Type            │       │ Amount          │
│ RefreshTokenExp │       │ InitialBalance  │       │ Description     │
│ MainWalletId    │       │ Currency        │       │ Date            │
└─────────────────┘       │ CreatedAt       │       │ Type            │
                          └─────────────────┘       └─────────────────┘
                                    │                         │
                                    │                         │
                          ┌─────────────────┐       ┌─────────────────┐
                          │ WalletMembers   │       │   Categories    │
                          ├─────────────────┤       ├─────────────────┤
                          │ WalletId (FK)   │       │ Id (PK)         │
                          │ UserId (FK)     │       │ Name            │
                          │ Role            │       │ Type            │
                          └─────────────────┘       │ Icon            │
                                                    │ IsDefault       │
                                                    │ CreatedByUserId │
                                                    └─────────────────┘
```

## Tabele

### 1. Users (Użytkownicy)

Przechowuje informacje o użytkownikach systemu.

```sql
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    HashedPassword NVARCHAR(MAX) NOT NULL,
    RefreshToken NVARCHAR(MAX) NULL,
    RefreshTokenExpiration DATETIME2 NULL,
    MainWalletId UNIQUEIDENTIFIER NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_Users_MainWallet FOREIGN KEY (MainWalletId) 
        REFERENCES Wallets(Id)
);
```

**Kolumny:**
- `Id` - Unikalny identyfikator użytkownika (GUID)
- `Email` - Adres email (unikalny)
- `HashedPassword` - Zahashowane hasło (bcrypt)
- `RefreshToken` - Token odświeżania JWT
- `RefreshTokenExpiration` - Data wygaśnięcia refresh token
- `MainWalletId` - ID głównego konta użytkownika
- `CreatedAt` - Data utworzenia konta

**Indeksy:**
```sql
CREATE UNIQUE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_RefreshToken ON Users(RefreshToken);
```

### 2. Wallets (Konta)

Przechowuje informacje o kontach finansowych.

```sql
CREATE TABLE Wallets (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL,
    Type INT NOT NULL, -- 0=Personal, 1=Shared, 2=Business
    InitialBalance DECIMAL(18,2) NOT NULL DEFAULT 0,
    Currency NVARCHAR(10) NOT NULL DEFAULT 'zł',
    CreatedByUserId UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_Wallets_CreatedByUser FOREIGN KEY (CreatedByUserId) 
        REFERENCES Users(Id) ON DELETE CASCADE
);
```

**Kolumny:**
- `Id` - Unikalny identyfikator konta
- `Name` - Nazwa konta
- `Type` - Typ konta (Personal=0, Shared=1, Business=2)
- `InitialBalance` - Początkowe saldo
- `Currency` - Waluta konta
- `CreatedByUserId` - ID użytkownika który utworzył konto
- `CreatedAt` - Data utworzenia

**Indeksy:**
```sql
CREATE INDEX IX_Wallets_CreatedByUserId ON Wallets(CreatedByUserId);
CREATE INDEX IX_Wallets_Type ON Wallets(Type);
```

### 3. WalletMembers (Członkowie kont)

Tabela łącząca użytkowników z kontami (relacja many-to-many).

```sql
CREATE TABLE WalletMembers (
    WalletId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    Role INT NOT NULL, -- 0=Owner, 1=Admin, 2=Member, 3=ReadOnly
    JoinedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    PRIMARY KEY (WalletId, UserId),
    
    CONSTRAINT FK_WalletMembers_Wallet FOREIGN KEY (WalletId) 
        REFERENCES Wallets(Id) ON DELETE CASCADE,
    CONSTRAINT FK_WalletMembers_User FOREIGN KEY (UserId) 
        REFERENCES Users(Id) ON DELETE CASCADE
);
```

**Kolumny:**
- `WalletId` - ID konta
- `UserId` - ID użytkownika
- `Role` - Rola w koncie (Owner=0, Admin=1, Member=2, ReadOnly=3)
- `JoinedAt` - Data dołączenia do konta

**Indeksy:**
```sql
CREATE INDEX IX_WalletMembers_UserId ON WalletMembers(UserId);
CREATE INDEX IX_WalletMembers_Role ON WalletMembers(Role);
```

### 4. Categories (Kategorie)

Przechowuje kategorie transakcji (domyślne i niestandardowe).

```sql
CREATE TABLE Categories (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL,
    Type INT NOT NULL, -- 0=Expense, 1=Income
    Icon NVARCHAR(10) NULL,
    IsDefault BIT NOT NULL DEFAULT 0,
    CreatedByUserId UNIQUEIDENTIFIER NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_Categories_CreatedByUser FOREIGN KEY (CreatedByUserId) 
        REFERENCES Users(Id) ON DELETE CASCADE
);
```

**Kolumny:**
- `Id` - Unikalny identyfikator kategorii
- `Name` - Nazwa kategorii
- `Type` - Typ kategorii (Expense=0, Income=1)
- `Icon` - Ikona emoji
- `IsDefault` - Czy kategoria jest domyślna
- `CreatedByUserId` - ID użytkownika (NULL dla domyślnych)
- `CreatedAt` - Data utworzenia

**Indeksy:**
```sql
CREATE INDEX IX_Categories_Type ON Categories(Type);
CREATE INDEX IX_Categories_IsDefault ON Categories(IsDefault);
CREATE INDEX IX_Categories_CreatedByUserId ON Categories(CreatedByUserId);
```

### 5. Transactions (Transakcje)

Przechowuje wszystkie transakcje finansowe.

```sql
CREATE TABLE Transactions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    WalletId UNIQUEIDENTIFIER NOT NULL,
    CategoryId UNIQUEIDENTIFIER NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    Description NVARCHAR(500) NULL,
    Date DATETIME2 NOT NULL,
    Type INT NOT NULL, -- 0=Expense, 1=Income
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_Transactions_Wallet FOREIGN KEY (WalletId) 
        REFERENCES Wallets(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Transactions_Category FOREIGN KEY (CategoryId) 
        REFERENCES Categories(Id),
    CONSTRAINT CK_Transactions_Amount CHECK (Amount != 0)
);
```

**Kolumny:**
- `Id` - Unikalny identyfikator transakcji
- `WalletId` - ID konta
- `CategoryId` - ID kategorii
- `Amount` - Kwota (ujemna dla wydatków, dodatnia dla przychodów)
- `Description` - Opis transakcji
- `Date` - Data transakcji
- `Type` - Typ transakcji (Expense=0, Income=1)
- `CreatedAt` - Data utworzenia rekordu
- `UpdatedAt` - Data ostatniej modyfikacji

**Indeksy:**
```sql
CREATE INDEX IX_Transactions_WalletId ON Transactions(WalletId);
CREATE INDEX IX_Transactions_CategoryId ON Transactions(CategoryId);
CREATE INDEX IX_Transactions_Date ON Transactions(Date);
CREATE INDEX IX_Transactions_Type ON Transactions(Type);
CREATE INDEX IX_Transactions_WalletId_Date ON Transactions(WalletId, Date);
```

## Widoki (Views)

### 1. WalletBalances - Aktualne salda kont

```sql
CREATE VIEW WalletBalances AS
SELECT 
    w.Id AS WalletId,
    w.Name AS WalletName,
    w.InitialBalance,
    COALESCE(SUM(t.Amount), 0) AS TransactionsSum,
    w.InitialBalance + COALESCE(SUM(t.Amount), 0) AS CurrentBalance,
    w.Currency
FROM Wallets w
LEFT JOIN Transactions t ON w.Id = t.WalletId
GROUP BY w.Id, w.Name, w.InitialBalance, w.Currency;
```

### 2. MonthlyStatistics - Statystyki miesięczne

```sql
CREATE VIEW MonthlyStatistics AS
SELECT 
    t.WalletId,
    YEAR(t.Date) AS Year,
    MONTH(t.Date) AS Month,
    SUM(CASE WHEN t.Type = 1 THEN t.Amount ELSE 0 END) AS TotalIncome,
    SUM(CASE WHEN t.Type = 0 THEN ABS(t.Amount) ELSE 0 END) AS TotalExpenses,
    COUNT(*) AS TransactionCount
FROM Transactions t
GROUP BY t.WalletId, YEAR(t.Date), MONTH(t.Date);
```

### 3. CategoryStatistics - Statystyki kategorii

```sql
CREATE VIEW CategoryStatistics AS
SELECT 
    t.WalletId,
    t.CategoryId,
    c.Name AS CategoryName,
    c.Type AS CategoryType,
    COUNT(*) AS TransactionCount,
    SUM(ABS(t.Amount)) AS TotalAmount,
    AVG(ABS(t.Amount)) AS AverageAmount
FROM Transactions t
INNER JOIN Categories c ON t.CategoryId = c.Id
GROUP BY t.WalletId, t.CategoryId, c.Name, c.Type;
```

## Procedury składowane

### 1. sp_GetWalletSummary - Podsumowanie konta

```sql
CREATE PROCEDURE sp_GetWalletSummary
    @WalletId UNIQUEIDENTIFIER,
    @StartDate DATETIME2 = NULL,
    @EndDate DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @StartDate IS NULL SET @StartDate = DATEADD(MONTH, -1, GETUTCDATE());
    IF @EndDate IS NULL SET @EndDate = GETUTCDATE();
    
    SELECT 
        w.Name AS WalletName,
        w.Currency,
        wb.CurrentBalance,
        SUM(CASE WHEN t.Type = 1 AND t.Date BETWEEN @StartDate AND @EndDate 
                 THEN t.Amount ELSE 0 END) AS PeriodIncome,
        SUM(CASE WHEN t.Type = 0 AND t.Date BETWEEN @StartDate AND @EndDate 
                 THEN ABS(t.Amount) ELSE 0 END) AS PeriodExpenses,
        COUNT(CASE WHEN t.Date BETWEEN @StartDate AND @EndDate 
                   THEN 1 END) AS PeriodTransactionCount
    FROM Wallets w
    INNER JOIN WalletBalances wb ON w.Id = wb.WalletId
    LEFT JOIN Transactions t ON w.Id = t.WalletId
    WHERE w.Id = @WalletId
    GROUP BY w.Name, w.Currency, wb.CurrentBalance;
END;
```

### 2. sp_RecalculateWalletBalance - Przeliczenie salda

```sql
CREATE PROCEDURE sp_RecalculateWalletBalance
    @WalletId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CalculatedBalance DECIMAL(18,2);
    DECLARE @InitialBalance DECIMAL(18,2);
    
    SELECT @InitialBalance = InitialBalance 
    FROM Wallets 
    WHERE Id = @WalletId;
    
    SELECT @CalculatedBalance = COALESCE(SUM(Amount), 0)
    FROM Transactions 
    WHERE WalletId = @WalletId;
    
    SELECT 
        @InitialBalance AS InitialBalance,
        @CalculatedBalance AS TransactionsSum,
        @InitialBalance + @CalculatedBalance AS CalculatedCurrentBalance;
END;
```

## Triggery

### 1. tr_UpdateTransactionTimestamp - Aktualizacja timestamp

```sql
CREATE TRIGGER tr_UpdateTransactionTimestamp
ON Transactions
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Transactions 
    SET UpdatedAt = GETUTCDATE()
    WHERE Id IN (SELECT Id FROM inserted);
END;
```

## Domyślne dane

### Kategorie domyślne

```sql
-- Kategorie wydatków
INSERT INTO Categories (Id, Name, Type, Icon, IsDefault) VALUES
(NEWID(), 'Jedzenie', 0, '🍕', 1),
(NEWID(), 'Transport', 0, '🚗', 1),
(NEWID(), 'Dom', 0, '🏠', 1),
(NEWID(), 'Odzież', 0, '👕', 1),
(NEWID(), 'Rozrywka', 0, '🎬', 1),
(NEWID(), 'Zdrowie', 0, '💊', 1),
(NEWID(), 'Edukacja', 0, '📚', 1),
(NEWID(), 'Prezenty', 0, '🎁', 1),
(NEWID(), 'Sport', 0, '⚽', 1),
(NEWID(), 'Inne wydatki', 0, '💸', 1);

-- Kategorie przychodów
INSERT INTO Categories (Id, Name, Type, Icon, IsDefault) VALUES
(NEWID(), 'Wynagrodzenie', 1, '💰', 1),
(NEWID(), 'Freelancing', 1, '💼', 1),
(NEWID(), 'Bonus', 1, '🎯', 1),
(NEWID(), 'Zwrot', 1, '💸', 1),
(NEWID(), 'Inwestycje', 1, '📈', 1),
(NEWID(), 'Prezent', 1, '🎁', 1),
(NEWID(), 'Inne przychody', 1, '💵', 1);
```

## Optymalizacja wydajności

### Strategia indeksowania

1. **Indeksy klastrowane** - na kluczach głównych (GUID)
2. **Indeksy kompozytowe** - dla często używanych kombinacji (WalletId + Date)
3. **Indeksy pokrywające** - dla zapytań statystycznych

### Partycjonowanie

Dla dużych wolumenów danych można rozważyć partycjonowanie tabeli Transactions:

```sql
-- Partycjonowanie według roku
CREATE PARTITION FUNCTION pf_TransactionsByYear (DATETIME2)
AS RANGE RIGHT FOR VALUES 
('2023-01-01', '2024-01-01', '2025-01-01');

CREATE PARTITION SCHEME ps_TransactionsByYear
AS PARTITION pf_TransactionsByYear
ALL TO ([PRIMARY]);

-- Utworzenie tabeli z partycjonowaniem
CREATE TABLE Transactions_Partitioned (
    -- kolumny jak w oryginalnej tabeli
) ON ps_TransactionsByYear(Date);
```

### Archiwizacja danych

```sql
-- Procedura archiwizacji starych transakcji
CREATE PROCEDURE sp_ArchiveOldTransactions
    @ArchiveBeforeDate DATETIME2
AS
BEGIN
    -- Przeniesienie do tabeli archiwum
    INSERT INTO TransactionsArchive
    SELECT * FROM Transactions 
    WHERE Date < @ArchiveBeforeDate;
    
    -- Usunięcie z głównej tabeli
    DELETE FROM Transactions 
    WHERE Date < @ArchiveBeforeDate;
END;
```

## Backup i Recovery

### Strategia kopii zapasowych

1. **Full Backup** - codziennie o 2:00
2. **Differential Backup** - co 6 godzin
3. **Transaction Log Backup** - co 15 minut

```sql
-- Pełna kopia zapasowa
BACKUP DATABASE MyMoneyDB 
TO DISK = 'C:\Backups\MyMoneyDB_Full.bak'
WITH COMPRESSION, CHECKSUM;

-- Kopia różnicowa
BACKUP DATABASE MyMoneyDB 
TO DISK = 'C:\Backups\MyMoneyDB_Diff.bak'
WITH DIFFERENTIAL, COMPRESSION, CHECKSUM;

-- Kopia logu transakcji
BACKUP LOG MyMoneyDB 
TO DISK = 'C:\Backups\MyMoneyDB_Log.trn';
```

## Monitorowanie

### Zapytania diagnostyczne

```sql
-- Top 10 najwolniejszych zapytań
SELECT TOP 10
    qs.total_elapsed_time / qs.execution_count AS avg_elapsed_time,
    qs.execution_count,
    SUBSTRING(qt.text, qs.statement_start_offset/2+1,
        (CASE WHEN qs.statement_end_offset = -1
            THEN LEN(CONVERT(nvarchar(max), qt.text)) * 2
            ELSE qs.statement_end_offset end - qs.statement_start_offset)/2) AS query_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
ORDER BY avg_elapsed_time DESC;

-- Statystyki użycia indeksów
SELECT 
    i.name AS IndexName,
    s.user_seeks,
    s.user_scans,
    s.user_lookups,
    s.user_updates
FROM sys.dm_db_index_usage_stats s
INNER JOIN sys.indexes i ON s.object_id = i.object_id AND s.index_id = i.index_id
WHERE s.database_id = DB_ID('MyMoneyDB')
ORDER BY s.user_seeks + s.user_scans + s.user_lookups DESC;
```

---

**Uwaga:** Regularne monitorowanie wydajności i optymalizacja zapytań są kluczowe dla utrzymania dobrej responsywności aplikacji. 