import { type Page } from '@playwright/test';

export const getRowWith = (page: Page, id: string, text: string) => {
  void id;
  return page.locator('table').locator('tr', { hasText: text });
};
