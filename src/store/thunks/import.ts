import { put } from 'starfx';

import { schema } from '../schema';
import { accountAdd } from './accounts.ts';
import { updateChartDateRange } from './chartRange.ts';
import { thunks } from './foundation.ts';
import { transactionAdd } from './transactions.ts';

export const importEntries = thunks.create(
  'importEntries',
  function* (ctx, next) {
    const { transactions, accounts, graphRange } = { ...ctx.payload };

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

    if (graphRange?.start) yield* put(updateChartDateRange(graphRange.start));

    yield* next();
  }
);
