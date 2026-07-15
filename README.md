# Visual Testing POC

Proof of concept porównujący dwa podejścia do **automatycznych testów regresji wizualnej** komponentów Angular w środowisku Storybook.

**Stack:** Angular 21 · Storybook 10 · Storycap + jest-image-snapshot · Playwright

---

## Na czym polega problem?

Każda zmiana CSS, upgrade zależności czy refaktor szablonu może niezauważalnie zmienić wygląd komponentu. Code review tego nie wychwytuje — testy jednostkowe sprawdzają *zachowanie*, nie *piksel*.

Testy wizualne robią screenshot każdej story i porównują go z zapisanym baseline. Jeśli cokolwiek się zmieniło — test pada i dostajesz diff image.

---

## Jak to działa — mechanika krok po kroku

### Podejście 1 — Storycap + jest-image-snapshot

```
storycap CLI (Puppeteer)
  → startuje Storybook
  → odczytuje listę wszystkich stories z API Storybooka
  → iteruje po każdej story i robi screenshot
  → zapisuje PNG do __screenshots__/

Jest + jest-image-snapshot
  → odczytuje PNG z __screenshots__/
  → porównuje piksel po pikselu z baselinami z __screenshots_baseline__/
  → jeśli diff > 2% → test pada + zapisuje diff image do __screenshots_diff__/
```

**Faza 1 — Storycap:**

Storycap to narzędzie CLI, które pod spodem używa Puppeteer (headless Chromium). Uruchamiane jest komendą:

```
storycap --serverCmd 'npm run storybook' --serverTimeout 60000 --flat http://localhost:6006
```

Co się dzieje po kolei:
1. Storycap startuje Storybook w tle (`--serverCmd`) i czeka aż będzie dostępny (max 60 s).
2. Łączy się z `http://localhost:6006` i pobiera pełną listę stories z wewnętrznego API Storybooka.
3. Dla każdej story nawiguje Puppeteerem do jej URL i robi screenshot całej strony.
4. Zapisuje PNG do `__screenshots__/` z płaskim nazewnictwem (`--flat`): `KindName_StoryName.png`, np. `Components_Button_Primary.png` (slashe w kind zastąpione podkreślnikiem).

**Faza 2 — Jest + jest-image-snapshot:**

Po zrobieniu screenshotów odpala się Jest z konfiguracją `jest.storycap.config.js`. Plik `visual-tests/storycap.test.ts` wykonuje następujące kroki dla każdej story:
1. Odczytuje PNG z `__screenshots__/` jako `Buffer`.
2. Wywołuje `expect(image).toMatchImageSnapshot()` z biblioteki `jest-image-snapshot`.
3. Biblioteka porównuje obraz piksel po pikselu z baselineem z `__screenshots_baseline__/`.
4. Jeśli różnica przekroczy 2% (`failureThreshold: 0.02`) — test pada i zapisuje wizualny diff do `__screenshots_diff__/`.

**Pierwsze uruchomienie:** jeśli baseline nie istnieje, `jest-image-snapshot` automatycznie zapisuje aktualny screenshot jako baseline i test przechodzi. Dopiero kolejne uruchomienia wykrywają regresje.

---

### Podejście 2 — Playwright Visual Testing

```
playwright test
  → webServer startuje Storybook (jeśli nie działa)
  → każdy test nawiguje do iframe URL konkretnej story
  → czeka na wyrenderowanie komponentu Angular
  → wywołuje toHaveScreenshot() → porównuje z __snapshots__/
  → przy różnicy > 1% → test pada + diff w playwright-report/
```

**Automatyczny start Storybooka:**

W `playwright.config.ts` zdefiniowany jest blok `webServer`:

```ts
webServer: {
  command: 'npm run storybook',
  url: 'http://localhost:6006',
  reuseExistingServer: !process.env['CI'],
  timeout: 120_000,
}
```

Playwright sam startuje Storybook przed suite testów i zatrzymuje go po zakończeniu. Jeśli Storybook już działa lokalnie — ponownie używa istniejącego procesu (`reuseExistingServer: true`). Na CI zawsze startuje świeżą instancję.

**Struktura testu:**

Każdy test w `e2e/visual/*.visual.spec.ts` wykonuje te kroki:

```ts
await page.goto(`/iframe.html?id=components-button--primary&viewMode=story`);
await page.waitForLoadState('domcontentloaded');
await page.waitForSelector('app-button', { state: 'visible', timeout: 15000 });
await page.waitForTimeout(300);  // czas na fonty i CSS transitions
await expect(page).toHaveScreenshot('button-primary.png');
```

