import { type Page } from '@playwright/test';

export const navigateTo = async (page: Page, navLink: string) => {
  await page.locator('nav').first().locator('a', { hasText: navLink }).click();
};

export const turnOnAllFeatures = async (page: Page) => {
  await navigateTo(page, 'Settings');
  const allFeaturesToggle = page.getByLabel('all');
  await allFeaturesToggle.click();
  await allFeaturesToggle.click();
};
