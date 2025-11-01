import { test, expect } from '@playwright/test';

import { navigateTo } from '../helpers/navigate';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
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
  await page.getByLabel('vehicle').click();
  await page.getByRole('option', { name: 'Loan' }).click();
  await page.getByLabel('starting').first().fill('33');
  await page.getByLabel('interest').first().fill('8.25');
  await page.getByRole('button', { name: 'Add Account' }).click();

  await page.getByLabel('Debt', { exact: true }).click();
  await expect(page.getByText('Test Debt Account')).toBeVisible();
  await expect(page.getByText('33.00').first()).toBeVisible();
  await expect(
    page.getByRole('gridcell').filter({ hasText: '8.25%' })
  ).toBeVisible();
});
