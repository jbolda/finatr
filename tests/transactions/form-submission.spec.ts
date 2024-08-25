import { test, expect, type Page } from '@playwright/test';

import { selectOption } from '../helpers/elements';
import { navigateTo } from '../helpers/navigate';
import { addDefaultAccount, addGenericTransaction } from './helper';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await addDefaultAccount(page);
  await navigateTo(page, 'Planning');
});

test('tab switches to the form', async ({ page }, testInfo) => {
  const addButton = page.getByText('Add Transaction');
  await addButton.click();
  await expect(page.getByText('Add a Transaction')).toBeAttached();
});

test('submits simple transaction', async ({ page }, testInfo) => {
  const addButton = page.getByText('Add Transaction');
  await addButton.click();
  await addGenericTransaction(page);
});

test('check income is listed in income tab after submit', async ({ page }) => {
  await addGenericTransaction(page, {
    value: '55.00',
    extraActions: [selectOption(page, 'Transaction Type', 'Income')]
  });

  await page.getByRole('tab').getByText('Income').click();
  // all transactions should be visible, so just check existence
  await expect(page.locator('table').getByText('55.00')).toBeVisible();
});

test('check expense is listed in expense tab after submit', async ({
  page
}) => {
  await addGenericTransaction(page, {
    value: '67.00',
    extraActions: [selectOption(page, 'Transaction Type', 'Expense')]
  });

  await page.getByRole('tab').getByText('Expenses').click();
  // all transactions should be visible, so just check existence
  await expect(page.locator('table').getByText('67.00')).toBeVisible();
});

test('check transfer is listed in transfer tab after submit', async ({
  page
}) => {
  await addGenericTransaction(page, {
    value: '53',
    extraActions: [selectOption(page, 'Transaction Type', 'Transfer')]
  });

  await page.getByRole('tab').getByText('Transfers').click();
  // all transactions should be visible, so just check existence
  await expect(page.locator('table').getByText('53.00')).toBeVisible();
});
