import { test, expect, type Page } from '@playwright/test';

const addGenericTransaction = async (
  page: Page,
  { value, extraActions }: { value: string; extraActions: Promise<any>[] } = {
    value: '55',
    extraActions: []
  }
) => {
  await page.getByLabel('value').fill(value);
  await page.getByLabel('repeat type').selectOption('No Repeating');
  await page.keyboard.press('Enter');
  if (extraActions) {
    for (let pageAction of extraActions) {
      await pageAction;
    }
  }
  expect(page.getByText(value)).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await page.goto('/planning');
  await page.getByText('Add Transaction').click();
});

test('tab switches to the form', async ({ page }) => {
  const addButton = page.getByRole('tab').getByText('Add Transaction');
  await addButton.click();
  expect(addButton).toBeAttached();
});

test('submits simple transaction', async ({ page }) => {
  await addGenericTransaction(page);
});

test('check income is listed in income tab after submit', async ({ page }) => {
  await addGenericTransaction(page);

  await page.getByRole('tab').getByText('Income').click();
  // all transactions should be visible, so just check existence
  expect(page.getByText('55.00')).toBeVisible();
});

test('check expense is listed in expense tab after submit', async ({
  page
}) => {
  await addGenericTransaction(page, {
    value: '67',
    extraActions: [
      page.getByLabel('type', { exact: true }).selectOption('Expense')
    ]
  });

  await page.getByRole('tab').getByText('Expenses').click();
  // all transactions should be visible, so just check existence
  expect(page.getByText('67.00')).toBeVisible();
});

test('check transfer is listed in transfer tab after submit', async ({
  page
}) => {
  await addGenericTransaction(page, {
    value: '53',
    extraActions: [
      page.getByLabel('type', { exact: true }).selectOption('Transfer')
    ]
  });

  await page.getByRole('tab').getByText('Transfers').click();
  // all transactions should be visible, so just check existence
  expect(page.getByText('53.00')).toBeVisible();
});
