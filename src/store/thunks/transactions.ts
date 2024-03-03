import Big from 'big.js';

import { schema } from '../schema';
import makeUUID from '../utils/makeUUID.ts';
import { thunks } from './foundation.ts';
import { transactionCompute } from './transactionReoccurrence/index.ts';

export const transactionAdd = thunks.create(
  'transaction:add',
  function* (ctx, next) {
    const transaction = { ...ctx.payload };
    if (!transaction?.id) transaction.id = makeUUID();
    transaction.value = new Big(ctx.payload?.value ?? 0);
    transaction.cycle = new Big(ctx.payload?.cycle ?? 0);
    transaction.occurrences = new Big(ctx.payload?.occurrences ?? 0);
    transaction.dailyRate = transactionCompute({ transaction });

    yield* schema.update(
      schema.transactions.add({ [transaction.id]: transaction })
    );
    yield* next();
  }
);

export const transactionRemove = thunks.create<{ id: string }>(
  'transaction:remove',
  function* (ctx, next) {
    yield* schema.update(schema.transactions.remove([ctx.payload.id]));
    yield* next();
  }
);
