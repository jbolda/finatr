import { schema } from '../schema';
import { thunks } from './foundation.ts';

export const accountAdd = thunks.create('account:add', function* (ctx, next) {
  yield* schema.update(schema.accounts.add(ctx.payload));
  yield* next();
});

export { thunks };
