import { toDecimal } from 'dinero.js';
import type { Dinero } from 'dinero.js';
import { createSelector } from 'starfx';

import { chartableData, type TransactionWithAccount } from './transactions';

export const barChartTransactions = createSelector(
  chartableData,
  (allChartData) => {
    const income = allChartData.filter((d) => d.transaction.type === 'income');
    const expenses = allChartData.filter(
      (d) => d.transaction.type === 'expense'
    );
    const transfers = allChartData.filter(
      (d) => d.transaction.type === 'transfer'
    );

    const incomeStacked = stackTransactions(income);
    const expensesStacked = stackTransactions(expenses);
    const transfersStacked = stackTransactions(transfers);
    const maxValue = Math.max(
      incomeStacked.maxValue,
      expensesStacked.maxValue,
      transfersStacked.maxValue
    );

    return {
      data: ([] as ReturnType<typeof stackTransactions>['stack']).concat(
        incomeStacked.stack,
        expensesStacked.stack,
        transfersStacked.stack
      ),
      max: maxValue
    };
  }
);

const getInitialY = (
  arr: {
    transaction: TransactionWithAccount;
    data: { date: Date; y: Dinero<number> | null }[];
  }[],
  transactionIndex: number,
  dataIndex: number
): number => {
  let bottom = 0;
  for (let i = 0; i < transactionIndex; i++) {
    const entry = arr[i];
    if (!entry) continue;
    const value = entry.data?.[dataIndex]?.y;
    if (value) bottom += Number(toDecimal(value));
  }
  return bottom;
};
const stackTransactions = (
  transactions: {
    transaction: TransactionWithAccount;
    data: { date: Date; y: Dinero<number> | null }[];
  }[]
) => {
  let maxValue = 0;
  const transactionStack = transactions.map((item, transactionIndex) => {
    const stacked = item.data.map((d, i) => {
      const height = d.y ? Number(toDecimal(d.y)) : 0;
      const stack = {
        date: d.date,
        height,
        y0: getInitialY(transactions, transactionIndex, i)
      };
      // side effect: find max chart value
      if (stack.y0 + stack.height > maxValue)
        maxValue = stack.y0 + stack.height;
      return stack;
    });
    return { ...item, stacked };
  });
  return { maxValue, stack: transactionStack };
};