1. Playwright nawiguje bezpośrednio do iframe embed Storybooka (`/iframe.html?id=...`) — omija cały UI Storybooka i renderuje tylko sam komponent.
2. Czeka aż DOM się załaduje, a Angular wyrenderuje komponent (selektor `app-button` / `app-input` / `app-card`).
3. Odczeka 300 ms — czas na zakończenie animacji CSS i załadowanie fontów.
4. `toHaveScreenshot()` robi screenshot i porównuje z baselineem z `__snapshots__/`.

**Progi tolerancji** skonfigurowane w `playwright.config.ts`:
- `maxDiffPixelRatio: 0.01` — maksymalnie 1% pikseli może się różnić
- `threshold: 0.1` — próg koloru: piksel "różni się" jeśli odległość barw > 10%

**Przechowywanie snapshotów:**

Snapshoty lądują w `__snapshots__/` według szablonu:
```
__snapshots__/e2e/visual/button.visual.spec.ts/button-primary.png
```

**Raport po failurze** (`npx playwright show-report`) pokazuje HTML z widokiem side-by-side: baseline vs aktualny screenshot vs diff z zaznaczonymi zmianami.

**Pierwsze uruchomienie** wymaga jawnego `--update-snapshots` żeby stworzyć baseline — inaczej test pada z komunikatem "missing snapshot". Jest to celowe zachowanie odwrotne od Storycapa.

---

## Podejścia — skrócony przegląd

```
Storycap (Puppeteer) → __screenshots__/ → Jest → porównanie z __screenshots_baseline__/
```

```
Playwright → iframe Storybooka → toHaveScreenshot() → porównanie z __snapshots__/
```

---

## Komponenty testowe

| Komponent | Stories | Testowane stany |
|-----------|---------|-----------------|
| `ButtonComponent` | 8 | primary, secondary, disabled; rozmiary sm/md/lg |
| `InputComponent` | 5 | default, focused, error, disabled, z wartością |
| `CardComponent` | 5 | simple, with subtitle, with footer, content only |

---

## Instalacja

```bash
npm install
```

Playwright wymaga przeglądarek:

```bash
npx playwright install chromium
```

---

## Uruchamianie testów

### Storycap

```bash
# Pierwsze uruchomienie — tworzy baseline (zawsze przechodzi)
npm run test:visual:storycap

# Kolejne uruchomienia — wykrywa regresje
npm run test:visual:storycap

# Po celowej zmianie UI — aktualizuje baseline
npm run test:visual:storycap:update
```

### Playwright

```bash
# Pierwsze uruchomienie — tworzy baseline
npm run test:visual:playwright:update

# Kolejne uruchomienia — wykrywa regresje
npm run test:visual:playwright

# Po celowej zmianie UI — aktualizuje baseline
npm run test:visual:playwright:update

# Raport HTML z diffami
npx playwright show-report
```

### Storybook (lokalnie)

```bash
npm run storybook
# http://localhost:6006
```

---

## Struktura projektu

```
├── src/app/components/
│   ├── button/          # ButtonComponent + stories
│   ├── input/           # InputComponent + stories
│   └── card/            # CardComponent + stories
│
├── e2e/visual/          # Testy Playwright
│   ├── button.visual.spec.ts
│   ├── input.visual.spec.ts
│   └── card.visual.spec.ts
│
├── visual-tests/
│   └── storycap.test.ts # Testy Jest porównujące screenshoty Storycapa
│
├── __snapshots__/       # Baseline PNG — Playwright (commitowane do repo)
├── __screenshots__/     # Screenshoty robione przez Storycap (ignorowane przez git)
├── __screenshots_baseline__/  # Baseline PNG — Storycap (tworzone lokalnie)
│
├── playwright.config.ts
├── jest.storycap.config.js
└── presentation.html    # Prezentacja reveal.js z wynikami spike'a
```

---

## Porównanie podejść

| | Storycap + Jest | Playwright |
|---|---|---|
| Silnik screenshotów | Puppeteer (Chromium) | Playwright Chromium |
| Integracja ze Storybookiem | storycap CLI | webServer + iframe URL |
| Przechowywanie baseline | `__screenshots_baseline__/` | `__snapshots__/` |
| Diff output | `__screenshots_diff__/` | `playwright-report/` |
| Tolerancja | `failureThreshold` w teście | `maxDiffPixelRatio` w konfiguracji |
| Wiele przeglądarek | tylko Chromium | Chromium, Firefox, Safari |
| CI readiness | dobry | doskonały (wbudowany tryb CI) |
| Raport HTML | brak | `npx playwright show-report` |

