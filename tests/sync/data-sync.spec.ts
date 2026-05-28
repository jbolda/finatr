import { test, expect } from '@playwright/test';

import { runSyncServer } from '../setup/simulacrum-runner';

// Allow extra time for server startup and two-client sync verification in CI
test.setTimeout(120_000);

const syncServer = runSyncServer();
let syncPort: number;
test.beforeAll(async () => {
  const res = await syncServer.start();
  syncPort = res.port;
});
test.afterAll(async () => {
  await syncServer.stop();
});

test('data syncs between two clients via sync-server', async ({
  browser,
  request
}) => {
  const endpoint = `http://127.0.0.1:${syncPort}`;

  // Open two independent pages (clients)
  const pageA = await browser.newPage();
  const pageB = await browser.newPage();

  try {
    await pageA.goto('/plan');
    await pageB.goto('/plan');

    await pageA.getByLabel('Preferred Sync Service').fill(endpoint);
    await pageB.getByLabel('Preferred Sync Service').fill(endpoint);
    await pageA.getByRole('button', { name: 'Apply Sync Service' }).click();
    await pageB.getByRole('button', { name: 'Apply Sync Service' }).click();

    await expect(pageA.getByText(`Active Sync: ${endpoint}`)).toBeVisible({
      timeout: 15000
    });
    await expect(pageB.getByText(`Active Sync: ${endpoint}`)).toBeVisible({
      timeout: 15000
    });

    const msg = 'sync message for both clients';
    const res = await request.post(`${endpoint}/broadcast`, {
      data: { msg }
    });
    expect(res.ok()).toBeTruthy();

    await expect(pageA.locator('div[aria-live="polite"]')).toContainText(msg, {
      timeout: 10000
    });
    await expect(pageB.locator('div[aria-live="polite"]')).toContainText(msg, {
      timeout: 10000
    });
  } finally {
    await pageA.close();
    await pageB.close();
  }
});
