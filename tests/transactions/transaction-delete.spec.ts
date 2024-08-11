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
  await page.getByLabel('ending').click();
  await page.getByLabel('start').type('01012025');
  await page.getByLabel('repeat type').selectOption('No Repeating');
  await page.getByLabel('description').fill('test transaction');
  await page.keyboard.press('Enter');
});

test('deletes the recently added transaction', async ({ page }) => {
  const row = getRowWith(page, 'transactions', 'test transaction');
  const deleteButton = row.getByRole('button', { name: 'delete' });
  await deleteButton.click();

  await expect(
    page.getByTestId('transactions-all-transactions')
  ).not.toContainText('test transaction');
});
