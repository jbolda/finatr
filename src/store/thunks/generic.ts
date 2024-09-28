import { updateStore, type AnyState, type StoreUpdater } from 'starfx';

import { thunks } from './foundation.ts';

export const updater = thunks.create<StoreUpdater<AnyState>[]>(
  'update',
  function* (ctx, next) {
    yield* updateStore(ctx.payload);
    yield* next();
  }
);
