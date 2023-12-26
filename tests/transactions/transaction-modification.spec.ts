import { test, expect } from '@playwright/test';
import { getRowWith } from '../helpers/tableHelpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/planning');
  await page.getByText('Add Transaction').click();

  await page.getByLabel('value').fill('55');
  await page.getByLabel('repeat type').selectOption('No Repeating');
  await page.getByLabel('description').fill('test transaction');
  await page.keyboard.press('Enter');

  const row = getRowWith(page, 'transactions', 'test transaction');
  const modifyButton = row
    .locator('td', { hasText: 'Modify: ' })
    .getByRole('button', { name: 'M' });
  await modifyButton.click();
});

test('switches back to the form', async ({ page }) => {
  await expect(
    page
      .getByTestId('transactions-add-transaction')
      .getByText('Add a Transaction')
  ).toBeVisible();
});

test('submits modified transaction', async ({ page }) => {
  await page.getByLabel('value').fill('59');
  await page.keyboard.press('Enter');

  await expect(
    page.getByTestId('transactions-all-transactions').getByText('59.00')
  ).toBeVisible();
});

test('check income is listed in income tab after submit', async ({ page }) => {
  await page.getByLabel('value').fill('57');
  await page.keyboard.press('Enter');

  await page.getByRole('tab').getByText('Income').click();

  await expect(
    page.getByTestId('transactions-income').getByText('57.00')
  ).toBeVisible();
});
