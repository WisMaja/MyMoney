# Raport bezpieczeństwa aplikacji budżetowej

## 1. Zaimplementowane zabezpieczenia

### 1.1 Uwierzytelnianie i autoryzacja
Aplikacja posiada system logowania oparty na formularzu. Hasła użytkowników są przechowywane w formie haszowanej. Każde żądanie do chronionych zasobów jest weryfikowane pod kątem obecności ważnego tokenu użytkownika.

### 1.2 Ostrzeżenie w konsoli przeglądarki
Dodano komunikat informacyjny w konsoli, który ostrzega użytkowników przed wpisywaniem tam komend. Ma to na celu zapobieganie atakom typu self-XSS, które mogą wykorzystać nieuwagę użytkowników.

### 1.3 Testy logowania
Zaimplementowano testy weryfikujące poprawność logowania – zarówno dla poprawnych, jak i niepoprawnych danych. Testy te sprawdzają także sytuacje braku sesji i błędnych odpowiedzi serwera.

### 1.4 Oddzielenie środowisk
Zastosowano pliki `.env` do przechowywania wrażliwych danych. Pliki te są ignorowane w repozytorium i różnią się w zależności od środowiska (development/production).

## 2. Proponowane ulepszenia

### 2.1 Rozszerzenie pokrycia testami
Warto zautomatyzować testy jednostkowe i integracyjne dla całej aplikacji. Powinny one obejmować nie tylko logowanie, ale też operacje na danych budżetowych, formularze i zabezpieczenia.

### 2.2 Automatyzacja testów z użyciem CI/CD
Wdrożenie GitHub Actions lub Jenkinsa do automatycznego uruchamiania testów przy każdym commicie lub pull requeście. CI/CD może także odpowiadać za deploy do środowiska produkcyjnego tylko w przypadku pozytywnego wyniku testów.

### 2.3 Ochrona API
Zaleca się wdrożenie rate limiting, aby zapobiegać atakom typu brute-force. Dodatkowo, przy użyciu biblioteki Helmet, można zabezpieczyć aplikację odpowiednimi nagłówkami HTTP.

### 2.4 Obsługa CORS
Konieczne jest ograniczenie dostępnych domen poprzez odpowiednie ustawienie polityki CORS, aby zapobiec nieautoryzowanemu dostępowi z innych źródeł.

### 2.5 Monitorowanie i logowanie błędów
Warto zintegrować aplikację z narzędziami typu Sentry, Logtail lub innym systemem logowania, który umożliwia analizę błędów oraz monitorowanie niepożądanych działań użytkowników.

### 2.6 Analiza podatności i aktualizacje
Zaleca się użycie narzędzi takich jak Dependabot do automatycznego wykrywania nieaktualnych i podatnych bibliotek. Dodatkowo można uruchamiać skanery bezpieczeństwa typu OWASP Dependency Check.

### 2.7 Szyfrowanie danych
W przypadku przechowywania danych szczególnie wrażliwych (np. informacje finansowe, numery kart), należy je szyfrować zarówno w bazie danych, jak i podczas przesyłania (HTTPS).

### 2.8 Usuwanie danych użytkownika zgodnie z RODO
Warto przewidzieć funkcję trwałego usuwania konta i danych użytkownika na jego żądanie.

## 3. Bezpieczeństwo środowiska chmurowego

### 3.1 Przechowywanie sekretów
Zaleca się użycie systemów do zarządzania sekretami, np. GitHub Secrets lub AWS Secrets Manager, aby ograniczyć dostęp do wrażliwych danych środowiskowych.

### 3.2 Backupy i dostęp do bazy danych
Backupy powinny być szyfrowane i przechowywane poza główną infrastrukturą. Należy ograniczyć dostęp do bazy danych tylko do zaufanych adresów IP i aplikacji.

### 3.3 HTTPS i certyfikaty
Wdrożenie certyfikatów SSL oraz wymuszanie połączenia HTTPS w całej aplikacji.