import { put } from 'starfx';
import { schema } from '../schema';
import { thunks } from './foundation.ts';
import { transactionAdd } from './transactions.ts';
import { accountAdd } from './accounts.ts';

export const importEntries = thunks.create(
  'importEntries',
  function* (ctx, next) {
    const { transactions, accounts } = { ...ctx.payload };

    yield* schema.update([
      schema.transactions.reset(),
      schema.accounts.reset()
    ]);

    // the fires off a dispatch and returns immediately
    for (let transaction of transactions) {
      yield* put(transactionAdd(transaction));
    }

    for (let account of accounts) {
      yield* put(accountAdd(account));
    }

    yield* next();
  }
);
