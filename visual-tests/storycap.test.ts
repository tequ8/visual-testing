/**
 * Storycap + jest-image-snapshot visual regression tests.
 *
 * File naming convention (storycap --flat):
 *   kind + '_' + storyName, with '/' replaced by '_', then sanitized.
 *   Example: kind="Components/Button", story="Primary" → "Components_Button_Primary.png"
 *
 * Workflow:
 *  1. `npm run test:visual:storycap`
 *     → storycap captures PNGs into __screenshots__/
 *     → jest compares them against baselines in __screenshots_baseline__/
 *  2. `npm run test:visual:storycap:update`
 *     → same capture step, then jest -u to overwrite baselines
 *
 * On first run jest-image-snapshot writes the baseline automatically
 * (there is nothing to compare against, so the first run always passes).
 */
import * as fs from 'fs';
import * as path from 'path';
import { configureToMatchImageSnapshot } from 'jest-image-snapshot';

const toMatchImageSnapshot = configureToMatchImageSnapshot({
  customSnapshotsDir: path.resolve(__dirname, '..', '__screenshots_baseline__'),
  customDiffDir: path.resolve(__dirname, '..', '__screenshots_diff__'),
  failureThreshold: 0.02,         // allow 2 % pixel difference
  failureThresholdType: 'percent',
});

expect.extend({ toMatchImageSnapshot });

// ─── helpers ────────────────────────────────────────────────────────────────

const screenshotsDir = path.resolve(__dirname, '..', '__screenshots__');

/**
 * Build the file path that storycap --flat produces.
 * kind:  "Components/Button"
 * story: "Primary"
 * → __screenshots__/Components_Button_Primary.png
 */
function screenshotPath(kind: string, story: string): string {
  const name = (kind + '_' + story).replace(/\//g, '_');
  return path.join(screenshotsDir, `${name}.png`);
}

/** Read a PNG produced by storycap and return its Buffer. */
function readScreenshot(kind: string, story: string): Buffer {
  const fullPath = screenshotPath(kind, story);
  if (!fs.existsSync(fullPath)) {
    throw new Error(
      `Screenshot not found: ${fullPath}\n` +
      `Run "npm run test:visual:storycap" to capture screenshots first.`,
    );
  }
  return fs.readFileSync(fullPath);
}

// ─── Button stories ──────────────────────────────────────────────────────────

describe('Button component screenshots', () => {
  const kind = 'Components/Button';

  const stories = [
    'Primary',
    'Secondary',
    'Disabled',
    'Small Primary',
    'Medium Primary',
    'Large Primary',
    'Small Secondary',
    'Large Secondary',
  ];

  for (const story of stories) {
    it(`matches baseline: ${story}`, () => {
      const image = readScreenshot(kind, story);
      (expect(image) as any).toMatchImageSnapshot({
        customSnapshotIdentifier: `button-${story.toLowerCase().replace(/\s+/g, '-')}`,
      });
    });
  }
});

// ─── Input stories ───────────────────────────────────────────────────────────

describe('Input component screenshots', () => {
  const kind = 'Components/Input';

  const stories = [
    'Default',
    'Focused',
    'With Value',
    'Error',
    'Disabled',
  ];

  for (const story of stories) {
    it(`matches baseline: ${story}`, () => {
      const image = readScreenshot(kind, story);
      (expect(image) as any).toMatchImageSnapshot({
        customSnapshotIdentifier: `input-${story.toLowerCase().replace(/\s+/g, '-')}`,
      });
    });
  }
});

// ─── Card stories ────────────────────────────────────────────────────────────

describe('Card component screenshots', () => {
  const kind = 'Components/Card';

  const stories = [
    'Simple',
    'With Subtitle',
    'With Footer',
    'With Footer Text',
    'Content Only',
  ];

  for (const story of stories) {
    it(`matches baseline: ${story}`, () => {
      const image = readScreenshot(kind, story);
      (expect(image) as any).toMatchImageSnapshot({
        customSnapshotIdentifier: `card-${story.toLowerCase().replace(/\s+/g, '-')}`,
      });
    });
  }
});

// ─── Smoke test ──────────────────────────────────────────────────────────────

describe('Screenshot inventory', () => {
  it('reports all captured PNG files', () => {
    if (!fs.existsSync(screenshotsDir)) {
      console.warn(
        'No __screenshots__/ directory found. ' +
        'Run "npm run test:visual:storycap" to generate screenshots first.',
      );
      return;
    }

    const files = fs
      .readdirSync(screenshotsDir)
      .filter((f) => f.endsWith('.png'));

    console.log(`Captured ${files.length} screenshot(s):`);
    files.forEach((f) => console.log('  ·', f));
  });
});
