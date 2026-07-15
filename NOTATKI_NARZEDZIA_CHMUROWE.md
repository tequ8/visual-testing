# Notatki: 4 chmurowe narzędzia do testów wizualnych

Notatki pomocnicze do prezentacji zespołowej — Chromatic, Argos, Percy, Applitools Eyes.
Dla Chromatic i Argos część faktów pochodzi z realnego demo w tym repo (nie tylko dokumentacji).
Dla Percy i Applitools — wyłącznie z dokumentacji (nie testowane live, brak kont).

## Szybkie porównanie silników

| | Silnik porównania | Gdzie się wykonuje capture | Gdzie się wykonuje diff |
|---|---|---|---|
| **Chromatic** | Pixel-diff odporny na anti-aliasing + TurboSnap (pomija niezmienione story) | W chmurze Chromatic (własne przeglądarki Chrome/Firefox/Safari/Edge) | W chmurze Chromatic |
| **Argos** | Pixel-diff + własny "stabilization engine" (filtruje anti-aliasing, font rendering, dynamic content) | Lokalnie/w CI — przez Storycap (uniwersalnie) albo natywnie przez Vitest, jeśli Storybook stoi na builderze Vite | W chmurze Argos |
| **Percy** | DOM-snapshot → re-render w wielu przeglądarkach/szerokościach → pixel-diff | Lokalnie (SDK przechwytuje DOM, nie obraz) | Rendering + diff w chmurze Percy/BrowserStack |
| **Applitools Eyes** | **Visual AI** (computer vision) — ocenia czy różnica jest wizualnie znacząca, nie porównuje piksel-po-pikselu | Lokalnie (Storybook renderowany lokalnie) lub w chmurowym gridzie | Visual AI w chmurze Applitools |

To jest chyba najważniejsza oś różnic do pokazania zespołowi: **3 z 4 narzędzia to warianty pixel-diff** (różnią się tym, co i jak wykonuje capture), a **Applitools jako jedyne stawia na computer vision** zamiast porównania pikseli.

---

## 1. Chromatic

**Jak działa:** Buduje się Storybook (lokalnie lub w CI), cały build (nie same screenshoty) wysyłany jest do Chromatic. Tam Chromatic renderuje każdą story we własnych, kontrolowanych przeglądarkach w chmurze i dopiero wtedy robi zrzut — więc nie zależy od tego, jaki silnik przeglądarki jest zainstalowany lokalnie/w CI.

**Silnik:** Pixel-diff z tolerancją na anti-aliasing. Kluczowa optymalizacja to **TurboSnap** — zamiast renderować wszystkie story przy każdym buildzie, Chromatic analizuje graf zależności bundlera i renderuje tylko te story, na które faktycznie wpłynęła zmiana w plikach. W praktyce redukuje to liczbę zużywanych snapshotów o 75–90%.

**Storybook:** Najgłębsza integracja ze wszystkich czterech — Chromatic jest tworzony przez zespół stojący za Storybookiem. Ma dedykowany addon (`visual-tests`) w samym Storybooku pokazujący status testów.

**Koszty (2026):** Free do 5 000 snapshotów/mies. Pro od **$149/mies.** za 35 000 snapshotów. Enterprise — wycena indywidualna. Z TurboSnap: dla design systemu ~500 story i 30 PR/dzień realny koszt to $300–700/mies. (bez TurboSnap byłoby znacznie więcej).

**Warto wspomnieć zespołowi:** TurboSnap to główny argument kosztowy — bez niego liczba snapshotów rośnie liniowo z liczbą story × liczbą PR-ów, co szybko robi się drogie.

---

## 2. Argos CI

**Jak działa:** Dwie ścieżki, obie realnie sprawdzone w naszym demo:
1. **Storycap (uniwersalna)** — Argos sam **nie renderuje** Storybooka, potrzebuje gotowych screenshotów z zewnętrznego narzędzia (Storycap, Playwright, Cypress, Puppeteer). `argos upload` wysyła gotowe PNG-i.
2. **Natywna integracja przez `@argos-ci/storybook`** — Argos **jednak potrafi auto-wykrywać story samodzielnie**, ale tylko jeśli Storybook stoi na builderze **Vite** (`@storybook/addon-vitest` + Vitest browser mode). Odpaliliśmy to live: `npx vitest run --project=storybook` z `ARGOS_TOKEN` w env → realny upload bez Storycap, zero osobnego kroku capture.

**Silnik:** Pixel-diff, ale z własnym "stabilization engine", który stara się odróżnić prawdziwą regresję od szumu (anti-aliasing, subpikselowe różnice fontów, migoczące elementy dynamiczne) — bez dopłat za "heurystyczny" silnik, jak to bywa u innych.

**Storybook:** Zależy od buildera. Nasz projekt (Angular) domyślnie używał webpacka (`@storybook/angular`) — tam natywna integracja **nie działa** (addon-vitest wymaga wirtualnego modułu z Vite). Zadziałało dopiero po migracji na `@storybook/angular-vite` (wymaga Angular 21+, u nas akurat spełnione). Dla starszych wersji Angulara albo innych builderów webpackowych — Storycap zostaje jedyną opcją.

**Koszty (2026):** Hobby (free) — **5 000 screenshotów/mies. na zawsze, $0**. Pro od **$100/mies.** za 35 000 screenshotów, overage $0.004/screenshot (ale tylko **$0.0015 za screenshot ze Storybooka** — wyraźnie taniej). Enterprise — custom, SAML SSO, 99.99% SLA.

