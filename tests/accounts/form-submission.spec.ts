import { test, expect } from '@playwright/test';
import { navigateTo } from '../helpers/navigate';

test.beforeEach(async ({ page }) => {
  await navigateTo(page, 'Planning');
  await page.getByText('Add Account').click();
});

test('tab switches to the form', async ({ page }) => {
  await expect(page.getByText('Add an Account')).toBeAttached();
});

test('submits simple account', async ({ page }) => {
  await page.getByLabel('name').fill('Test Account Submission');
  await page.keyboard.press('Enter');

  await expect(page.getByText('Test Account Submission')).toBeVisible();
});

test('check debt is listed in debt tab after submit', async ({ page }) => {
  await page.getByLabel('name').fill('Test Debt Account');
  await page.getByLabel('vehicle').selectOption('Loan');
  await page.keyboard.press('Enter');

  await page.getByRole('tab').getByText('Debt').click();
  await expect(page.getByText('Test Debt Account')).toBeVisible();
});
