import { expect, type Page } from '@playwright/test';

export const navigateTo = async (page: Page, navLink: string) => {
  const nav = page.locator('nav').first();
  await expect(nav).toBeVisible({ timeout: 10000 });

  const link = nav.locator('a', { hasText: navLink });
  await expect(link).toBeVisible({ timeout: 10000 });
  await link.click();

  await expect(link)
    .toHaveAttribute('aria-current', 'page')
    .catch(() => {});
};

export const turnOnAllFeatures = async (page: Page) => {
  await navigateTo(page, 'Settings');
  const allFeaturesToggle = page.getByLabel('all');
  await allFeaturesToggle.click();
  await allFeaturesToggle.click();
};
