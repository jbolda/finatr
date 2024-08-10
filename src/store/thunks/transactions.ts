import { format } from 'date-fns';

import { schema, type Transaction } from '../schema';
import { redinero } from '../utils/dineroUtils.ts';
import makeUUID from '../utils/makeUUID.ts';
import { thunks } from './foundation.ts';
import { transactionCompute } from './transactionReoccurrence/index.ts';

export const transactionAdd = thunks.create<Transaction>(
  'transaction:add',
  function* (ctx, next) {
    const transaction = { ...ctx.payload };
    if (!transaction?.id) transaction.id = makeUUID();
    if (typeof transaction.start === 'object')
      transaction.start = format(transaction.start, 'yyyy-MM-dd');
    transaction.value = redinero(transaction.value);
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
