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

---

## Approach: Lost Pixel

[Lost Pixel](https://lost-pixel.com) is an open-source alternative to Chromatic. In OSS mode (used here) it runs **entirely locally and for free**, with no snapshot limits and nothing sent to a cloud service. Like Chromatic — and unlike Argos — it has **auto-discovery of stories**: it doesn't need a separate capture tool, it reads the built Storybook directly.

### How it works

1. `npm run build-storybook` produces a static build in `storybook-static/`.
2. `lost-pixel` reads `storybook-static/`, auto-discovers every story (no test code to write).
3. Each story is rendered headlessly via Playwright and screenshotted.
4. The screenshot is compared against the local baseline in `.lostpixel/baseline/`.
5. Any differences are written to `.lostpixel/difference/` and the run exits non-zero.

### Running it

```bash
# First run — creates baselines
npm run test:visual:lostpixel:update

# Subsequent runs — detects regressions
npm run test:visual:lostpixel
```

No account or token needed for OSS mode.

### POC result

28/28 stories passing, 0 differences — baseline committed under `.lostpixel/baseline/`.

`lostpixel.config.ts` configures OSS mode (`storybookShots`). It also has a commented-out block for **Lost Pixel Platform**, the paid hosted-review-UI mode — switching to it later wouldn't require rewriting any tests.

---

## Approach: Argos CI

[Argos](https://argos-ci.com) is a cloud-based visual review platform, similar in spirit to Chromatic. The key difference: Argos does **not** render Storybook itself — it's a generic screenshot upload/diff/review service, so it needs a separate capture step to produce the images. This project reuses Storycap (see Approach 1) for that.

### How it works

1. `storycap` captures every story into `__screenshots__/` (same mechanism as Approach 1).
2. `argos upload __screenshots__` sends the images to Argos.
3. Argos diffs them against the previous accepted build for the branch and posts a PR check.
4. A reviewer approves/denies changes in the Argos web UI (or via `argos review` / `argos comment` from the CLI).

### Running it

Requires an account at [argos-ci.com](https://argos-ci.com) and a repository token:

```bash
export ARGOS_TOKEN=<repository token>
npm run test:visual:argos
```

There is no `:update` variant — like Chromatic, baseline approval happens by accepting the build in the Argos UI, not by overwriting local files.

### Notable CLI capabilities

- `--parallel` / `--parallel-total` / `--parallel-index` — combine sharded CI runs into one build.
- `--threshold` — tune diff sensitivity per upload.
- `argos change` — mark a changed screenshot as flaky so it stops failing builds.
- `argos analytics` — build/screenshot usage analytics for an account.
