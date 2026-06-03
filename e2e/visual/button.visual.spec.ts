import { test, expect, Page } from '@playwright/test';

/**
 * Visual regression tests for ButtonComponent stories.
 *
 * Each test navigates to the Storybook iframe URL for a specific story,
 * waits for the component to stabilise and then compares a screenshot
 * against a stored baseline.
 *
 * URL pattern: http://localhost:6006/iframe.html?id=<story-id>&viewMode=story
 *
 * Story IDs follow the convention: <title-kebab>--<story-name-kebab>
 *   e.g. "Components/Button" + story "Primary" → "components-button--primary"
 */

/** Navigate to a story iframe and wait for it to be ready. */
async function gotoStory(page: Page, storyId: string): Promise<void> {
  await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
  await page.waitForLoadState('domcontentloaded');
  // Wait for the Angular component to render in the DOM
  await page.waitForSelector('app-button', { state: 'visible', timeout: 15000 });
  // Settle time for CSS transitions / fonts
  await page.waitForTimeout(300);
}

test.describe('Button – visual regression', () => {
  test.use({ viewport: { width: 400, height: 200 } });

  test('Primary button', async ({ page }) => {
    await gotoStory(page, 'components-button--primary');
    await expect(page).toHaveScreenshot('button-primary.png');
  });

  test('Secondary button', async ({ page }) => {
    await gotoStory(page, 'components-button--secondary');
    await expect(page).toHaveScreenshot('button-secondary.png');
  });

  test('Disabled button', async ({ page }) => {
    await gotoStory(page, 'components-button--disabled');
    await expect(page).toHaveScreenshot('button-disabled.png');
  });

  test('Small Primary button', async ({ page }) => {
    await gotoStory(page, 'components-button--small-primary');
    await expect(page).toHaveScreenshot('button-small-primary.png');
  });

  test('Medium Primary button', async ({ page }) => {
    await gotoStory(page, 'components-button--medium-primary');
    await expect(page).toHaveScreenshot('button-medium-primary.png');
  });

  test('Large Primary button', async ({ page }) => {
    await gotoStory(page, 'components-button--large-primary');
    await expect(page).toHaveScreenshot('button-large-primary.png');
  });

  test('Small Secondary button', async ({ page }) => {
    await gotoStory(page, 'components-button--small-secondary');
    await expect(page).toHaveScreenshot('button-small-secondary.png');
  });

  test('Large Secondary button', async ({ page }) => {
    await gotoStory(page, 'components-button--large-secondary');
    await expect(page).toHaveScreenshot('button-large-secondary.png');
  });
});
