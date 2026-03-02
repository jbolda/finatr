import { eachDayOfInterval } from 'date-fns';
import { toDecimal, type Dinero } from 'dinero.js';
import { createSelector } from 'starfx';

import type { Account } from '~/store/schema/index.ts';
import { loroSchema as schema } from '~/store/schema/index.ts';

import { reconstituteField } from '../utils/reconcilerWithReconstitution.ts';
import { barChartTransactions } from './chartData';
import { dateRangeConsideringAccountStart } from './chartRange';
import type { TransactionWithAccount } from './transactions';

export type ChartAccounts = {
  data: {
    data: [any, number][];
    name: string;
    starting: Dinero<number>;
    interest: {
      amount: number;
      scale: number;
    };
    vehicle: string;
  }[];
  max: number;
};

export type AccountWithDinero = Account & {
  starting: Dinero<number>;
};

export const accountsFromSerialized = createSelector(
  schema.accounts.selectTableAsList,
  (accounts) =>
    accounts.map((a) => reconstituteField<AccountWithDinero>(a, ['starting']))
);

export const accountsFromSerializedById = createSelector(
  schema.accounts.selectById,
  (account) => reconstituteField<AccountWithDinero>(account, ['starting'])
);

export const lineChartAccounts = createSelector(
  dateRangeConsideringAccountStart,
  barChartTransactions,
  accountsFromSerialized,
  (chartRange, transactions, accounts) => {
    const lineChart = resolveLineChartData({
      chartRange,
      transactions,
      accounts
    });
    return lineChart;
  }
);

type TransactionForChart = {
  stacked: {
    date: Date;
    height: number;
    y0: number;
  }[];
  transaction: TransactionWithAccount;
  data: {
    date: Date;
    y: Dinero<number> | null;
  }[];
};

function resolveLineChartData({
  chartRange,
  accounts,
  transactions
}: {
  chartRange: { start: Date; end: Date };
  accounts: AccountWithDinero[];
  transactions: {
    data: TransactionForChart[];
    max: number;
  };
}) {
  const allDates = eachDayOfInterval(chartRange);
  const incomeStacked = transactions.data
    .filter((t) => t.transaction.type === 'income')
    .reduce(
      (o, t) => {
        o[t.transaction.id] = t;
        return o;
      },
      {} as Record<string, TransactionForChart>
    );
  const expensesStacked = transactions.data
    .filter((t) => t.transaction.type === 'expense')
    .reduce(
      (o, t) => {
        o[t.transaction.id] = t;
        return o;
      },
      {} as Record<string, TransactionForChart>
    );
  const transfersStacked = transactions.data
    .filter((t) => t.transaction.type === 'transfer')
    .reduce(
      (o, t) => {
        o[t.transaction.id] = t;
        return o;
      },
      {} as Record<string, TransactionForChart>
    );

  let max = 0;
  const stack = allDates.reduce(
    (data, day, index) => {
      const dateIndex = index * 2;
      for (
        let accountIndex = 0;
        accountIndex < accounts.length;
        accountIndex++
      ) {
        const account = accounts[accountIndex];
        if (!account) continue;
        const d = data[accountIndex];
        if (!d) continue;

        const income = sumTotal(
          incomeStacked,
          index,
          account.id,
          'raccountMeta'
        );
        const expenses = sumTotal(
          expensesStacked,
          index,
          account.id,
          'raccountMeta'
        );
        const transfersOut = sumTotal(
          transfersStacked,
          index,
          account.id,
          'raccountMeta'
        );
        const transfersIn = sumTotal(
          transfersStacked,
          index,
          account.id,
          'transferInMeta'
        );
        const expenseTransfersIn = sumTotal(
          expensesStacked,
          index,
          account.id,
          'transferInMeta'
        );

        const prevValue =
          data?.[accountIndex]?.data?.[dateIndex - 1]?.[1] ??
          Number(toDecimal(account.starting));
        if (!prevValue && prevValue !== 0) {
          console.error({ account, prevValue, day, income, expenses });
          throw new Error(`nulled`);
        }
        const firstStep = prevValue - expenses - transfersOut;
        d.data[dateIndex] = [day, firstStep];
        const secondStep =
          firstStep +
          income +
          (['debt', 'loan', 'credit line'].includes(account.vehicle)
            ? transfersIn
            : -transfersIn) +
          (['debt', 'loan', 'credit line'].includes(account.vehicle)
            ? -expenseTransfersIn
            : expenseTransfersIn);
        if (secondStep > max) max = secondStep;
        d.data[dateIndex + 1] = [day, secondStep];
      }
      return data;
    },
    accounts.map((a) => ({ ...a, data: [] as [Date, number][] }))
  );
  return { data: stack, max };
}

const sumTotal = (
  transactions: Record<
    string,
    { stacked: { height: number }[]; transaction: TransactionWithAccount }
  >,
  index: number,
  accountId: string,
  accountIdRefOnTransaction: 'raccountMeta' | 'transferInMeta' = 'raccountMeta'
) =>
  Object.keys(transactions).reduce((finalValue, key) => {
    const d = transactions[key];
    if (
      d &&
      accountIdRefOnTransaction in d.transaction &&
      d.transaction?.[accountIdRefOnTransaction]?.id === accountId
    )
      return finalValue + (d?.stacked?.[index]?.height ?? 0);
    return finalValue;
  }, 0);
