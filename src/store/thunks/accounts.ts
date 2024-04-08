import { schema } from '../schema';
import makeUUID from '../utils/makeUUID.ts';
import { thunks } from './foundation.ts';

export const accountAdd = thunks.create('account:add', function* (ctx, next) {
  const account = { ...ctx.payload };
  if (!account.id) {
    account.id = makeUUID();
  }
  yield* schema.update(schema.accounts.add({ [account.id]: account }));
  yield* next();
});

export const accountRemove = thunks.create<{ id: string }>(
  'account:remove',
  function* (ctx, next) {
    yield* schema.update(schema.accounts.remove([ctx.payload.id]));
    yield* next();
  }
);
