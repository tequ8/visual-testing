import { test, expect, Page } from '@playwright/test';

/** Navigate to a story iframe and wait for it to be ready. */
async function gotoStory(page: Page, storyId: string): Promise<void> {
  await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('app-card', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(300);
}

test.describe('Card – visual regression', () => {
  test.use({ viewport: { width: 480, height: 350 } });

  test('Simple card', async ({ page }) => {
    await gotoStory(page, 'components-card--simple');
    await expect(page).toHaveScreenshot('card-simple.png');
  });

  test('Card with subtitle', async ({ page }) => {
    await gotoStory(page, 'components-card--with-subtitle');
    await expect(page).toHaveScreenshot('card-with-subtitle.png');
  });

  test('Card with footer', async ({ page }) => {
    await gotoStory(page, 'components-card--with-footer');
    await expect(page).toHaveScreenshot('card-with-footer.png');
  });

  test('Card with footer text', async ({ page }) => {
    await gotoStory(page, 'components-card--with-footer-text');
    await expect(page).toHaveScreenshot('card-with-footer-text.png');
  });

  test('Content only card', async ({ page }) => {
    await gotoStory(page, 'components-card--content-only');
    await expect(page).toHaveScreenshot('card-content-only.png');
  });
});
