import { test, expect } from '@playwright/test';

import { runSyncServer } from '../setup/simulacrum-runner';

// Give the beforeAll hook longer to start the Rust server and compile if required
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

test('aria-live updates after a server broadcast', async ({
  page,
  request
}) => {
  const mgmtPort = String(syncPort);
  await page.goto('/plan');

  await page
    .getByLabel('Preferred Sync Service')
    .fill(`http://127.0.0.1:${syncPort}`);
  await page.getByRole('button', { name: 'Apply Sync Service' }).click();

  const inspectUrl = `http://127.0.0.1:${mgmtPort}/inspect`;
  const start = Date.now();
  let peerCount = 0;
  // Wait up to 15s for a peer to appear via management inspect (server-side verification)
  while (Date.now() - start < 15000) {
    const res = await request.get(inspectUrl);
    const body = await res.json();
    console.log('MGMT inspect body:', JSON.stringify(body));
    if (Array.isArray(body?.peers)) {
      peerCount = body.peers.length;
    } else {
      peerCount = Object.values(body || {}).reduce(
        (acc: number, v: any) => acc + (v?.peers?.length || 0),
        0
      );
    }
    if (peerCount > 0) break;
    await page.waitForTimeout(200);
  }
  expect(peerCount).toBeGreaterThan(0);

  await expect(
    page.getByText(`Active Sync: http://127.0.0.1:${syncPort}`)
  ).toBeVisible({ timeout: 15000 });

  await request.post(`http://127.0.0.1:${mgmtPort}/broadcast`, {
    data: { msg: 'aria-live test message' }
  });

  await expect(page.locator('div[aria-live="polite"]')).toContainText(
    'aria-live test message',
    { timeout: 10000 }
  );
});
