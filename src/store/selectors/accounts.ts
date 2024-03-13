import { eachDayOfInterval } from 'date-fns';
import { createSelector } from 'starfx/store';

import { schema } from '~/src/store/schema.ts';

export const lineChartAccounts = createSelector(
  schema.chartBarRange.select,
  schema.chartBarData.selectTableAsList,
  schema.accounts.selectTableAsList,
  (graphRange, transactions, accounts) => {
    const lineChart = resolveLineChartData({
      graphRange,
      transactions,
      accountsList: accounts
    });
    return lineChart;
  }
);

function resolveLineChartData({ graphRange, accountsList, transactions }) {
  const allDates = eachDayOfInterval(graphRange);
  const incomeStacked = transactions
    .filter((t) => t.transaction.type === 'income')
    .reduce((o, t) => {
      o[t.id] = t;
      return o;
    }, {});
  const expensesStacked = transactions
    .filter((t) => t.transaction.type === 'expense')
    .reduce((o, t) => {
      o[t.id] = t;
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
        accountIndex < accountsList.length;
        accountIndex++
      ) {
        const account = accountsList[accountIndex];
        const income = sumTotal(incomeKeys, incomeStacked, index, account.name);
        const expenses = sumTotal(
          expensesKeys,
          expensesStacked,
          index,
          account.name
        );
        const prevValue =
          data?.[accountIndex]?.data?.[dateIndex - 1]?.[1] ?? account.starting;
        if (!prevValue) {
          console.error({ account, prevValue, day, income, expenses });
          throw new Error(`nulled, wtf`);
        }
        const firstStep = prevValue - expenses;
        data[accountIndex].data[dateIndex] = [day, firstStep];
        const secondStep = firstStep + income;
        if (secondStep > max) max = secondStep;
        data[accountIndex].data[dateIndex + 1] = [day, secondStep];
      }
      return data;
    },
    accountsList.map((a) => ({ ...a, data: [] }))
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
  accountName: string
) =>
  keys.reduce((finalValue, key) => {
    const d = transactions[key];
    console.log({ d });
    if (d.transaction.raccount === accountName)
      return finalValue + d.stacked[index].height;
    return finalValue;
  }, 0);
