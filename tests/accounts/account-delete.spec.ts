import { test, expect } from '@playwright/test';

import { navigateTo } from '../helpers/navigate';
import { getRowWith } from '../helpers/tableHelpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('finatr');
    localStorage.removeItem('finatr-meta');
  });
  await navigateTo(page, 'Planning');
  await page.getByText('Add Account').click();

  await page.getByLabel('Starting').first().fill('55');
  await page.getByLabel('name').fill('test account');
  await page.keyboard.press('Enter');

  const row = getRowWith(page, 'accounts', '55.00');
  await expect(row).toBeVisible();
});

test('deletes the recently added account', async ({ page }) => {
  const row = getRowWith(page, 'accounts', '55.00');
  const deleteButton = row.getByRole('button', { name: 'delete' });
  await deleteButton.click();

  await expect(page.getByText('test account')).not.toBeAttached();
});
