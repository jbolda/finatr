import { Page } from '@playwright/test';

export const selectDate = async (page: Page, label: string, value: string) => {
  await page.getByRole('group', { name: label }).click();
  await page.keyboard.insertText(value);
};

export const selectOption = async (
  page: Page,
  label: string,
  option: string
) => {
  await page.getByLabel(label).first().click();
  await page.getByLabel(label).getByRole('option', { name: option }).click();
};
