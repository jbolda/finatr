import { test, expect, type Page, type Locator } from '@playwright/test';

import { navigateTo } from '../helpers/navigate';

export const addDefaultAccount = async (page: Page) => {
  await test.step('Add default account', async () => {
    await navigateTo(page, 'Planning');
    await page.getByText('Add Account').click();
    await page.getByLabel('name').fill('Test Account Submission');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Test Account Submission')).toBeVisible();
  });
};
