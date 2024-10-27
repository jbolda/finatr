import { eachDayOfInterval } from 'date-fns';
import { toDecimal, type Dinero } from 'dinero.js';
import { createSelector } from 'starfx';

import { Account, schema, Transaction } from '~/src/store/schema.ts';

import { barChartTransactions } from './chartData';

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

export const lineChartAccounts = createSelector(
  schema.chartRange.select,
  barChartTransactions,
  schema.accounts.selectTableAsList,
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
      transaction: Transaction;
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

  const incomeKeys = Object.keys(incomeStacked);
  const expensesKeys = Object.keys(expensesStacked);

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
        const income = sumTotal(incomeKeys, incomeStacked, index, account);
        const expenses = sumTotal(
          expensesKeys,
          expensesStacked,
          index,
          account
        );
        const prevValue =
          data?.[accountIndex]?.data?.[dateIndex - 1]?.[1] ??
          Number(toDecimal(account.starting));
        if (!prevValue && prevValue !== 0) {
          console.error({ account, prevValue, day, income, expenses });
          throw new Error(`nulled`);
        }
        const firstStep = prevValue - expenses;
        data[accountIndex].data[dateIndex] = [day, firstStep];
        const secondStep = firstStep + income;
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
  keys: string[],
  transactions: Record<
    string,
    { stacked: { height: number }[]; transaction: { raccount: string } }
  >,
  index: number,
  account: Account
) =>
  keys.reduce((finalValue, key) => {
    const d = transactions[key];
    if (d.transaction.raccount === account.id)
      return finalValue + d.stacked[index].height;
    return finalValue;
  }, 0);
