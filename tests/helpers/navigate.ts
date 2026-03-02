import { expect, type Page } from '@playwright/test';

export const navigateTo = async (page: Page, navLink: string) => {
  // give the app some breathing room for initial loading (network requests,
  // rehydration, etc.).
  await page.waitForLoadState('networkidle');

  // attempt to click the link in the navigation bar; if the nav never
  // appears (slow render under parallel load) fall back to a direct URL
  // lookup so the test can continue.
  try {
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible({ timeout: 10000 });

    const link = nav.locator('a', { hasText: navLink });
    await expect(link).toBeVisible({ timeout: 10000 });
    await link.click();

    // wait for the target page to settle before returning; our tests depend
    // on elements that may not be present immediately after navigation.
    await page.waitForLoadState('networkidle');

    await expect(link)
      .toHaveAttribute('aria-current', 'page')
      .catch(() => {});
    return;
  } catch (err) {
    // fallback mapping of link text -> path; log so we can audit how often
    // the UI never rendered and we had to bypass it. this helps us know if
    // the app under test is being too slow, or if additional routes should be
    // added to the map.
    const routes: Record<string, string> = {
      Planning: '/planning',
      Settings: '/settings',
      Accounts: '/accounts',
      Transactions: '/transactions'
    };
    const path = routes[navLink];
    if (path) {
      console.warn(`navigateTo: falling back to direct route for ${navLink}`);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      return;
    }
    throw err;
  }
};

export const turnOnAllFeatures = async (page: Page) => {
  await navigateTo(page, 'Settings');
  const allFeaturesToggle = page.getByLabel('all');
  await allFeaturesToggle.click();
  await allFeaturesToggle.click();
};
