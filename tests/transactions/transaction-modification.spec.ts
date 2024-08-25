import { test, expect } from '@playwright/test';

import { navigateTo } from '../helpers/navigate';
import { getRowWith } from '../helpers/tableHelpers';
import { addDefaultAccount, addGenericTransaction } from './helper';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await addDefaultAccount(page);
  await navigateTo(page, 'Planning');
  await addGenericTransaction(page, { value: '55', extraActions: [] });

  const row = getRowWith(page, 'transactions', 'test transaction');
  const modifyButton = row.getByRole('button', { name: 'modify' });
  await modifyButton.click();
});

test('switches back to the form', async ({ page }) => {
  await expect(page.getByText('Add a Transaction')).toBeVisible();
});

test('submits modified transaction', async ({ page }) => {
  await page.getByLabel('value').first().fill('59');
  await page.keyboard.press('Enter');

  await expect(page.getByText('59.00').first()).toBeVisible();
});

test('check income is listed in income tab after submit', async ({ page }) => {
  await page.getByLabel('value').first().fill('57');
  await page.keyboard.press('Enter');

  await page.getByRole('tab').getByText('Income').click();

  await expect(page.getByText('57.00').first()).toBeVisible();
});
