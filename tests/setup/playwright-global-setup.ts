import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export default async function globalSetup() {
  const manifestPath = path.resolve(process.cwd(), 'sync-server', 'Cargo.toml');

  await execFileAsync('cargo', ['check', '--manifest-path', manifestPath], {
    cwd: process.cwd(),
    env: process.env,
    maxBuffer: 10 * 1024 * 1024
  });
}
