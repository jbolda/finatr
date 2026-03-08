import { test, expect } from '@playwright/test';

import { navigateTo } from '../helpers/navigate';

// the switches generated from Settings simply use the setting key as the
// accessible name, so "persist" will show up as a checkbox role.

test('persistence is off by default and can be toggled', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('finatr');
    localStorage.removeItem('finatr-meta');
  });
  await navigateTo(page, 'Settings');

  const persistSwitch = page.getByRole('switch', {
    name: 'Save data to local storage'
  });
  await expect(persistSwitch).not.toBeChecked();

  // storage should be empty initially
  const stored = await page.evaluate(() => localStorage.getItem('finatr'));
  await expect(stored).toBeNull();

  // turn it on by clicking the label text (the switch itself is tricky to
  // click reliably because of the custom styling)
  await page.getByText('Save data to local storage').click();
  await expect(persistSwitch).toBeChecked();

  // persistence should begin writing immediately; wait for any value
  await page.waitForFunction(
    () => localStorage.getItem('finatr') !== null,
    null,
    { timeout: 5000 }
  );
  const storedState = await page.evaluate(() => localStorage.getItem('finatr'));
  expect(storedState).not.toBeNull();

  // now turn persistence off and verify storage is cleared
  await navigateTo(page, 'Settings');
  await page.getByText('Save data to local storage').click();
  await expect(persistSwitch).not.toBeChecked();
  const again = await page.evaluate(() => localStorage.getItem('finatr'));
  await expect(again).toBeNull();
});
