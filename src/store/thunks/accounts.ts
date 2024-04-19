import { USD } from '@dinero.js/currencies';
import { dinero } from 'dinero.js';

import { schema } from '../schema';
import makeUUID from '../utils/makeUUID.ts';
import { thunks } from './foundation.ts';

export const accountAdd = thunks.create('account:add', function* (ctx, next) {
  const rawAccount = { ...ctx.payload };
  const account = { ...rawAccount };
  if (!rawAccount.id) {
    account.id = makeUUID();
  }
  account.starting = dinero({ amount: rawAccount.starting, currency: USD });
  account.interest = { amount: rawAccount.interest * 100, scale: 2 };

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
