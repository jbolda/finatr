import { test, expect } from '@playwright/test';

import { selectDate, selectOption } from '../helpers/elements';
import { navigateTo } from '../helpers/navigate';
import { getRowWith } from '../helpers/tableHelpers';
import { addDefaultAccount } from './helper';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await addDefaultAccount(page);
  await navigateTo(page, 'Planning');
  await page.getByText('Add Transaction').click();

  await page.getByLabel('value').first().fill('55');
  await page.getByLabel('ending').click();
  await selectDate(page, 'start', '01/01/2025');
  await selectOption(page, 'repeat type', 'No Repeating');
  await page.getByLabel('Category').fill('generic');
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
