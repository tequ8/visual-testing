import { test, expect, Page } from '@playwright/test';

/** Navigate to a story iframe and wait for it to be ready. */
async function gotoStory(page: Page, storyId: string): Promise<void> {
  await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('app-input', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(300);
}

test.describe('Input – visual regression', () => {
  test.use({ viewport: { width: 450, height: 200 } });

  test('Default state', async ({ page }) => {
    await gotoStory(page, 'components-input--default');
    await expect(page).toHaveScreenshot('input-default.png');
  });

  test('Focused state', async ({ page }) => {
    await gotoStory(page, 'components-input--focused');
    await expect(page).toHaveScreenshot('input-focused.png');
  });

  test('With value', async ({ page }) => {
    await gotoStory(page, 'components-input--with-value');
    await expect(page).toHaveScreenshot('input-with-value.png');
  });

  test('Error state', async ({ page }) => {
    await gotoStory(page, 'components-input--error');
    // Error story has a taller layout (label + input + error message)
    await expect(page).toHaveScreenshot('input-error.png');
  });

  test('Disabled state', async ({ page }) => {
    await gotoStory(page, 'components-input--disabled');
    await expect(page).toHaveScreenshot('input-disabled.png');
  });
});
