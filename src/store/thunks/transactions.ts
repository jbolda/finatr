import { z } from 'zod';

import {
  loroSchema as schema,
  TransactionSchema,
  type TransactionInput
} from '../schema/index.ts';
import { thunks } from './foundation.ts';

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
    // TODO typings: the generic isn't coming through and is only FxMap
    yield* schema.update(
      schema.transactions.add({
        [transaction.data.id]: transaction.data
      }) as any
    );
    yield* next();
  }
);

export const transactionRemove = thunks.create<{ id: string }>(
  'transaction:remove',
  function* (ctx, next) {
    // TODO typings: the generic isn't coming through and is only FxMap
    yield* schema.update(schema.transactions.remove([ctx.payload.id]) as any);
    yield* next();
  }
);
