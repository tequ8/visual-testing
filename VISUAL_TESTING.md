# Visual Testing POC

This project demonstrates two approaches to visual regression testing for Angular Storybook components.

## Project Structure

```
visual-testing-poc/
├── src/app/components/
│   ├── button/
│   │   ├── button.component.ts      # ButtonComponent (variants: primary, secondary; sizes: sm/md/lg; disabled)
│   │   └── button.stories.ts        # 8 stories
│   ├── input/
│   │   ├── input.component.ts       # InputComponent (states: default, focused, error, disabled)
│   │   └── input.stories.ts         # 5 stories
│   └── card/
│       ├── card.component.ts        # CardComponent (simple, with subtitle, with footer, etc.)
│       └── card.stories.ts          # 5 stories
├── visual-tests/
│   └── storycap.test.ts             # Jest tests comparing storycap screenshots
├── e2e/visual/
│   ├── button.visual.spec.ts        # Playwright visual tests for Button
│   ├── input.visual.spec.ts         # Playwright visual tests for Input
│   └── card.visual.spec.ts          # Playwright visual tests for Card
├── jest.storycap.config.js          # Jest config for storycap approach
├── playwright.config.ts             # Playwright config
└── .storybook/
    ├── main.ts
    └── preview.ts
```

---

## Prerequisites

```bash
cd visual-testing-poc
npm install
```

---

## Running Storybook

```bash
npm run storybook
# Opens at http://localhost:6006
```

---

## Approach 1: Storycap + jest-image-snapshot + Jest

### How it works

1. **Storycap** launches Storybook (or connects to a running instance) and uses Puppeteer/Chromium to capture a screenshot of every story.
2. Screenshots are saved as PNG files in `__screenshots__/` (flat naming: `Components_Button_Primary.png`).
3. **Jest** + **jest-image-snapshot** compares each PNG against a stored baseline in `__screenshots_baseline__/`.
4. If a screenshot differs by more than 2%, the test fails and a diff image is saved to `__screenshots_diff__/`.

### First run (create baselines)

On the very first run, there are no baselines yet. `jest-image-snapshot` writes them automatically — the first run always passes.

```bash
npm run test:visual:storycap
```

After this command completes you will have:
- `__screenshots__/`          — fresh screenshots captured by storycap
- `__screenshots_baseline__/` — baseline images (created by jest-image-snapshot on first run)

### Subsequent runs (detect regressions)

```bash
npm run test:visual:storycap
```

Jest compares the new screenshots against the baselines. Any visual difference above 2% causes a test failure.

### Updating baselines (after intentional UI changes)

```bash
npm run test:visual:storycap:update
```

This re-captures and then runs Jest with `-u` to overwrite all baselines.

### Screenshot file naming

With `--flat`, storycap names files as:

```
<Kind>_<StoryName>.png
```

where `/` in the kind is replaced by `_`. Examples:

| Story                      | File name                               |
|----------------------------|-----------------------------------------|
| Components/Button, Primary | `Components_Button_Primary.png`         |
| Components/Input, Error    | `Components_Input_Error.png`            |
| Components/Card, With Footer | `Components_Card_With Footer.png`     |

---

## Approach 2: Playwright Visual Testing

### How it works

1. Playwright starts Storybook automatically via the `webServer` configuration.
2. Each test navigates to the Storybook **iframe URL** of a specific story.
3. `expect(page).toHaveScreenshot()` captures a screenshot and compares it against a stored PNG baseline.
4. Baselines live in `__snapshots__/`.
5. Diffs are written to `playwright-report/` on failure.

### First run (create baselines)

```bash
npm run test:visual:playwright:update
# or equivalently:
npx playwright test --update-snapshots
```

This creates all baseline PNG files under `__snapshots__/`.

### Subsequent runs (detect regressions)

```bash
npm run test:visual:playwright
```

Playwright starts Storybook, runs all tests, and fails if any screenshot differs.

### Updating baselines (after intentional UI changes)

```bash
npm run test:visual:playwright:update
```

### Story URL pattern

Stories are loaded via the iframe embed URL:

```
http://localhost:6006/iframe.html?id=<story-id>&viewMode=story
```

Story IDs follow the `<title-kebab>--<story-name-kebab>` convention, e.g.:

| Component     | Story       | URL                                                                |
|---------------|-------------|---------------------------------------------------------------------|
| Button        | Primary     | `/iframe.html?id=components-button--primary&viewMode=story`        |
| Input         | Error       | `/iframe.html?id=components-input--error&viewMode=story`           |
| Card          | With Footer | `/iframe.html?id=components-card--with-footer&viewMode=story`      |

### Viewing the HTML report

After a test run (pass or fail):

```bash
npx playwright show-report
```

---

## Comparison of Approaches

| Feature                        | Storycap + Jest                        | Playwright                            |
|-------------------------------|----------------------------------------|---------------------------------------|
| Screenshot engine             | Puppeteer (bundled with storycap)      | Playwright Chromium                   |
| Baseline storage              | `__screenshots_baseline__/`           | `__snapshots__/`                      |
| Diff output                   | `__screenshots_diff__/`               | `playwright-report/`                  |
| Tolerance config              | `failureThreshold` in Jest test        | `maxDiffPixelRatio` in playwright.config |
| Storybook integration         | storycap CLI                           | webServer + iframe URLs               |
| Test framework                | Jest                                   | Playwright Test                       |
| Parallel execution            | storycap is parallel by default        | Playwright workers                    |
| CI readiness                  | Good (headless by default)             | Excellent (built-in CI mode)          |
| Multi-browser                 | Chromium only                          | Chrome, Firefox, Safari               |

---

## Troubleshooting

### Storybook takes too long to start

Increase the `--serverTimeout` in `test:visual:storycap` script or `timeout` in `playwright.config.ts`.

### storycap peer dependency warning

storycap 5.x officially supports Storybook 7/8. This project uses Storybook 10 and installs storycap with `--legacy-peer-deps`. At runtime storycap operates as a headless browser client connecting to any Storybook HTTP server, so it works with Storybook 10 in practice.

### Playwright snapshots differ on CI vs local

Use a consistent OS/browser version. Consider running Playwright inside Docker:

```bash
docker run --rm -it -v "$(pwd)":/work -w /work mcr.microsoft.com/playwright:v1.49.0-jammy npx playwright test
```

### Resetting all baselines

```bash
rm -rf __screenshots_baseline__ __snapshots__
npm run test:visual:storycap:update
npm run test:visual:playwright:update
```
