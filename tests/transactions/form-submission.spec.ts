import { test, expect, type Page } from '@playwright/test';

import { navigateTo } from '../helpers/navigate';
import { addDefaultAccount } from './helper';

const addGenericTransaction = async (
  page: Page,
  { value, extraActions }: { value: string; extraActions: Promise<any>[] } = {
    value: '55.00',
    extraActions: []
  }
) => {
  await page.getByLabel('repeat type').selectOption('No Repeating');
  await page.getByLabel('ending').click();
  await page.getByLabel('start').type('01012025');
  await page.getByLabel('value').fill(value);
  if (extraActions) {
    for (let pageAction of extraActions) {
      await pageAction;
    }
  }
  await page.keyboard.press('Enter');
  await expect(page.getByText(value)).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await addDefaultAccount(page);
  await navigateTo(page, 'Planning');
  // await page.getByText('Add Transaction').click();
});

test('tab switches to the form', async ({ page }, testInfo) => {
  const addButton = page.getByText('Add Transaction');
  await addButton.click();
  await expect(page.getByText('Add a Transaction')).toBeAttached();
});

test('submits simple transaction', async ({ page }, testInfo) => {
  const addButton = page.getByText('Add Transaction');
  await addButton.click();
  await addGenericTransaction(page);
});

test('check income is listed in income tab after submit', async ({ page }) => {
  const addButton = page.getByText('Add Transaction');
  await addButton.click();
  await addGenericTransaction(page, {
    value: '55.00',
    extraActions: [
      page.getByLabel('type', { exact: true }).selectOption('Income')
    ]
  });

  await page.getByRole('tab').getByText('Income').click();
  // all transactions should be visible, so just check existence
  await expect(page.getByText('55.00')).toBeVisible();
});

test('check expense is listed in expense tab after submit', async ({
  page
}) => {
  const addButton = page.getByText('Add Transaction');
  await addButton.click();
  await addGenericTransaction(page, {
    value: '67.00',
    extraActions: [
      page.getByLabel('type', { exact: true }).selectOption('Expense')
    ]
  });

  await page.getByRole('tab').getByText('Expenses').click();
  // all transactions should be visible, so just check existence
  await expect(page.getByText('67.00')).toBeVisible();
});

test('check transfer is listed in transfer tab after submit', async ({
  page
}) => {
  const addButton = page.getByText('Add Transaction');
  await addButton.click();
  await addGenericTransaction(page, {
    value: '53',
    extraActions: [
      page.getByLabel('type', { exact: true }).selectOption('Transfer')
    ]
  });

  await page.getByRole('tab').getByText('Transfers').click();
  // all transactions should be visible, so just check existence
  await expect(page.getByText('53.00')).toBeVisible();
});
