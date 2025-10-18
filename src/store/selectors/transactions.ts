import { parseISO } from 'date-fns';
import { AnyState, createSelector } from 'starfx';

import { schema, Transaction, type Account } from '~/src/store/schema/index.ts';

import {
  nextTransaction,
  transactionCompute
} from '../thunks/transactionReoccurrence';
import {
  extrapolateTransactionOccurrences,
  findSeed
} from '../utils/extrapolateDates';
import { reconstituteField } from '../utils/reconcilerWithReconstitution';
import { dateRangeConsideringAccountStart, eachDay } from './chartRange';

export interface TransactionWithSeed extends Transaction {
  seedDate: Date;
  occurredInSeed: number;
}

export const transactionsFromSerialized = createSelector(
  schema.transactions.selectTableAsList,
  (transactions) =>
    transactions.map((t) => {
      const reconstituted = reconstituteField(t, ['value']) as Transaction;
      // @ts-expect-error
      reconstituted.dailyRate = transactionCompute({
        transaction: reconstituted
      });
      return reconstituted;
    })
);

export const transactionsWithSeed = createSelector(
  dateRangeConsideringAccountStart,
  transactionsFromSerialized,
  (chartRange, transactions) =>
    transactions.map((transaction) => {
      console.log('transaction', transaction);
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

export const accountsFromSerializedMap = createSelector(
  schema.accounts.selectTable,
  (accounts) => {
    console.log('accountsSelect', accounts);
    const map: Record<string, Account> = {};
    for (const account of Object.values(accounts)) {
      map[account.id] = reconstituteField<Account>(account, ['starting']);
    }
    return map;
  }
);

export const transactionsWithAccounts = createSelector(
  accountsFromSerializedMap,
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

export const transactionsByAccountId = createSelector(
  transactionsWithAccounts,
  (_: AnyState, id: string) => id,
  (transactions, accountId) => {
    const transactionsByAccount = transactions.filter((t) => {
      return (
        t.raccountMeta.id === accountId || t.transferInMeta?.id === accountId
      );
    });
    return transactionsByAccount;
  }
);
