import { USD } from '@dinero.js/currencies';
import { parseISO } from 'date-fns';
import { dinero } from 'dinero.js';
import type { Dinero } from 'dinero.js';
import { createSelector } from 'starfx';
import type { AnyState } from 'starfx';

import { schema } from '~/src/store/schema/index.ts';
import type { Transaction } from '~/src/store/schema/index.ts';

import {
  nextTransaction,
  transactionCompute
} from '../thunks/transactionReoccurrence';
import {
  extrapolateTransactionOccurrences,
  findSeed
} from '../utils/extrapolateDates';
import { reconstituteField } from '../utils/reconcilerWithReconstitution';
import type { AccountWithDinero } from './accounts';
import { dateRangeConsideringAccountStart, eachDay } from './chartRange';

export type TransactionWithDinero = Transaction & {
  value: Dinero<number>;
  dailyRate: Dinero<number>;
};

export type TransactionWithSeed = TransactionWithDinero & {
  seedDate: Date;
  occurredInSeed: number;
};

export const transactionsFromSerialized = createSelector(
  schema.transactions.selectTableAsList,
  (transactions: Transaction[]) =>
    transactions.map((t) => {
      const reconstituted = reconstituteField<TransactionWithDinero>(t, [
        'value'
      ]);
      const maybeDaily = transactionCompute({ transaction: reconstituted });
      // Always provide a Dinero instance for dailyRate so downstream code can
      // safely assume a Dinero<number> (selector-first reconstitution
      // invariant). Use zero as a safe default when computation yields nothing.
      reconstituted.dailyRate =
        maybeDaily ?? dinero({ amount: 0, currency: USD, scale: 2 });
      return reconstituted;
    })
);

export const transactionsWithSeed = createSelector(
  dateRangeConsideringAccountStart,
  transactionsFromSerialized,
  (chartRange, transactions: TransactionWithDinero[]) =>
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

export type TransactionWithAccount = TransactionWithSeed & {
  raccountMeta: AccountWithDinero;
  transferInMeta?: AccountWithDinero;
};

export const accountsFromSerializedMap = createSelector(
  schema.accounts.selectTable,
  (accounts) => {
    console.log('accountsSelect', accounts);
    const map: Record<string, AccountWithDinero> = {};
    for (const account of Object.values(accounts)) {
      map[account.id] = reconstituteField<AccountWithDinero>(account, [
        'starting'
      ]);
    }
    return map;
  }
);

export const transactionsWithAccounts = createSelector(
  accountsFromSerializedMap,
  transactionsWithSeed,
  (accounts, transactions) => {
    const tA: TransactionWithAccount[] = transactions.map((t) => {
      const account =
        accounts?.[t.raccount] ??
        ({
          id: `missing:${t.raccount}`,
          name: t.raccount,
          starting: dinero({ amount: 0, currency: USD, scale: 2 }),
          interest: { amount: 0, scale: 2 },
          vehicle: 'operating'
        } as const as AccountWithDinero);
      const accountTransferIn = !t.transferIn
        ? null
        : (accounts?.[t.transferIn] ??
          ({
            id: `missing:${t.transferIn}`,
            name: t.transferIn,
            starting: dinero({ amount: 0, currency: USD, scale: 2 }),
            interest: { amount: 0, scale: 2 },
            vehicle: 'operating'
          } as const as AccountWithDinero));
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
