# 🎮 Familiada Online - Gra Familijna Za Darmo

Polska gra internetowa multiplayer oparta na popularnym teleturnieju Familiada. Graj za darmo online po polsku - na telefon lub komputer. Własne pytania, tablica online i rozgrywka w czasie rzeczywistym z Firebase i Next.js.

[![Next.js](https://img.shields.io/badge/Next.js-15.1.5-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime-orange)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

🌐 **Live Demo**: [www.familiada-online.pl](https://www.familiada-online.pl/)

---

## ✨ Funkcje

- 🎯 **Multiplayer online** - rozgrywka w czasie rzeczywistym za darmo
- 🎮 **Tryb prowadzącego** - kontroluj przebieg gry
- 👥 **Tryb drużynowy** - dołącz jako drużyna i rywalizuj
- 🔥 **System buzzerów** - klikaj najszybciej, aby zdobyć prawo odpowiedzi
- 📊 **Punktacja na żywo** - śledzenie wyników w czasie rzeczywistym
- 🎲 **Własne pytania** - twórz własne kategorie i pytania
- 📱 **Gra na telefon** - responsywny design, działa na wszystkich urządzeniach
- 🇵🇱 **Po polsku** - 100% polska gra w języku polskim
- 💾 **Bez pobierania** - graj bezpośrednio w przeglądarce
- 🎨 **Tablica online** - piękny interfejs jak w teleturnieju

---

## 🚀 Szybki Start

### Wymagania
- Node.js 18+ 
- npm / yarn / pnpm

### Instalacja

```bash
# Sklonuj repozytorium
git clone https://github.com/RIP-Tear/familiada-online.git
cd familiada-online

# Zainstaluj zależności
npm install

# Uruchom serwer deweloperski
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000) w przeglądarce.

### Tryb Demo (bez Firebase)

Aplikacja działa automatycznie w trybie demo bez konfiguracji Firebase. Możesz:
1. Stworzyć grę jako prowadzący
2. Dołączyć jako drużyna (w nowej karcie)
3. Przetestować wszystkie funkcje lokalnie

> ℹ️ W trybie demo dane są przechowywane w localStorage i nie są synchronizowane między urządzeniami.

---

## 🔥 Konfiguracja Firebase (Opcjonalna)

Aby włączyć synchronizację w czasie rzeczywistym i grę wieloosobową online:

### 1. Utwórz projekt Firebase
1. Przejdź do [Firebase Console](https://console.firebase.google.com/)
2. Utwórz nowy projekt
3. Włącz **Realtime Database**
4. Ustaw reguły bezpieczeństwa (tryb testowy):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 2. Pobierz dane konfiguracyjne
1. W ustawieniach projektu znajdź **Web App Config**
2. Skopiuj obiekt konfiguracyjny

### 3. Dodaj do projektu
```bash
# Skopiuj plik przykładowy
cp .env.example .env.local
```

Edytuj `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=twój_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=twój_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://twój-projekt.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=twój_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=twój_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=twój_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=twój_app_id
```

### 4. Uruchom ponownie serwer
```bash
npm run dev
```

> 📖 Szczegóły: [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

---

## 🎯 Jak grać?

### Tryb Prowadzącego
1. Kliknij **"Stwórz grę"**
2. Otrzymasz 4-cyfrowy kod gry
3. Udostępnij kod drużynom
4. Kontroluj przebieg gry (odkrywanie odpowiedzi, przyznawanie błędów)
5. Zarządzaj punktacją

### Tryb Drużyny
1. Kliknij **"Dołącz do gry"**
2. Wpisz kod gry
3. Podaj nazwę drużyny
4. Wybierz numer drużyny (1 lub 2)
5. Klikaj buzzer, aby zdobyć prawo odpowiedzi
6. Wybieraj odpowiedzi z listy

---

## 🏗️ Struktura Projektu

```
familiada-online/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── gra/               # Strona wyboru trybu gry
│   │   ├── zasady/            # Instrukcja i zasady
│   │   ├── prowadzacy/        # Panel prowadzącego
│   │   ├── druzyna/           # Panel dołączania drużyny
│   │   └── game/              # Sesje gry
│   │       ├── host/          # Widok prowadzącego
│   │       └── player/        # Widok gracza
│   ├── components/            # Komponenty UI
│   │   ├── Button.tsx         # Przycisk z wariantami
│   │   ├── Card.tsx           # Karty z gradientami
│   │   ├── Modal.tsx          # Modalne okna
│   │   ├── Navbar.tsx         # Nawigacja
│   │   └── ...
│   ├── redux/                 # Stan aplikacji
│   │   ├── store.ts           # Redux store
│   │   └── reducer/
│   │       ├── gameSlice.ts   # Stan gry
│   │       └── questionReducer.ts
│   ├── lib/
│   │   └── firebase.ts        # Konfiguracja Firebase
│   ├── utils/
│   │   ├── firebaseUtils.ts   # Operacje Firebase
│   │   ├── localGameStorage.ts # Tryb offline
│   │   └── questions.ts       # Bank pytań
│   ├── styles/                # Style SCSS
│   └── types/                 # TypeScript types
├── public/                    # Pliki statyczne
└── FIREBASE_SETUP.md          # Szczegółowa instrukcja Firebase
```

---

## 🎨 System Komponentów

### Kolory
- **Charcoal Blue** (`#264653`) - Granatowy podstawowy
- **Verdigris** (`#2a9d8f`) - Turkusowy
- **Jasmine** (`#e9c46a`) - Złoty
- **Sandy Brown** (`#f4a261`) - Pomarańczowy
- **Burnt Peach** (`#e76f51`) - Brzoskwiniowy

### Komponenty
- `<Button>` - Przyciski z 5 wariantami (primary, secondary, accent, danger, outline)
- `<Card>` - Karty z gradientami i efektami
- `<Modal>` - Modale z animacjami
- `<Table>` - Tabele wyników
- `<Badge>` - Wskaźniki statusu

---

## 🌐 SEO i Deployment

### Sitemap
Automatycznie generowany sitemap dostępny pod: `/sitemap.xml`

Strony:
- `/` - Strona główna
- `/gra` - Wybór trybu gry
- `/zasady` - Zasady gry
- `/prowadzacy` - Panel prowadzącego
- `/druzyna` - Dołączanie drużyny

### Robots.txt
Automatycznie generowany: `/robots.txt`

### Google Search Console
Po wdrożeniu:
1. Dodaj właścicość w [Google Search Console](https://search.google.com/search-console)
2. Zweryfikuj domenę
3. Prześlij sitemap: `https://twoja-domena.pl/sitemap.xml`

### Zmienne środowiskowe dla produkcji
```env
# .env.production
NEXT_PUBLIC_SITE_URL=https://www.familiada-online.pl
```

---

## 🛠️ Komendy

```bash
# Development
npm run dev          # Uruchom serwer deweloperski

# Production
npm run build        # Zbuduj aplikację
npm start            # Uruchom w trybie produkcyjnym

# Linting
npm run lint         # Sprawdź kod
```

---

## 📝 Licencja

© 2025 [RIP & Tear](https://www.rip-tear.com/)

---

## 🤝 Contributing

Chętnie przyjmujemy pull requesty! W przypadku większych zmian, najpierw otwórz issue, aby omówić proponowane zmiany.

---

## 📞 Kontakt

- Website: [www.rip-tear.com](https://www.rip-tear.com/)
- Game: [www.familiada-online.pl](https://www.familiada-online.pl/)

---

**Miłej zabawy! 🎮**
