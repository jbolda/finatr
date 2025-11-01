import { test, expect } from '@playwright/test';

import { navigateTo } from '../helpers/navigate';
import { addDefaultAccount, addGenericTransaction, selectOnly } from './helper';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await addDefaultAccount(page);
  await navigateTo(page, 'Planning');
});

test('tab switches to the form', async ({ page }) => {
  const addButton = page.getByText('Add Transaction');
  await addButton.click();
  await expect(page.getByText('Add a Transaction')).toBeAttached();
});

test('submits simple transaction', async ({ page }) => {
  await addGenericTransaction(page);
});

test('check income is listed in income tab after submit', async ({ page }) => {
  await addGenericTransaction(page, {
    value: '55.00',
    extraActions: [{ fn: 'selectOption', args: ['Transaction Type', 'Income'] }]
  });

  await selectOnly(page, 'Income');
  // all transactions should be visible, so just check existence
  await expect(page.locator('table').getByText('55.00')).toBeVisible();
});

test('check expense is listed in expense tab after submit', async ({
  page
}) => {
  await addGenericTransaction(page, {
    value: '67.00',
    extraActions: [
      { fn: 'selectOption', args: ['Transaction Type', 'Expense'] }
    ]
  });

  await selectOnly(page, 'Expenses');
  // all transactions should be visible, so just check existence
  await expect(page.locator('table').getByText('67.00')).toBeVisible();
});

test('check transfer is listed in transfer tab after submit', async ({
  page
}) => {
  await addGenericTransaction(page, {
    value: '53',
    extraActions: [
      { fn: 'selectOption', args: ['Transaction Type', 'Transfer'] }
    ]
  });

  await selectOnly(page, 'Transfers');
  // all transactions should be visible, so just check existence
  await expect(page.locator('table').getByText('53.00')).toBeVisible();
});
