# Agenda prezentacji — tura po realnych dashboardach (bez slajdów)

Zamiast klikać przez `presentation.html`, przechodzisz live po prawdziwych UI. Poniżej kolejność, linki/komendy do otwarcia każdego dashboardu i co powiedzieć przy każdym. `presentation.html` trzymaj jako zapasowy fallback (Esc = przegląd wszystkich slajdów), gdyby coś nie odpaliło na żywo.

---

## 0. Punkt wyjścia — Storybook z naszymi komponentami

```bash
APPLITOOLS_API_KEY=<klucz> npm run storybook
open http://localhost:6006
```

Pokaż Button/Card/Input — to jest "produkt", który każde z narzędzi niżej będzie testować. Jedno źródło prawdy dla całej tury.

---

## 1. reg-suit — lokalny self-hosted raport

```bash
npm run test:visual:reg-suit
open .reg/index.html
```

**Co pokazać:** lista story ze statusem (changed/new/passed), klik → diff side-by-side. **Powiedz:** to samo trafiłoby na S3 zamiast zostać na dysku — jedyna różnica to link zamiast lokalnego pliku. Zero SaaS, w pełni wasza infrastruktura.

---

## 2. Argos — dwa buildy, dwa różne statusy

Otwórz oba obok siebie (dwie karty):

- **Build #7** (main→main, baseline): https://app.argos-ci.com/tequ8/visual-testing/builds/7
  → status `success`, **"automatically approved"**
- **Build #9** (branch `demo/regresja-paddingu` → main, 7 changed): https://app.argos-ci.com/tequ8/visual-testing/builds/9
  → status `failure`, **"waiting for your decision"** — realna blokada merge'a PR-a

**Co pokazać:** klik w zmienioną story w buildzie #9 → diff z suwakiem. **Powiedz:** różnica bierze się z tego, że #7 to push bezpośrednio na main (nic do zablokowania), #9 to porównanie brancha z main (prawdziwy PR gate).

**Bonus (terminal obok przeglądarki), jeśli chcesz pokazać CLI:**
```bash
argos build get "https://app.argos-ci.com/tequ8/visual-testing/builds/9" --token=$ARGOS_TOKEN --json
argos build snapshots "https://app.argos-ci.com/tequ8/visual-testing/builds/9" --needs-review --token=$ARGOS_TOKEN
```
Warto wspomnieć: `argos review create` (approve/reject z CLI) wymaga **personal access tokena**, nie zwykłego tokena repo z CI.

**Bonus #2 — natywna integracja bez Storycap (build #10):** https://app.argos-ci.com/tequ8/visual-testing/builds/10
Jesteśmy na Angular 21, więc udało się zmigrować Storybook z webpacka na `@storybook/angular-vite` i odpalić `@argos-ci/storybook` przez Vitest — auto-discovery story bez żadnego zewnętrznego capture:
```bash
CI=true ARGOS_TOKEN=$ARGOS_TOKEN npx vitest run --project=storybook
```
**Powiedz:** to koryguje wcześniejsze założenie "Argos zawsze wymaga Storycap" — natywnie działa, ale tylko na builderze Vite (u nas: dopiero po migracji frameworka). I ciekawostka: przez zmianę nazewnictwa screenshotów build #10 pokazuje **28 added + 28 removed**, nie "changed" — migracja capture'u resetuje baseline, nie jest płynna.

---

## 3. Applitools Eyes — Visual AI + panel w Storybooku

**Dashboard (dwa wyniki obok siebie):**
- Baseline, 28/28 New: https://eyes.applitools.com/app/test-results/00000251618229773330?accountId=95oayd7rokehxwJHizqQUw__
- Po zmianie koloru, 21 Passed / 7 Unresolved: https://eyes.applitools.com/app/test-results/00000251618229619428?accountId=95oayd7rokehxwJHizqQUw__

