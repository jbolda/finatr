import { test, expect } from '@playwright/test';

import { navigateTo } from '../helpers/navigate';
import { getRowWith } from '../helpers/tableHelpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await navigateTo(page, 'Planning');
  await page.getByText('Add Account').click();

  await page.getByLabel('starting').first().fill('550');
  await page.getByLabel('name').fill('test account');
  await page.keyboard.press('Enter');

  const row = getRowWith(page, 'accounts', 'test account');
  const modifyButton = row.getByRole('button', { name: 'modify' });
  await modifyButton.click();
});

test('switches back to the form', async ({ page }) => {
  await expect(page.getByText('Add an Account')).toBeVisible();
});

test('submits modified account', async ({ page }) => {
  await page.getByLabel('starting').first().fill('5996');
  await page.keyboard.press('Enter');

  await expect(page.getByText('5996.00')).toBeVisible();
});

test('check debt is listed in debt tab after submit', async ({ page }) => {
  await page.getByLabel('starting').first().fill('577');
  await page.getByLabel('vehicle').click();
  await page.getByRole('option', { name: 'Loan' }).click();
  await page.getByRole('button', { name: 'Add Account' }).click();

  await page.getByRole('tab').getByText('Debt').click();
  await expect(page.getByText('test account')).toBeVisible();
  await expect(page.getByRole('gridcell', { name: '$577.00' })).toBeVisible();
});
