import { useService } from '@simulacrum/server';
import { each, Ok, suspend, createScope, until, sleep, Err } from 'effection';
import type { Operation } from 'effection';
import net from 'net';
import path from 'path';

const startSyncServer = (cmd: string, port: number) =>
  useService('sync-server', cmd, {
    wellnessCheck: {
      // Use startup wait of 30s to allow compilation and server start on CI and local
      timeout: 30000,
      frequency: 100,
      *operation(stdio) {
        for (let line of yield* each<string>(stdio)) {
          if (line.includes('Started')) {
            break;
          }
          yield* each.next();
        }

        // poll for readiness of the management endpoint
        const mgmtUrl = `http://127.0.0.1:${port}/inspect`;
        const pollDeadline = Date.now() + 10000;
        const pollInterval = 50;
        while (Date.now() < pollDeadline) {
          try {
            yield* until(fetch(mgmtUrl));
            return Ok<void>(void 0);
          } catch (err) {
            yield* sleep(pollInterval);
          }
        }
        return Err<void>(new Error('sync-server not ready'));
      }
    }
  });

export function runSyncServer() {
  const [scope, destroy] = createScope();
  return {
    async start() {
      const ready = Promise.withResolvers();
      const manifest = path.resolve(process.cwd(), 'sync-server', 'Cargo.toml');
      // If SYNC_PORT is provided, use it; otherwise pick a free ephemeral port per worker.
      async function getFreePort(): Promise<number> {
        return await new Promise((resolve, reject) => {
          const s = net.createServer();
          s.listen(0, '127.0.0.1', () => {
            const address = s.address();
            if (!address || typeof address === 'string') {
              reject(new Error('failed to allocate free port'));
              return;
            }
            const p = address.port as number;
            s.close(() => resolve(p));
          });
          s.on('error', (e) => reject(e));
        });
      }

      const port = Number(
        process.env['SYNC_PORT'] ?? String(await getFreePort())
      );
      const cmd = [
        'cargo',
        'run',
        '--manifest-path',
        manifest,
        '--',
        '--port',
        String(port)
      ];
      scope.run(function* (): Operation<void> {
        yield* startSyncServer(cmd.join(' '), port);
        ready.resolve(void 0);
        yield* suspend();
      });
      await ready.promise;

      return { port };
    },
    async stop() {
      await destroy();
    }
  };
}
