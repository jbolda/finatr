import { USD } from '@dinero.js/currencies';
import { format } from 'date-fns';
import { dinero } from 'dinero.js';

import { schema } from '../schema';
import makeUUID from '../utils/makeUUID.ts';
import { thunks } from './foundation.ts';
import { transactionCompute } from './transactionReoccurrence/index.ts';

export const transactionAdd = thunks.create(
  'transaction:add',
  function* (ctx, next) {
    const transaction = { ...ctx.payload };
    if (!transaction?.id) transaction.id = makeUUID();
    if (typeof transaction.start === 'object')
      transaction.start = format(transaction.start, 'yyyy-MM-dd');
    transaction.value = dinero({
      amount: ctx.payload?.value ?? 0,
      currency: USD
    });
    transaction.cycle = ctx.payload?.cycle ?? 0;
    transaction.occurrences = ctx.payload?.occurrences ?? 0;
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
