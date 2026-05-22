import { test, expect } from '@playwright/test';

import { runSyncServer } from '../setup/simulacrum-runner';

test.setTimeout(60_000);

const syncServer = runSyncServer();
let syncPort: number;
test.beforeAll(async () => {
  const res = await syncServer.start();
  syncPort = res.port;
});
test.afterAll(async () => {
  await syncServer.stop();
});

test('aria-live updates when a sync message is received', async ({
  page,
  request
}) => {
  const endpoint = `http://127.0.0.1:${syncPort}`;

  await page.goto('/plan', { waitUntil: 'networkidle' });
  await page.getByLabel('Preferred Sync Service').fill(endpoint);
  await page.getByRole('button', { name: 'Apply Sync Service' }).click();
  await expect(page.getByText(`Active Sync: ${endpoint}`)).toBeVisible({
    timeout: 15000
  });

  const msg = 'aria-live test message';
  const res = await request.post(`${endpoint}/broadcast`, {
    data: { msg }
  });
  expect(res.ok()).toBeTruthy();

  await expect(page.locator('div[aria-live="polite"]')).toContainText(msg, {
    timeout: 5000
  });
});