**Co odkryliśmy w naszym live demo (ważne dla zespołu):**
- Build wgrany **bezpośrednio na branch bazowy** (main→main) jest **automatycznie zatwierdzany** — bo nie ma PR-a, który mógłby zostać zablokowany, więc build po prostu staje się nowym baseline'em.
- Realny **status "czeka na recenzję"** (blokujący merge PR-a) pojawia się dopiero, gdy build pochodzi z **osobnego brancha** porównanego z main.
- **Approve/reject przez CLI** (`argos review create`) wymaga **personal access tokena** — zwykły token repozytorium używany w CI (ten z `ARGOS_TOKEN`) może tylko wysyłać i czytać buildy, nie może ich zatwierdzać. To sensowny podział uprawnień: CI wysyła dane, decyzję podejmuje człowiek z własnym kontem.
- **Migracja Storycap → natywny Vitest resetuje baseline** — inny schemat nazewnictwa screenshotów sprawia, że Argos widzi stary i nowy zestaw jako całkowicie różne pliki (u nas: 28 added + 28 removed zamiast "changed"), nie płynne przejście.
- Wymagania techniczne natywnej integracji bywają kruche: dopasowanie wersji `@storybook/addon-vitest` do wersji `storybook`, brakujący peer dep `@angular/animations` — nic z tego nie jest oczywiste z samej dokumentacji.

---

## 3. Percy (BrowserStack)

**Jak działa:** Oficjalny Storybook SDK (`percy storybook ./storybook-static`) auto-wykrywa wszystkie story, tak jak Chromatic. Kluczowa różnica: SDK nie robi zrzutu pikselowego lokalnie — przechwytuje **snapshot DOM** (strukturę HTML+CSS) i wysyła go do Percy. Dopiero tam Percy odtwarza ten DOM w wielu przeglądarkach i szerokościach viewportu i wykonuje faktyczny zrzut ekranu.

**Silnik:** DOM-snapshot + server-side rendering w wielu konfiguracjach z **jednego** przechwyconego stanu — nie trzeba wielokrotnie capture'ować lokalnie dla każdej przeglądarki/szerokości, Percy robi to raz, po swojej stronie. Ograniczenie: elementy zależne od runtime przeglądarki (canvas, WebGL, złożone animacje, zewnętrzne iframe) mogą się renderować inaczej niż w oryginale, bo tak naprawdę renderowany jest "zamrożony" DOM, nie żywa strona.

**Storybook:** Natywna, oficjalny pakiet `@percy/storybook`.

**Koszty (2026):** Free — **5 000 screenshotów/mies., unlimited users i projektów**. Powyżej limitu: pay-as-you-go, z rabatami do 80% przy większym wolumenie zakupu.

**Warto wspomnieć zespołowi:** Percy to część ekosystemu BrowserStack — jeśli firma już płaci za BrowserStack (cross-browser/device testing manualny), dołożenie Percy do tego samego konta może być tańsze/prostsze niż osobne narzędzie.

---

## 4. Applitools Eyes

**Jak działa:** `eyes-storybook` (CLI) albo dedykowany addon w samym Storybooku auto-wykrywa wszystkie story — zero kodu testowego, każda story staje się automatycznie "checkpointem wizualnym".

**Silnik:** **Visual AI** — to jedyne z czterech narzędzi, które nie robi klasycznego pixel-diff. Używa computer vision do oceny, czy różnica między dwoma zrzutami jest **wizualnie znacząca** (tak jak oceniłby to człowiek), a nie tylko "czy piksele się różnią". W praktyce oznacza to mniej false positives z antyaliasingu, subpikselowego renderowania fontów czy drobnych przesunięć — i mniej czasu spędzanego na ręcznym odrzucaniu "śmieciowych" różnic.

**Storybook:** Najgłębsza integracja spośród chmurowych narzędzi — oprócz CLI (`eyes-storybook`) mają dedykowany **addon** (`@applitools/eyes-storybook-addon`, wydany w styczniu 2026), który pokazuje wynik testu wizualnego **jako panel wewnątrz samego Storybooka**, obok Docs/A11y. To jedyne z czterech narzędzi (i jedyne z całych 7 porównywanych w POC), które to oferuje — nawet Chromatic tego nie ma w tej formie.

**Koszty (2026):** Free — tylko **50 Test Units/mies.** (najbardziej restrykcyjny darmowy tier z czwórki). Eyes Starter ~**$899/mies.** (rocznie), Autonomous Starter ~$969/mies., Enterprise/Dedicated Cloud (private deployment) — wycena indywidualna. Zdecydowanie najdroższa opcja w całym zestawieniu.

**Warto wspomnieć zespołowi:** To narzędzie stawia na jakość sygnału (mniej false positive, mniej manualnej pracy przy review) kosztem wysokiej ceny — sensowne przy dużej skali (setki story, dziesiątki PR-ów dziennie), przewymiarowane dla małego zespołu/projektu.

---

## Podsumowanie jednym zdaniem na tool

- **Chromatic** — najgłębsza integracja ze Storybookiem + TurboSnap ograniczający koszty, ale nadal pixel-diff.
- **Argos** — generyczny, tani, elastyczny (dowolne źródło screenshotów lub natywny Vitest na Vite-builderze), ale ma subtelną logikę auto-approve i kruchą natywną integrację.
- **Percy** — unikalne podejście DOM-snapshot (multi-browser bez wielokrotnego capture), część ekosystemu BrowserStack.
- **Applitools Eyes** — jedyny z Visual AI zamiast pixel-diff i jedyny z panelem diff wewnątrz Storybooka, ale najdroższy.
