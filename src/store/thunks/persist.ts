import { select, type Operation } from 'starfx';

import { schema } from '~/store/schema/index.ts';

import { thunks } from './foundation.ts';
import { WebsocketContext } from './websocket.ts';

export const updatePersist = thunks.create<{ key: string; value: unknown }>(
  'persist.update',
  function* (ctx, next) {
    const { key, value } = ctx.payload;
    // allow keys with `persist.` prefix or bare key names
    const k = (key || '').toString().replace(/^persist\./, '');
    if (!k) {
      yield* next();
      return;
    }
    // apply to the persist slice
    yield* schema.update(
      schema.persist.update({ key: k as any, value: value as any })
    );
    yield* next();
  }
);

export const applySyncService = thunks.create(
  'sync:apply',
  function* (ctx, next) {
    const { service } = ctx.payload || ({} as { service?: string });
    const persist = yield* select(schema.persist.select);
    const svc = service ?? persist.syncService;
    const cur = yield* select(schema.sync.select);
    console.log('[applySyncService] applying service', svc);
    yield* schema.update(schema.sync.set({ ...cur, service: svc ?? '' }));

    const ws = (yield* WebsocketContext.get()) as
      | { close?: () => Operation<void> }
      | undefined;
    if (ws?.close) {
      console.log('[applySyncService] invoking ws.close via WebsocketContext');
      yield* ws.close();
      return yield* next();
    }
    console.log('[applySyncService] store updated service ->', svc);
    yield* next();
  }
);

export const toggleSync = thunks.create('sync:toggle', function* (_ctx, next) {
  const current = yield* select(schema.sync.select);
  console.log('[toggleSync] current.service=', current.service);
  // toggle: if service is set, disable it, otherwise enable using the preferred service
  if (current.service) {
    const cur = yield* select(schema.sync.select);
    console.log('[toggleSync] disabling sync, will set service to empty');
    yield* schema.update(schema.sync.set({ ...cur, service: '' }));
  } else {
    const persist = yield* select(schema.persist.select);
    const cur = yield* select(schema.sync.select);
    console.log(
      '[toggleSync] enabling sync, will set service to persist.syncService=',
      persist.syncService
    );
    yield* schema.update(
      schema.sync.set({ ...cur, service: persist.syncService ?? '' })
    );
  }
  yield* next();
});