---

## URL stories (Playwright)

Story otwierane są przez iframe embed:

```
http://localhost:6006/iframe.html?id=<story-id>&viewMode=story
```

ID story: `<title-kebab>--<story-name-kebab>`, np.:

| Komponent | Story | ID |
|-----------|-------|----|
| Button | Primary | `components-button--primary` |
| Input | Error | `components-input--error` |
| Card | With Footer | `components-card--with-footer` |

---

## Lost Pixel

[Lost Pixel](https://lost-pixel.com) to open-source'owa alternatywa dla Chromatic — w trybie OSS (użytym w tym projekcie) działa **w pełni lokalnie i za darmo**, bez limitu snapshotów i bez wysyłania niczego do chmury. Podobnie jak Chromatic ma **auto-discovery stories**: nie potrzebuje osobnego narzędzia do robienia screenshotów (jak Argos), tylko czyta zbudowany Storybook bezpośrednio.

```
build-storybook  → statyczny build do storybook-static/
lost-pixel       → czyta storybook-static, auto-wykrywa wszystkie stories
  → renderuje każdą story w headless Playwright
  → porównuje z lokalnym baselinem w .lostpixel/baseline/
  → PASS/FAIL + diff PNG w .lostpixel/difference/ (jeśli są różnice)
```

### Uruchomienie

```bash
# Pierwsze uruchomienie — tworzy baseline
npm run test:visual:lostpixel:update

# Kolejne uruchomienia — wykrywa regresje
npm run test:visual:lostpixel
```

### Wynik POC

28 / 28 stories ✅, 0 różnic — baseline w `.lostpixel/baseline/`, uruchomione w pełni lokalnie (bez tokenu, bez konta).

Konfiguracja w `lostpixel.config.ts` — projekt używa trybu OSS (`storybookShots`). Plik zawiera też (zakomentowaną) konfigurację trybu **Lost Pixel Platform** — płatnego, hostowanego review UI, na wypadek gdyby zespół chciał później przejść na cloud review bez zmiany testów.

---

## Argos CI

[Argos](https://argos-ci.com) to chmurowa platforma do review zmian wizualnych, podobna w duchu do Chromatica — ale w przeciwieństwie do niego **nie renderuje Storybooka samodzielnie**. Argos jest generycznym narzędziem do uploadu i porównywania screenshotów, więc wymaga osobnego kroku, który je wygeneruje. W tym projekcie do tego celu ponownie wykorzystywany jest Storycap (Podejście 1).

```
storycap  → generuje PNG do __screenshots__/
argos upload __screenshots__ → wysyła screenshoty do Argos
  → Argos porównuje z poprzednim zaakceptowanym buildem
  → reviewer zatwierdza/odrzuca zmiany w UI Argos
```

### Uruchomienie

Wymaga konta na [argos-ci.com](https://argos-ci.com) i tokenu repozytorium:

```bash
export ARGOS_TOKEN=<repository token>
npm run test:visual:argos
```

### Różnice względem Chromatic

| | Chromatic | Argos |
|---|---|---|
| Renderowanie stories | W chmurze (auto-discovery) | Lokalnie, dowolnym narzędziem (tu: Storycap) |
| Zero-config | Tak | Nie — wymaga kroku capture |
| Review UI / PR check | Tak | Tak |
| Zarządzanie flaky testami | — | `argos change` (ignore/unignore) |
| Równoległe buildy (sharding CI) | Tak | Tak (`--parallel`) |

---

## CI / Docker

Playwright snapshoty mogą różnić się między systemami operacyjnymi (renderowanie fontów). Żeby uniknąć fałszywych failów na CI, można uruchamiać testy w oficjalnym obrazie Playwright:

```bash
docker run --rm -it \
  -v "$(pwd)":/work -w /work \
  mcr.microsoft.com/playwright:v1.60.0-jammy \
  npx playwright test
```

---

## Resetowanie baseline

```bash
# Playwright
rm -rf __snapshots__
npm run test:visual:playwright:update

# Storycap
rm -rf __screenshots_baseline__ __screenshots_diff__
npm run test:visual:storycap
```
