import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/planning');
  await page.getByText('Add Transaction').click();

  await page.getByLabel('value').fill('55');
  await page.getByLabel('repeat type').selectOption('No Repeating');
  await page.getByLabel('description').fill('test transaction');
  await page.keyboard.press('Enter');
});

test('deletes the recently added transaction', async ({ page }) => {
  const row = page
    .locator('div#transactions')
    .locator('table')
    .locator('tr', { hasText: 'test transaction' });
  const deleteButton = row
    .locator('td', { hasText: 'Delete: ' })
    .getByRole('button', { name: 'X' });
  // .getByText('X');
  await deleteButton.click();

  await expect(
    page.getByTestId('transactions-all-transactions')
  ).not.toContainText('test transaction');
});
