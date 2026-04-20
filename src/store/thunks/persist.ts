import { select, type StoreUpdater, type SliceFromSchema } from 'starfx';

import { metaSchema as schema, type MetaSchemaSlices } from '~/store/schema/index.ts';

import { thunks } from './foundation.ts';

type MetaState = SliceFromSchema<MetaSchemaSlices>;

type PersistState = typeof schema.initialState['persist'];

export const updatePersist = thunks.create<{ key: string; value: unknown }>(
  'persist.update',
  function* (ctx, next) {
    const { key, value } = ctx.payload;
    // allow keys with `persist.` prefix or bare key names
    const k = (key || '').toString().replace(/^persist\./, '') as keyof PersistState;
    if (!k) {
      yield* next();
      return;
    }

    // apply to the persist slice via its schema helper
    const updater = schema.persist.update({
      key: k,
      value: value as PersistState[typeof k]
    });
    yield* schema.update(
      updater as unknown as StoreUpdater<MetaState>
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

    console.log('[applySyncService] applying service', svc);
    const cur = yield* select(schema.sync.select);
    const updateSync = schema.sync.set({ ...cur, service: svc ?? '' });
    yield* schema.update(updateSync as unknown as StoreUpdater<MetaState>);

    // previously we closed the underlying websocket here, but that
    // triggered the entire managed resource to shut down (see
    // websocket.ts provide finally log). the resource already watches for
    // endpoint changes and will close/reconnect automatically, so we no
    // longer need to manually call `ws.close()`.
    //
    // redundant invocations (svc === cur.service) are still harmless, and we
    // simply update the store below.

    console.log('[applySyncService] store updated service ->', svc);
    yield* next();
  }
);

export const toggleSync = thunks.create('sync:toggle', function* (_ctx, next) {
  const current = yield* select(schema.sync.select);
  console.log('[toggleSync] current.service=', current.service);
  // toggle: if service is set, disable it, otherwise enable using the preferred service
  if (current.service) {
    console.log('[toggleSync] disabling sync, will set service to empty');
    const cur = yield* select(schema.sync.select);
    const updateSync = schema.sync.set({ ...cur, service: '' });
    yield* schema.update(updateSync as unknown as StoreUpdater<MetaState>);
  } else {
    const persist = yield* select(schema.persist.select);
    const cur = yield* select(schema.sync.select);
    console.log(
      '[toggleSync] enabling sync, will set service to persist.syncService=',
      persist.syncService
    );
    const updateSync = schema.sync.set({
      ...cur,
      service: persist.syncService ?? ''
    });
    yield* schema.update(updateSync as unknown as StoreUpdater<MetaState>);
  }
  yield* next();
});
