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
  await page.getByText('+').click();

  await page.getByLabel('debt account').selectOption('Test Debt Submission');
  await page.getByLabel('payment account').selectOption('account');
  await page.getByLabel('repeat type').selectOption('No Repeating');
  await page.getByLabel('value').fill('55');
  await page.getByLabel('start').fill('2019-05-28');
  await page.getByText('after Number of Occurrences').click();
  await page.getByLabel('occurrences', { exact: true }).fill('8');
  await page.getByLabel('cycle').fill('1');
  await page.keyboard.press('Enter');
});

test.fixme('deletes the recently added debt payback', async ({ page }) => {
  const row = getRowWith(page, 'accounts', '2019-05-28');
  const deleteButton = row
    .locator('td', { hasText: 'Delete: ' })
    .getByRole('button', { name: 'X' });
  await deleteButton.click();

  await expect(page.getByText('2019-05-28')).not.toBeAttached();
});