**Co pokazać:** w drugim buildzie rozwiń listę "Unresolved" — dokładnie 7 story z primary buttonem, zero false positive na resztę 21. To jest efekt Visual AI, nie pixel-diffu.

**Panel w samym Storybooku** (jeśli chcesz zaryzykować live click):
- W Storybooku (localhost:6006) → dowolna story Button → zakładka **"Applitools"** obok Docs/A11y → "Run".
- ⚠️ **Ryzyko:** w naszym teście po zakończeniu testu (28/28 OK) addon zawiesił cały proces Storybooka (`Protocol error: Connection closed` w Puppeteerze). Miej otwarty terminal z gotową komendą restartu:
  ```bash
  pkill -9 -f "ng run visual-testing-poc:storybook"; APPLITOOLS_API_KEY=<klucz> npm run storybook
  ```
  Bezpieczniejsza opcja: pokaż wynik z dashboardu (punkt wyżej) i tylko **wspomnij**, że panel w Storybooku istnieje, bez klikania "Run" na żywo.

---

## 4. Percy — pokazujemy cudzy dashboard (nasz się wieszał)

U nas `percy storybook` wielokrotnie zawieszał się na etapie "network idle" — nie udało się dojść do własnego wyniku. Zamiast tego pokaż **publiczny przykładowy build Percy** (ich demo-projekt, nie nasz):

```
https://percy.io/percy/demo-dashboard-app/builds/1083596
```

**Powiedz wprost:** to nie jest nasz build z naszą regresją (jak w Argos/Applitools) — to pokazuje tylko jak *wygląda* UI Percy, bo w naszym środowisku nie udało się przez nie realnie przejść. To sama w sobie ważna informacja dla zespołu: ryzyko wdrożeniowe, nie tylko slajd z dokumentacji.

---

## 5. Chromatic — jeśli macie już własny build

Jeśli macie wcześniej zrobiony build w Chromatic (z poprzedniej sesji POC — "Build #1 auto-accepted", 6 komponentów), otwórz go bezpośrednio z **app.chromatic.com** → wasz projekt → ostatni build.

*(Nie mam tego linku z tej sesji — wklej swój, jeśli chcesz go pokazać w turze).*

**Co pokazać:** UI Review (osobne od UI Tests — feedback designerski bez blokowania testów), TurboSnap w statystykach builda (ile story faktycznie renderowano vs ile by trzeba bez optymalizacji).

---

## 6. Lost Pixel — krótko, bez dashboardu

Brak hostowanego UI w trybie OSS (tego używaliśmy) — tylko lokalne pliki w `.lostpixel/baseline/` i `.lostpixel/difference/`. Nie ma tu dashboardu do pokazania.

**Powiedz:** zespół Lost Pixel dołączył do Figmy, repo zarchiwizowane 22.04.2026 — stąd rozszerzyliśmy POC o Percy i Applitools zamiast dalej stawiać na to narzędzie.

---

## Kolejność w skrócie (ściąga)

1. Storybook (nasze komponenty) — orientacja
2. reg-suit `.reg/index.html` — self-hosted lokalnie
3. Argos build #7 vs #9 (auto-approve vs pending review) + build #10 (natywny Vitest, bez Storycap)
4. Applitools dashboard (2 wyniki) + opcjonalnie panel w Storybooku (z ryzykiem)
5. Percy — cudzy publiczny build + szczera uwaga o naszym problemie
6. Chromatic — wasz istniejący build (wklej link)
7. Lost Pixel — bez dashboardu, tylko komentarz o sunsetcie + Figmie

## Zapasowe materiały (gdyby coś nie odpaliło na żywo)

- `presentation.html` — pełny slide deck z tymi samymi wątkami jako fallback.
- `NOTATKI_NARZEDZIA_CHMUROWE.md` — głębsze notatki (silnik, koszty, integracja Storybook) do cytowania z pamięci, jeśli internet/demo zawiedzie.
