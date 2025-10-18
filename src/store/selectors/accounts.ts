import { eachDayOfInterval } from 'date-fns';
import { toDecimal, type Dinero } from 'dinero.js';
import { createSelector } from 'starfx';

import { Account, schema, Transaction } from '~/src/store/schema/index.ts';

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
    payback?: Transaction[];
  }[];
  max: number;
};

export const accountsFromSerialized = createSelector(
  schema.accounts.selectTableAsList,
  (accounts) => accounts.map((a) => reconstituteField<Account>(a, ['starting']))
);

export const accountsFromSerializedById = createSelector(
  schema.accounts.selectById,
  (account) => reconstituteField<Account>(account, ['starting'])
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

function resolveLineChartData({
  chartRange,
  accounts,
  transactions
}: {
  chartRange: any;
  accounts: Account[];
  transactions: {
    data: {
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
    }[];
    max: number;
  };
}) {
  const allDates = eachDayOfInterval(chartRange);
  const incomeStacked = transactions.data
    .filter((t) => t.transaction.type === 'income')
    .reduce((o, t) => {
      o[t.transaction.id] = t;
      return o;
    }, {});
  const expensesStacked = transactions.data
    .filter((t) => t.transaction.type === 'expense')
    .reduce((o, t) => {
      o[t.transaction.id] = t;
      return o;
    }, {});
  const transfersStacked = transactions.data
    .filter((t) => t.transaction.type === 'transfer')
    .reduce((o, t) => {
      o[t.transaction.id] = t;
      return o;
    }, {});

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
        data[accountIndex].data[dateIndex] = [day, firstStep];
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
        data[accountIndex].data[dateIndex + 1] = [day, secondStep];
      }
      return data;
    },
    accounts.map((a) => ({ ...a, data: [] as [any, number][] }))
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
      accountIdRefOnTransaction in d.transaction &&
      d.transaction?.[accountIdRefOnTransaction]?.id === accountId
    )
      return finalValue + d.stacked[index].height;
    return finalValue;
  }, 0);
