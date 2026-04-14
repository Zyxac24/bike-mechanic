# 🔧 Rowerowy Mechanik — PWA na Androida

## Co to jest
Progresywna aplikacja webowa (PWA) — baza wiedzy mechanika rowerowego.
Działa jak natywna apka na Androidzie, offline (poza funkcją AI).

## Pliki
```
index.html     ← główna aplikacja (cała logika w jednym pliku)
manifest.json  ← konfiguracja PWA (nazwa, ikona, kolory)
sw.js          ← service worker (offline + cache)
```

## Instalacja — krok po kroku

### Opcja A: GitHub Pages (zalecana — darmowy HTTPS)

```bash
# 1. Stwórz nowe repo na GitHub
#    Nazwa np. "bike-mechanic" — może być publiczne

# 2. Sklonuj i wrzuć pliki
git clone https://github.com/TWOJ-USER/bike-mechanic.git
cd bike-mechanic
# Skopiuj 3 pliki: index.html, manifest.json, sw.js do tego folderu
git add .
git commit -m "PWA: Rowerowy Mechanik"
git push

# 3. Włącz GitHub Pages:
#    → Settings → Pages → Source: "Deploy from a branch"
#    → Branch: main, folder: / (root)
#    → Save

# 4. Po ~1 minucie apka będzie pod:
#    https://TWOJ-USER.github.io/bike-mechanic/
```

### Opcja B: Lokalny serwer (szybki test)

```bash
# Na Ubuntu — wystarczy Python
cd /ścieżka/do/folderu/z/plikami/
python3 -m http.server 8080

# Otwórz: http://localhost:8080
# Lub z telefonu w tej samej sieci: http://IP-KOMPUTERA:8080
```

## Instalacja na telefonie (Android)

1. Otwórz link w **Chrome** na Androidzie
2. Chrome pokaże baner **"Dodaj do ekranu głównego"**
   - Jeśli nie → kliknij menu (⋮) → **"Zainstaluj aplikację"** lub **"Dodaj do ekranu głównego"**
3. Apka pojawi się na ekranie głównym jak zwykła aplikacja
4. Działa bez paska adresu, w trybie pełnoekranowym
5. **Baza wiedzy działa offline** — przycisk "Zapytaj AI" wymaga internetu

## Aktualizacja

Edytuj `index.html`, zmień wersję cache w `sw.js` (linia `CACHE_NAME`),
push na GitHub. Apka zaktualizuje się automatycznie przy następnym otwarciu.
