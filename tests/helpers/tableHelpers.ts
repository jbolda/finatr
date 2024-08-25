import { type Page } from '@playwright/test';

export const getRowWith = (page: Page, id: string, text: string) =>
  page.locator('table').locator('tr', { hasText: text });
