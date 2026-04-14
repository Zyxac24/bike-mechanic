# 🔧 Rowerowy Mechanik — PWA z autoryzacją i AI

## Architektura

```
Android (PWA)  ──→  Cloudflare Worker  ──→  OpenRouter API
                    (auth + proxy)
GitHub Pages         Cloudflare (free)       Twój klucz
```

## Pliki

| Plik | Gdzie | Opis |
|------|-------|------|
| `index.html` | GitHub Pages | Główna aplikacja PWA |
| `manifest.json` | GitHub Pages | Konfiguracja PWA |
| `sw.js` | GitHub Pages | Service worker (offline) |
| `worker.js` | Cloudflare Workers | Backend: auth + AI proxy |

---

## KROK 1: Cloudflare Worker (backend)

### 1a. Załóż konto Cloudflare (darmowe)
→ https://dash.cloudflare.com/sign-up

### 1b. Stwórz Worker
1. Zaloguj się do **Cloudflare Dashboard**
2. Menu po lewej: **Workers & Pages**
3. Kliknij **Create**  → **Create Worker**
4. Nazwa: `bike-mechanic` → kliknij **Deploy**
5. Po deployu kliknij **Edit Code**
6. **Usuń cały domyślny kod** i wklej zawartość pliku `worker.js`
7. Kliknij **Deploy**

### 1c. Ustaw zmienne środowiskowe (sekrety)
1. W ustawieniach Workera: **Settings → Variables and Secrets**
2. Kliknij **Add** i dodaj TYPE: **Secret** dla każdej zmiennej:

| Nazwa | Wartość | Opis |
|-------|---------|------|
| `ALLOWED_PHONES` | `+48501234567,+48602345678` | Lista numerów z dostępem (oddzielone przecinkami) |
| `OPENROUTER_KEY` | `sk-or-v1-twoj-klucz` | Twój klucz OpenRouter |
| `AUTH_SECRET` | `losowy-ciag-32-znaki` | Klucz szyfrowania tokenów (wygeneruj np. na https://randomkeygen.com — "CodeIgniter Encryption Keys") |

3. Kliknij **Deploy** aby zastosować zmienne

### 1d. Zanotuj adres Workera
Po deployu adres będzie wyglądał tak:
```
https://bike-mechanic.TWOJA-SUBDOMENA.workers.dev
```

---

## KROK 2: Zaktualizuj PWA

### 2a. Wpisz adres Workera w index.html
Otwórz `index.html` i znajdź linię:
```javascript
const WORKER_URL = "https://bike-mechanic.TWOJA-SUBDOMENA.workers.dev";
```
Zmień na swój rzeczywisty adres Workera.

### 2b. Wypchnij na GitHub
```bash
cd bike-mechanic
# Nadpisz stare pliki nowymi wersjami
git add .
git commit -m "Dodano autoryzację i AI"
git push
```

---

## KROK 3: Testuj

1. Otwórz `https://TWOJ-USER.github.io/bike-mechanic/`
2. Wpisz numer telefonu z listy `ALLOWED_PHONES`
3. Powinieneś zobaczyć bazę wiedzy
4. Kliknij "Zapytaj AI" na dowolnej karcie — powinno odpowiedzieć

---

## Zarządzanie dostępem

### Dodanie nowego użytkownika
1. Cloudflare Dashboard → Workers → `bike-mechanic` → Settings → Variables
2. Edytuj `ALLOWED_PHONES` — dodaj numer z przecinkiem
3. Deploy

### Format numerów
Numery muszą być w formacie: `+48XXXXXXXXX` (z kierunkowym, bez spacji)
Użytkownicy wpisują numer w tym samym formacie.

---

## Koszty

| Element | Koszt |
|---------|-------|
| GitHub Pages | ✅ Darmowe |
| Cloudflare Workers | ✅ Darmowe (100 000 zapytań/dzień) |
| OpenRouter | 💰 Wg zużycia (Claude Sonnet ~$3/1M tokenów) |

Typowe użycie: kilka zapytań AI dziennie = grosze miesięcznie.

---

## Troubleshooting

**"Brak dostępu" przy logowaniu:**
- Sprawdź format numeru (musi być identyczny z `ALLOWED_PHONES`)
- Sprawdź czy zmienne w Cloudflare zostały zdeploy'owane

**"Błąd połączenia z serwerem":**
- Sprawdź adres `WORKER_URL` w `index.html`
- Sprawdź czy Worker jest aktywny w Cloudflare Dashboard

**AI nie odpowiada:**
- Sprawdź `OPENROUTER_KEY` w Cloudflare
- Sprawdź saldo OpenRouter
