// @ts-nocheck
const hex: string[] = [];

for (let i = 0; i < 256; i++) {
  hex[i] = (i < 16 ? '0' : '') + i.toString(16);
}

export default function makeUUID(): string {
  const g = globalThis as any;

  // Prefer built-in randomUUID when available (browser & modern Node)
  if (g.crypto && typeof g.crypto.randomUUID === 'function') {
    return g.crypto.randomUUID();
  }

  // Helper to obtain 16 random bytes in a variety of environments
  let r: Uint8Array = new Uint8Array(16);
  if (g.crypto && typeof g.crypto.getRandomValues === 'function') {
    r = g.crypto.getRandomValues(new Uint8Array(16));
  } else {
    // Try Node's crypto.randomFillSync via require if available
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
      const nodeCrypto =
        (g.require && g.require('crypto')) ||
        (typeof require === 'function' && require('crypto'));
      if (nodeCrypto && typeof nodeCrypto.randomFillSync === 'function') {
        const buf = Buffer.alloc(16);
        nodeCrypto.randomFillSync(buf);
        r = new Uint8Array(buf);
      } else {
        throw new Error('no node crypto');
      }
    } catch (err) {
      // Last-resort fallback (not cryptographically secure)
      for (let i = 0; i < 16; i++) r[i] = Math.floor(Math.random() * 256);
    }
  }

  // Ensure we have 16 bytes
  if (!r || r.length < 16) {
    const rr = new Uint8Array(16);
    for (let i = 0; i < 16; i++) rr[i] = Math.floor(Math.random() * 256);
    r = rr;
  }

  // Per RFC 4122 v4
  r[6] = (r[6] & 0x0f) | 0x40;
  r[8] = (r[8] & 0x3f) | 0x80;

  return (
    hex[r[0]] +
    hex[r[1]] +
    hex[r[2]] +
    hex[r[3]] +
    '-' +
    hex[r[4]] +
    hex[r[5]] +
    '-' +
    hex[r[6]] +
    hex[r[7]] +
    '-' +
    hex[r[8]] +
    hex[r[9]] +
    '-' +
    hex[r[10]] +
    hex[r[11]] +
    hex[r[12]] +
    hex[r[13]] +
    hex[r[14]] +
    hex[r[15]]
  );
}
