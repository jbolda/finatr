import { test, expect, type Page } from '@playwright/test';

import { selectDate, selectOption } from '../helpers/elements';
import { navigateTo } from '../helpers/navigate';

export const addDefaultAccount = async (page: Page) => {
  await test.step('Add default account', async () => {
    await navigateTo(page, 'Planning');
    await page.getByText('Add Account').click();
    await page.getByLabel('name').fill('Test Account Submission');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Test Account Submission')).toBeVisible();
  });
};

export const addGenericTransaction = async (
  page: Page,
  { value, extraActions }: { value: string; extraActions: Promise<any>[] } = {
    value: '55.00',
    extraActions: []
  }
) => {
  await test.step('Add Generic Transaction', async () => {
    const addButton = page.getByText('Add Transaction');
    await addButton.click();

    await expect(page.getByText('Add a Transaction')).toBeAttached();

    await selectOption(page, 'Account', 'Test Account Submission');
    await selectOption(page, 'Repeat Type', 'No Repeating');
    await page.getByLabel('Category').fill('generic');
    await page.getByLabel('description').fill('test transaction');

    await selectDate(page, 'start date', '01/01/2024');

    if (extraActions) {
      await test.step('Extra Actions', async () => {
        for (let pageAction of extraActions) {
          await pageAction;
        }
      });
    }

    await page.getByLabel('value').first().fill(value);
    await page.keyboard.press('Enter');
    await expect(page.locator('table').getByText(value)).toBeVisible();
  });
};
