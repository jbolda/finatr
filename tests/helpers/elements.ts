import { Page } from '@playwright/test';

export const selectDate = async (page: Page, label: string, value: string) => {
  const [mm, dd, yyyy] = value.split('/');
  await page.getByLabel(label).getByLabel('mm').fill(mm);
  await page.getByLabel(label).getByLabel('dd').fill(dd);
  await page.getByLabel(label).getByLabel('yyyy').fill(yyyy);
};

export const selectOption = async (
  page: Page,
  label: string,
  option: string
) => {
  await page.getByLabel(label).click();
  await page.getByLabel(label).getByRole('option', { name: option }).click();
};
