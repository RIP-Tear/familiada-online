# Instrukcja konfiguracji Google AdSense

## 🎯 Kroki do uruchomienia reklam

### 1. Załóż konto Google AdSense
1. Przejdź na [https://www.google.com/adsense](https://www.google.com/adsense)
2. Zaloguj się kontem Google
3. Wypełnij formularz zgłoszeniowy (podaj URL strony, dane kontaktowe)
4. Poczekaj na weryfikację konta (może potrwać 1-2 dni)

### 2. Zweryfikuj swoją stronę
Po akceptacji konta:
1. W Google AdSense znajdź kod weryfikacyjny
2. Dodaj go do swojej strony (kod jest już dodany w `layout.tsx`)
3. Potwierdź weryfikację w panelu AdSense

### 3. Znajdź swój Publisher ID
1. Zaloguj się do Google AdSense
2. W menu bocznym kliknij **Konto** → **Ustawienia**
3. Twój Publisher ID ma format: `ca-pub-XXXXXXXXXXXXXXXXX`
4. Skopiuj go

### 4. Utwórz bloki reklamowe
1. W Google AdSense przejdź do **Reklamy** → **Według bloków reklamowych**
2. Kliknij **+ Nowy blok reklamowy**
3. Wybierz **Reklama displayowa**
4. Nazwij blok (np. "Strona wyboru gry", "Strona drużyny", etc.)
5. Wybierz rozmiar: **Responsywny** (zalecane)
6. Skopiuj **Ad Slot ID** (ciąg cyfr)

### 5. Skonfiguruj zmienne środowiskowe
1. Skopiuj plik `.env.example` do `.env.local`:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. Edytuj `.env.local` i wklej swój Publisher ID:
   \`\`\`env
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-TWÓJ_PUBLISHER_ID
   \`\`\`

### 6. Zaktualizuj Ad Slot ID w komponentach
Edytuj pliki i zamień placeholder `"1234567890"` na prawdziwe Ad Slot ID:

- **src/app/gra/page.tsx** (linia z `<AdSense adSlot="1234567890" />`)
- **src/app/druzyna/page.tsx** (linia z `<AdSense adSlot="1234567891" />`)
- **src/app/uczestnik/page.tsx** (linia z `<AdSense adSlot="1234567892" />`)
- **src/app/prowadzacy/page.tsx** (linia z `<AdSense adSlot="1234567893" />`)

Przykład:
\`\`\`tsx
// Przed:
<AdSense adSlot="1234567890" />

// Po:
<AdSense adSlot="5678901234" />  // Twój prawdziwy Ad Slot ID
\`\`\`

### 7. Deploy na produkcję
Reklamy **NIE BĘDĄ** wyświetlane w trybie developerskim (localhost). Musisz wdrożyć stronę:

\`\`\`bash
npm run build
npm run start
\`\`\`

Lub wdróż na Vercel/Netlify/inne.

### 8. Poczekaj na zatwierdzenie reklam
- Po wdrożeniu Google AdSense musi przeskanować Twoją stronę
- Pierwsze reklamy mogą pojawić się dopiero po **48 godzinach**
- W międzyczasie mogą pokazywać się puste miejsca lub reklamy testowe

## 📊 Monitorowanie przychodów
1. Zaloguj się do Google AdSense
2. Przejdź do **Raporty**
3. Sprawdź wyświetlenia, kliknięcia i przychody

## 💡 Wskazówki optymalizacji
- **Nie klikaj swoich reklam** - Google może zbanować konto
- Umieść reklamy w miejscach, gdzie użytkownicy naturalnie spoczywają wzrokiem
- Nie umieszczaj za dużo reklam - może to odstraszyć użytkowników
- Testuj różne rozmiary bloków reklamowych (A/B testing)
- Śledź wskaźniki CTR (Click-Through Rate) w panelu AdSense

## ⚠️ Ważne uwagi
- Reklamy są wyłączone w trybie development (localhost)
- W development zobaczysz szare placeholdery z napisem "[AdSense Placeholder]"
- Nie naruszaj zasad Google AdSense (zachęcanie do klikania, clickbait, itp.)
- Przeczytaj [Zasady programu AdSense](https://support.google.com/adsense/answer/48182)

## 📍 Gdzie są reklamy w projekcie?
Reklamy zostały dodane na następujących stronach:
- ✅ `/gra/` - strona wyboru trybu gry
- ✅ `/prowadzacy/` - strona tworzenia gry jako host
- ✅ `/druzyna/` - strona dołączania jako drużyna
- ✅ `/uczestnik/` - strona dołączania jako uczestnik

Reklamy **NIE SĄ** na:
- ❌ Landing page (`/`) - główna strona promocyjna
- ❌ Strony rozgrywki (`/game/host/`, `/game/player/`) - aktywna gra

## 🔧 Rozwiązywanie problemów

### Reklamy się nie wyświetlają
1. Sprawdź czy jesteś na produkcji (nie localhost)
2. Sprawdź czy Publisher ID jest poprawny w `.env.local`
3. Sprawdź konsolę przeglądarki (F12) - szukaj błędów AdSense
4. Poczekaj 24-48h po pierwszym wdrożeniu
5. Sprawdź czy Twoje konto AdSense jest aktywne

### "AdSense Placeholder" w produkcji
- Upewnij się, że build używa zmiennych środowiskowych
- W Vercel dodaj `NEXT_PUBLIC_ADSENSE_CLIENT_ID` w Settings → Environment Variables

### Konto zablokowane
- Przeczytaj email od Google (powód blokady)
- Sprawdź politykę AdSense
- Złóż odwołanie jeśli uważasz że to błąd

## 📞 Wsparcie
- [Centrum pomocy Google AdSense](https://support.google.com/adsense)
- [Forum społeczności AdSense](https://support.google.com/adsense/community)
