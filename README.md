# Visual Testing POC

Proof of concept porównujący dwa podejścia do **automatycznych testów regresji wizualnej** komponentów Angular w środowisku Storybook.

**Stack:** Angular 21 · Storybook 10 · Storycap + jest-image-snapshot · Playwright

---

## Na czym polega problem?

Każda zmiana CSS, upgrade zależności czy refaktor szablonu może niezauważalnie zmienić wygląd komponentu. Code review tego nie wychwytuje — testy jednostkowe sprawdzają *zachowanie*, nie *piksel*.

Testy wizualne robią screenshot każdej story i porównują go z zapisanym baseline. Jeśli cokolwiek się zmieniło — test pada i dostajesz diff image.

---

## Podejścia

### Podejście 1 — Storycap + jest-image-snapshot

```
Storycap (Puppeteer) → __screenshots__/ → Jest → porównanie z __screenshots_baseline__/
```

Storycap uruchamia Storybook, robi screenshot każdej story i zapisuje PNG. Jest + jest-image-snapshot porównuje je piksel po pikselu z baselinami. Tolerancja: 2% zmienionych pikseli.

### Podejście 2 — Playwright Visual Testing

```
Playwright → iframe Storybooka → toHaveScreenshot() → porównanie z __snapshots__/
```

Playwright nawiguje bezpośrednio do iframe URL każdej story i używa wbudowanego `toHaveScreenshot()`. Storybook startuje automatycznie przez `webServer` w konfiguracji Playwrighta.

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
