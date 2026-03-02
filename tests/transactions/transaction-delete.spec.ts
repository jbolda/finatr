import { test, expect } from '@playwright/test';

import { selectDate, selectOption } from '../helpers/elements';
import { navigateTo } from '../helpers/navigate';
import { getRowWith } from '../helpers/tableHelpers';
import { addDefaultAccount } from './helper';

test.beforeEach(async ({ page }) => {
  await page.context().addInitScript(() => {
    localStorage.removeItem('finatr');
    localStorage.removeItem('finatr-meta');
  });
  await page.goto('/');
  await addDefaultAccount(page);
  await navigateTo(page, 'Planning');

  await page.getByText('Add Transaction').click();
  // confirms the form is loaded and stable
  await expect(page.getByText('Add a Transaction')).toBeAttached();

  await selectOption(page, 'Account', 'Test Account Submission'); //
  await page.getByLabel('value').first().fill('55'); //
  await page.getByLabel('ending').click();
  await selectDate(page, 'Start Date', {
    //
    month: '01',
    day: '01',
    year: '2024'
  });
  await selectOption(page, 'How Often Does This Occur?', 'No Repeating'); //
  await page.getByLabel('Category').fill('generic'); //
  await page.getByLabel('description').fill('test transaction'); //
  await page.keyboard.press('Enter');

  const row = getRowWith(page, 'transactions', 'test transaction');
  await expect(row).toBeVisible();
});

test('deletes the recently added transaction', async ({ page }) => {
  const row = getRowWith(page, 'transactions', 'test transaction');
  const deleteButton = row.getByRole('button', { name: 'delete' });
  await deleteButton.click();

  await expect(
    page.getByRole('grid', { name: 'Transactions' }).locator('tbody')
  ).not.toContainText('test transaction');
});
