import { updateStore, type AnyState, type StoreUpdater } from 'starfx';

import { thunks } from './foundation.ts';

export const updateAuth = thunks.create<StoreUpdater<AnyState>[]>(
  'auth:session',
  function* (ctx, next) {
    yield* updateStore(ctx.payload);
    yield* next();
  }
);
