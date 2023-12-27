import { test, expect } from '@playwright/test';
import { getRowWith } from '../helpers/tableHelpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/planning');
  await page.getByText('Add Account').click();

  await page.getByLabel('starting').fill('550');
  await page.getByLabel('name').fill('test account');
  await page.keyboard.press('Enter');

  const row = getRowWith(page, 'accounts', 'test account');
  const modifyButton = row
    .locator('td', { hasText: 'Modify: ' })
    .getByRole('button', { name: 'M' });
  await modifyButton.click();
});

test('switches back to the form', async ({ page }) => {
  await expect(page.getByText('Add an Account')).toBeVisible();
});

test('submits modified account', async ({ page }) => {
  await page.getByLabel('starting').fill('5996');
  await page.keyboard.press('Enter');

  await expect(page.getByText('5996.00')).toBeVisible();
});

test('check debt is listed in debt tab after submit', async ({ page }) => {
  await page.getByLabel('starting').fill('577');
  await page.getByLabel('vehicle').selectOption('Loan');
  await page.keyboard.press('Enter');

  await page.getByRole('tab').getByText('Debt').click();
  await expect(page.getByText('test account')).toBeVisible();
  await expect(page.getByText('577.00')).toBeVisible();
});
