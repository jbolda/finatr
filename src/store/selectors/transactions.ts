import { createSelector } from 'starfx';

import { schema, type Account } from '~/src/store/schema.ts';

import {
  chartableData,
  eachDay,
  transactionsWithSeed,
  TransactionWithSeed
} from './chartData';

export interface TransactionWithAccount extends TransactionWithSeed {
  raccountMeta: Account;
  transferInMeta: Account;
}

export const transactionsWithAccounts = createSelector(
  schema.accounts.selectTable,
  transactionsWithSeed,
  (accounts, transactions) => {
    const tA: TransactionWithAccount[] = transactions.map((t) => {
      const account = accounts?.[t.raccount] ?? { name: t.raccount };
      const accountTransferIn = !t.transferIn
        ? null
        : (accounts?.[t.transferIn] ?? { name: t.transferIn });
      const merged = {
        ...t,
        raccount: account.name,
        raccountMeta: account,
        ...(accountTransferIn
          ? {
              transferIn: accountTransferIn.name,
              transferInMeta: accountTransferIn
            }
          : {})
      };
      return merged;
    });
    return tA;
  }
);

export const transactionsInTimeline = createSelector(
  eachDay,
  chartableData,
  (allDates, transactionsWithStacks) => {
    const datesWithTransactions = allDates.map((date) => {
      const thisDay = { date, transactions: [] as TransactionWithSeed[] };
      for (const transaction of transactionsWithStacks) {
        if (transaction.allTransactionEvents.includes(date)) {
          thisDay.transactions.push(transaction.transaction);
        }
      }
      return thisDay;
    });
    return datesWithTransactions;
  }
);
