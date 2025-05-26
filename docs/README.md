# MyMoney - Dokumentacja Projektu

## Spis treści

1. [Wprowadzenie](#wprowadzenie)
2. [Architektura systemu](architektura.md)
3. [Instalacja i konfiguracja](instalacja.md)
4. [Przewodnik użytkownika](przewodnik-uzytkownika.md)
5. [Dokumentacja API](api.md)
6. [Dokumentacja frontendu](frontend.md)
7. [Baza danych](baza-danych.md)
8. [Testowanie](testowanie.md)
9. [Wdrożenie](wdrozenie.md)
10. [Diagramy i wizualizacje](diagramy.md)
11. [Rozwiązywanie problemów](troubleshooting.md)

## Wprowadzenie

MyMoney to nowoczesna aplikacja webowa do zarządzania finansami osobistymi, która umożliwia użytkownikom śledzenie przychodów, wydatków oraz planowanie budżetu. Aplikacja została zaprojektowana z myślą o prostocie użytkowania i funkcjonalności, która pomoże w codziennym zarządzaniu finansami.

### Główne funkcjonalności

- **Zarządzanie kontami** - tworzenie i zarządzanie wieloma kontami finansowymi
- **Śledzenie transakcji** - dodawanie i kategoryzowanie przychodów oraz wydatków
- **Analiza finansowa** - generowanie wykresów i raportów finansowych
- **Budżetowanie** - planowanie i monitorowanie budżetów
- **Funkcje społecznościowe** - dzielenie się kontami z innymi użytkownikami
- **Bezpieczne uwierzytelnianie** - logowanie przez Google, Facebook lub tradycyjne konto

### Technologie

**Frontend:**
- React 18.0.0
- Material-UI (MUI) 5.6.2
- Chart.js 4.4.9 / Recharts 2.5.0
- React Router 6.3.0
- Axios 1.9.0

**Backend:**
- .NET 9.0
- ASP.NET Core Web API
- Entity Framework Core 9.0.5
- SQL Server
- JWT Authentication

**Infrastruktura:**
- Docker & Docker Compose
- Supabase (opcjonalnie)

### Wymagania systemowe

- Node.js 16+ (dla frontendu)
- .NET 9.0 SDK (dla backendu)
- SQL Server lub SQL Server Express
- Docker (opcjonalnie)

### Struktura projektu

```
MyMoney/
├── frontend/           # Aplikacja React
│   ├── src/
│   │   ├── components/ # Komponenty React
│   │   ├── pages/      # Strony aplikacji
│   │   ├── services/   # Usługi API
│   │   ├── context/    # Konteksty React
│   │   └── hooks/      # Custom hooks
│   └── public/         # Pliki statyczne
├── api/                # Backend .NET
│   ├── Controllers/    # Kontrolery API
│   ├── Models/         # Modele danych
│   ├── Services/       # Logika biznesowa
│   ├── Database/       # Konfiguracja bazy danych
│   └── Migrations/     # Migracje bazy danych
├── docs/               # Dokumentacja
└── docker-compose.yml  # Konfiguracja Docker
```
