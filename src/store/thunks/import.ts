import { put } from 'starfx';
import { z } from 'zod';

import {
  schema,
  type Transaction,
  type Account,
  type ChartRange,
  AccountSchema,
  TransactionSchema,
  ChartRangeSchema
} from '../schema/index.ts';
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
    ctx.payload;

  const accountsParsed = z.array(AccountSchema).safeParse(accounts);
  if (!accountsParsed.success) {
    console.error(
      'Account import failed\n',
      z.prettifyError(accountsParsed.error)
    );
    throw new Error('Account import failed');
  }
  const transactionsParsed = z.array(TransactionSchema).safeParse(transactions);
  if (!transactionsParsed.success) {
    console.error(
      'Transaction import failed\n',
      z.prettifyError(transactionsParsed.error)
    );
    throw new Error('Transaction import failed');
  }

  yield* schema.update([
    schema.transactions.reset(),
    schema.accounts.reset(),
    schema.chartRange.reset()
  ]);

  // the fires off a dispatch and returns immediately
  for (let account of accountsParsed.data) {
    yield* put(accountAdd(account));
  }

  for (let transaction of transactionsParsed.data) {
    yield* put(transactionAdd(transaction));
  }

  if (chartRange?.start) {
    const rangeParsed = ChartRangeSchema.safeParse(chartRange);
    if (!rangeParsed.success) {
      console.error(
        'ChartRange import failed\n',
        z.prettifyError(rangeParsed.error)
      );
      throw new Error('ChartRange import failed');
    }
    yield* schema.update(schema.chartRange.set(rangeParsed.data));
  }

  // if (incomeReceived) {
  //   for (let income of incomeReceived) {
  //     yield* put(addIncomeReceived(income));
  //   }
  // }
  // if (incomeExpected) {
  //   for (let expected of incomeExpected) {
  //     yield* put(addIncomeExpected(expected));
  //   }
  // }

  yield* next();
});
