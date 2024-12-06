import { test, expect, type Page } from '@playwright/test';

export const selectDate = async (page: Page, label: string, value: string) => {
  await page.getByRole('group', { name: label }).click();
  await page.keyboard.insertText(value);
};

export const selectOption = (page: Page, label: string, option: string) =>
  test.step(`Select ${option} from ${label}`, async () => {
    const selectInput = page.getByLabel(label, { exact: true });
    await expect(selectInput).toBeVisible();
    await selectInput.scrollIntoViewIfNeeded();
    await selectInput.click();
    await page.getByRole('option', { name: option }).click();
  });

export const selectOnlyTag = (
  page: Page,
  optionToSelect: string,
  optionsToDeselect: string[]
) =>
  test.step(`Filtering To ${optionToSelect}`, async () => {
    for (let optionToClick of optionsToDeselect) {
      await page.getByLabel(optionToClick, { exact: true }).click();
    }
  });
