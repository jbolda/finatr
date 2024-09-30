import { type AnyState } from 'starfx';

import { schema } from '../schema.ts';
import { thunks } from './foundation.ts';

export const sync = thunks.create<AnyState>('sync', function* (ctx, next) {
  // @ts-expect-error
  yield* schema.update(ctx.payload);
  yield* next();
});
