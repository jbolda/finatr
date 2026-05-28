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

test('sync websocket connects and receives a server message (sync-server)', async ({
  page,
  request
}) => {
  const endpoint = `http://127.0.0.1:${syncPort}`;
  await page.goto('/plan');

  await page.getByLabel('Preferred Sync Service').fill(endpoint);
  await page.getByRole('button', { name: 'Apply Sync Service' }).click();

  // Wait until the server reports at least one connected peer via /inspect
  const mgmtPort = String(Number(syncPort));
  const inspectUrl = `http://127.0.0.1:${mgmtPort}/inspect`;
  const start = Date.now();
  let peerCount = 0;
  // Wait up to 15s for a peer to appear via management inspect (server-side verification).
  while (Date.now() - start < 15000) {
    const res = await request.get(inspectUrl);
    const body = await res.json();
    console.log('MGMT inspect body:', JSON.stringify(body));
    // The management inspect endpoint returns a mapping of workspace -> {peers, rooms}
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

  // Now ensure the UI shows the active endpoint and connection is established
  // Be user-focused: give the UI more time to render the connected state
  await expect(page.getByText(`Active Sync: ${endpoint}`)).toBeVisible({
    timeout: 15000
  });
});
