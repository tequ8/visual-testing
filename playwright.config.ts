import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for visual regression testing of Storybook stories.
 *
 * Storybook is started automatically by the `webServer` block below.
 * If Storybook is already running, Playwright skips the launch (reuseExistingServer: true).
 *
 * Snapshots are stored alongside each test file in __snapshots__ directories
 * (Playwright default behaviour when snapshotDir is not overridden).
 */
export default defineConfig({
  // Directory that contains all Playwright tests
  testDir: './e2e',

  // Retry once on CI to smooth over flakiness
  retries: process.env['CI'] ? 1 : 0,

  // Run tests in parallel
  workers: process.env['CI'] ? 2 : undefined,

  // Base URL — used by `page.goto('/')` and story URLs
  use: {
    baseURL: 'http://localhost:6006',

    // Capture a screenshot on failure
    screenshot: 'only-on-failure',

    // Trace on first retry
    trace: 'on-first-retry',

    // Viewport for consistent screenshots
    viewport: { width: 1280, height: 720 },

    // Screenshot comparison threshold (0 = exact, 1 = ignore all)
    // 0.1 means a pixel must differ by more than 10 % to count
  },

  // Visual snapshot settings
  expect: {
    // Percentage of pixels allowed to differ before a snapshot test fails
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,   // 1 % of total pixels
      threshold: 0.1,            // per-pixel color distance tolerance
    },
  },

  // Store all snapshots in a top-level __snapshots__ folder
  snapshotDir: '__snapshots__',

  // Use a unique path template so stories from different files don't collide
  snapshotPathTemplate: '{snapshotDir}/{testFilePath}/{arg}{ext}',

  // Browsers to run visual tests against
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to add more browsers:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit',  use: { ...devices['Desktop Safari'] } },
  ],

  // Reporter
  reporter: [['html', { open: 'never' }], ['list']],

  // Auto-start Storybook before running tests
  webServer: {
    // `ng run visual-testing-poc:storybook` is what package.json "storybook" script calls
    command: 'npm run storybook',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env['CI'],
    timeout: 120 * 1000,
    // Suppress Storybook output unless there's an error
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
