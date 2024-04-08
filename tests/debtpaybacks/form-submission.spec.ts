import { test, expect } from '@playwright/test';

import { navigateTo } from '../helpers/navigate';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await navigateTo(page, 'Planning');
  await page.getByText('Add Account').click();

  await page.getByLabel('name').fill('Test Debt Submission');
  await page.getByLabel('vehicle').selectOption('Loan');
  await page.getByLabel('starting').fill('20000');
  await page.keyboard.press('Enter');

  await page.getByRole('tab').getByText('Debt').click();
});

test.fixme('tab switches to the form', async ({ page }) => {
  await page.getByText('+').click();
  await expect(page.getByText('Add Debt Payback')).toBeVisible();
});

test.fixme('submits simple debt payback', async ({ page }) => {
  await page.getByText('+').click();

  await page.getByLabel('debt account').selectOption('Test Debt Submission');
  await page.getByLabel('payment account').selectOption('account');
  await page
    .getByLabel('repeat type')
    .selectOption('Repeat on a Day of the Week');
  await page.getByLabel('value').fill('250');
  await page.getByLabel('start').fill('2019-04-28');
  await page.getByText('after Number of Occurrences').click();
  await page.getByLabel('occurrences', { exact: true }).fill('8');
  await page.getByLabel('cycle').fill('1');
  await page.keyboard.press('Enter');

  await page.getByRole('tab').getByText('Debt').click();
  await expect(page.getByText('250')).toBeVisible();
});
