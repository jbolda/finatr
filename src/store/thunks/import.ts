import { put } from 'starfx';

import {
  schema,
  type Transaction,
  type Account,
  type ChartRange
} from '../schema';
import { reconcilerWithReconstitution } from '../utils/reconcilerWithReconstitution.ts';
import { accountAdd } from './accounts.ts';
import { thunks } from './foundation.ts';
import { addIncomeExpected, addIncomeReceived } from './taxStrategy.ts';
import { transactionAdd } from './transactions.ts';

export const importEntries = thunks.create<{
  transactions: Transaction[];
  accounts: Account[];
  chartRange: ChartRange;
  incomeReceived: any;
  incomeExpected: any;
}>('importEntries', function* (ctx, next) {
  const { transactions, accounts, chartRange, incomeReceived, incomeExpected } =
    reconcilerWithReconstitution({}, ctx.payload);

  yield* schema.update([
    schema.transactions.reset(),
    schema.accounts.reset(),
    schema.chartRange.reset()
  ]);

  // the fires off a dispatch and returns immediately
  for (let account of accounts) {
    yield* put(accountAdd(account));
  }

  for (let transaction of transactions) {
    yield* put(transactionAdd(transaction));
  }

  if (chartRange?.start)
    yield* schema.update(schema.chartRange.set(chartRange));

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
});
