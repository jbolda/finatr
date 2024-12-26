import { test, expect, type Page } from '@playwright/test';

import { selectDate, selectOnlyTag, selectOption } from '../helpers/elements';
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

type SelectOptionsParams = Parameters<typeof selectOption>;
type ExtraActions = {
  fn: 'selectOption';
  args: [SelectOptionsParams[1], SelectOptionsParams[2]];
}[];

export const addGenericTransaction = (
  page: Page,
  {
    value,
    extraActions
  }: {
    value: string;
    extraActions: ExtraActions;
  } = {
    value: '55.00',
    extraActions: []
  }
) =>
  test.step('Add Generic Transaction', async () => {
    await page.getByText('Add Transaction').click();
    // confirms the form is loaded and stable
    await expect(page.getByText('Add a Transaction')).toBeAttached();

    await page.getByLabel('description').fill('test transaction');
    await page.getByLabel('Category').fill('generic');

    await selectOption(page, 'Account', 'Test Account Submission');
    await selectOption(page, 'Repeat Type', 'No Repeating');

    await selectDate(page, 'start date', {
      month: '09',
      day: '01',
      year: '2024'
    });

    if (extraActions) {
      for (let pageAction of extraActions) {
        if (pageAction.fn === 'selectOption') {
          // the tracing and actions gets real weird if we don't specifically
          // pass it and call it here
          await selectOption(page, pageAction.args[0], pageAction.args[1]);
        }
      }
    }

    await page.getByLabel('value').first().fill(value);
    await page.keyboard.press('Enter');
    await expect(page.locator('table').getByText(value)).toBeVisible();
  });

const possibleTransactionTypes = ['Income', 'Expenses', 'Transfers'] as const;
export const selectOnly = (
  page: Page,
  option: (typeof possibleTransactionTypes)[number]
) =>
  selectOnlyTag(
    page,
    option,
    possibleTransactionTypes.filter((o) => o !== option)
  );
