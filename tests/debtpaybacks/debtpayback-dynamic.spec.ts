import { test, expect } from '@playwright/test';
import { getRowWith } from '../helpers/tableHelpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/planning');
  await page.getByText('Add Account').click();

  await page.getByLabel('name').fill('Test Debt Submission');
  await page.getByLabel('vehicle').selectOption('Loan');
  await page.getByLabel('starting').fill('20000');
  await page.keyboard.press('Enter');

  await page.getByRole('tab').getByText('Debt').click();
});

test.fixme('submits simple debt payback', async ({ page }) => {
  await page.getByText('+').click();

  await page.getByLabel('debt account').selectOption('Test Debt Submission');
  await page.getByLabel('payment account').selectOption('account');
  await page
    .getByLabel('repeat type')
    .selectOption('Repeat on a Day of the Week');
  await page.getByLabel('start').fill('2019-04-28');
  await page.getByText('after Number of Occurrences').click();
  await page.getByLabel('occurrences', { exact: true }).fill('8');
  await page.getByLabel('cycle').fill('1');
  await page.getByText('Dynamic').click();
  await page.getByLabel('reference name').fill('Special Balance');
  await page.getByLabel('reference value').fill('250');
  await page.getByLabel('reference').selectOption('Special Balance');
  await page.keyboard.press('Enter');

  await expect(page.getByText('0')).toBeVisible();
});

test.fixme('validates on non-entered references', async ({ page }) => {
  await page.getByText('+').click();

  await page.getByLabel('debt account').selectOption('Test Debt Submission');
  await page.getByLabel('payment account').selectOption('account');
  await page
    .getByLabel('repeat type')
    .selectOption('Repeat on a Day of the Week');
  await page.getByLabel('start').fill('2019-04-28');
  await page.getByText('after Number of Occurrences').click();
  await page.getByLabel('occurrences', { exact: true }).fill('8');
  await page.getByLabel('cycle').fill('1');
  await page.getByText('Dynamic').click();
  await page.getByLabel('reference name').fill('Special Balance');
  await page.getByLabel('reference value').fill('250');
  await page.keyboard.press('Enter');

  await expect(getRowWith(page, 'accounts', 'reference')).toContainText(
    'Required'
  );
});
