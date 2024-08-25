import { USD } from '@dinero.js/currencies';

import { schema, type Account } from '../schema';
import { dineroFromFloat, redinero } from '../utils/dineroUtils.ts';
import makeUUID from '../utils/makeUUID.ts';
import { thunks } from './foundation.ts';

export const accountAdd = thunks.create<Account>(
  'account:add',
  function* (ctx, next) {
    const rawAccount = { ...ctx.payload };
    const account = { ...rawAccount };
    if (!rawAccount.id) {
      account.id = makeUUID();
    }
    account.starting = redinero(rawAccount.starting);
    account.interest =
      typeof rawAccount.interest === 'number'
        ? { amount: rawAccount.interest, scale: -2 }
        : rawAccount.interest;

    yield* schema.update(schema.accounts.add({ [account.id]: account }));
    yield* next();
  }
);

export const accountRemove = thunks.create<{ id: string }>(
  'account:remove',
  function* (ctx, next) {
    yield* schema.update(schema.accounts.remove([ctx.payload.id]));
    yield* next();
  }
);
