import { z } from 'zod';

import {
  schema,
  TransactionSchema,
  type TransactionInput
} from '../schema/index.ts';
import { thunks } from './foundation.ts';
import { transactionCompute } from './transactionReoccurrence/index.ts';

export const transactionAdd = thunks.create<TransactionInput>(
  'transaction:add',
  function* (ctx, next) {
    const transaction = TransactionSchema.safeParse(ctx.payload);
    if (!transaction.success) {
      console.error(
        'Invalid transaction payload\n',
        z.prettifyError(transaction.error)
      );
      throw new Error('Invalid transaction payload');
    }

    console.log('Adding transaction', transaction);
    yield* schema.update(
      schema.transactions.add({ [transaction.data.id]: transaction.data })
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
