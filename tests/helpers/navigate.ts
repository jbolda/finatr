import { expect, type Page } from '@playwright/test';

export const navigateTo = async (page: Page, navLink: string) => {
  await page.goto('/');
  const gettingStartedButton = page.locator('a', { hasText: 'Get started' });
  // makes certain the home page is loaded and the server is started up
  await expect(gettingStartedButton).toBeVisible();
  await page.locator('nav').first().locator('a', { hasText: navLink }).click();
};

export const turnOnAllFeatures = async (page: Page) => {
  await page.goto('/settings');
  const allFeaturesToggle = page.getByLabel('all');
  await allFeaturesToggle.click();
  await allFeaturesToggle.click();
};
