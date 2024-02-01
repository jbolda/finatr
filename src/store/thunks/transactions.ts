import Big from 'big.js';

import { schema } from '../schema';
import { thunks } from './foundation.ts';
import { transactionCompute } from './transactionReoccurrence/index.ts';

export const transactionAdd = thunks.create(
  'transaction:add',
  function* (ctx, next) {
    const transaction = ctx.payload;
    transaction.value = new Big(transaction.value);
    const dailyRate = transactionCompute({ transaction });

    yield* schema.update(
      schema.transactions.add({ ...transaction, dailyRate })
    );
    yield* next();
  }
);


