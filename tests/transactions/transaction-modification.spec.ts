import { test, expect } from '@playwright/test';

import { navigateTo } from '../helpers/navigate';
import { getRowWith } from '../helpers/tableHelpers';
import { addDefaultAccount } from './helper';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await addDefaultAccount(page);
  await navigateTo(page, 'Planning');
  await page.getByText('Add Transaction').click();

  await page.getByLabel('value').fill('55');
  page.getByLabel('type', { exact: true }).selectOption('Income');
  await page.getByLabel('description').fill('test transaction');
  await page.getByLabel('repeat type').selectOption('No Repeating');
  await page.getByLabel('ending').click();
  await page.getByLabel('start').type('01012025');
  await page.keyboard.press('Enter');

  const row = getRowWith(page, 'transactions', 'test transaction');
  const modifyButton = row
    .locator('td', { hasText: 'Modify: ' })
    .getByRole('button', { name: 'M' });
  await modifyButton.click();
});

test('switches back to the form', async ({ page }) => {
  await expect(page.getByText('Add a Transaction')).toBeVisible();
});

test('submits modified transaction', async ({ page }) => {
  await page.getByLabel('value').fill('59');
  await page.keyboard.press('Enter');

  await expect(page.getByText('59.00')).toBeVisible();
});

test('check income is listed in income tab after submit', async ({ page }) => {
  await page.getByLabel('value').fill('57');
  await page.keyboard.press('Enter');

  await page.getByRole('tab').getByText('Income').click();

  await expect(page.getByText('57.00')).toBeVisible();
});
