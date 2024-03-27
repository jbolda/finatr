import { put } from 'starfx';

import { schema } from '../schema';
import { accountAdd } from './accounts.ts';
import { updateChartDateRange } from './chartRange.ts';
import { thunks } from './foundation.ts';
import { addIncomeExpected, addIncomeReceived } from './taxStrategy.ts';
import { transactionAdd } from './transactions.ts';

export const importEntries = thunks.create(
  'importEntries',
  function* (ctx, next) {
    const {
      transactions,
      accounts,
      graphRange,
      incomeReceived,
      incomeExpected
    } = {
      ...ctx.payload
    };

    yield* schema.update([
      schema.transactions.reset(),
      schema.accounts.reset()
      // schema.taxStrategy.reset()
    ]);

    // the fires off a dispatch and returns immediately
    for (let transaction of transactions) {
      yield* put(transactionAdd(transaction));
    }

    for (let account of accounts) {
      yield* put(accountAdd(account));
    }

    if (graphRange?.start) yield* put(updateChartDateRange(graphRange.start));

    if (incomeReceived) {
      for (let income of incomeReceived) {
        yield* put(addIncomeReceived(income));
      }
    }
    if (incomeExpected) {
      for (let expected of incomeExpected) {
        yield* put(addIncomeExpected(expected));
      }
    }

    yield* next();
  }
);
