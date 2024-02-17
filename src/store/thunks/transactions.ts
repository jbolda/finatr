import Big from 'big.js';

import { schema } from '../schema';
import { thunks } from './foundation.ts';
import makeUUID from '../utils/makeUUID.ts';
import { transactionCompute } from './transactionReoccurrence/index.ts';

export const transactionAdd = thunks.create(
  'transaction:add',
  function* (ctx, next) {
    const transactionID = makeUUID();
    const transaction = { ...ctx.payload };
    transaction.id = transactionID;
    transaction.value = new Big(ctx.payload.value);
    transaction.cycle = new Big(ctx.payload.cycle);
    transaction.occurrences = new Big(ctx.payload.occurrences);
    transaction.dailyRate = transactionCompute({ transaction });

    yield* schema.update(
      schema.transactions.add({ [transactionID]: transaction })
    );
    yield* next();
  }
);

export const transactionRemove = thunks.create<{ id: string }>(
  'transaction:remove',
  function* (ctx, next) {
    console.log({ ctx });
    yield* schema.update(schema.transactions.remove([ctx.payload.id]));
    yield* next();
  }
);
