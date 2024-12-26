import { parseISO } from 'date-fns';
import eachDayOfInterval from 'date-fns/fp/eachDayOfInterval/index.js';
import { createSelector } from 'starfx';

import { schema, Transaction, type Account } from '~/src/store/schema.ts';

import { nextTransaction } from '../thunks/transactionReoccurrence';
import {
  extrapolateTransactionOccurrences,
  findSeed
} from '../utils/extrapolateDates';

export const eachDay = createSelector(schema.chartRange.select, (chartRange) =>
  eachDayOfInterval(chartRange)
);

export interface TransactionWithSeed extends Transaction {
  seedDate: Date;
  occurredInSeed: number;
}
export const transactionsWithSeed = createSelector(
  schema.chartRange.select,
  schema.transactions.selectTableAsList,
  (chartRange, transactions) =>
    transactions.map((transaction) => {
      if (transaction.rtype === 'none') {
        return {
          ...transaction,
          seedDate: parseISO(transaction.start),
          occurredInSeed: 0
        };
      }

      const nextTransactionFn = nextTransaction(transaction.rtype);

      const { date, occurred: occurredInSeed } = findSeed({
        transaction,
        y: transaction.value,
        date: parseISO(transaction.start),
        nextTransactionFn,
        interval: chartRange,
        occurred: 0
      });
      return { ...transaction, seedDate: date, occurredInSeed };
    })
);

export interface TransactionWithAccount extends TransactionWithSeed {
  raccountMeta: Account;
  transferInMeta?: Account;
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

export const chartableData = createSelector(
  eachDay,
  transactionsWithAccounts,
  (allDates, transactions) => {
    return transactions.map((transaction) => {
      const { data, allTransactionEvents } = extrapolateTransactionOccurrences({
        transaction,
        allDates
      });
      return { transaction, data, allTransactionEvents };
    });
  }
);

export const transactionsInTimeline = createSelector(
  eachDay,
  chartableData,
  (allDates, transactionsWithStacks) => {
    const datesWithTransactions = allDates.map((date) => {
      const thisDay = { date, transactions: [] as TransactionWithAccount[] };
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
