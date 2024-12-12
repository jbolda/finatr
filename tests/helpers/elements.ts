import { test, expect, type Page } from '@playwright/test';

export const selectDate = (
  page: Page,
  label: string,
  value: { day: string; month: string; year: string }
) =>
  test.step(`Pick ${label} on Date Picker`, async () => {
    const dateField = page.getByLabel(label);
    await page.getByText(label).click();
    await page.keyboard.type(value.month);
    await page.waitForTimeout(50);
    await page.keyboard.type(value.day);
    await page.waitForTimeout(50);
    await page.keyboard.type(value.year);
    await page.waitForTimeout(50);
    await expect(dateField.locator('input')).toHaveValue(
      `${value.year}-${value.month}-${value.day}`
    );
  });

export const selectOption = (page: Page, label: string, option: string) =>
  test.step(`Select ${option} from ${label}`, async () => {
    const selectInput = page.getByLabel(label, { exact: true });
    // seems to be needed to properly handle click and opening select items
    await selectInput.scrollIntoViewIfNeeded();
    await expect(selectInput).toBeVisible();
    await selectInput.click();
    // seems the only way to reliably get focus
    await page.keyboard.press('ArrowDown');

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
