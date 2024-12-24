import { toDecimal } from 'dinero.js';
import { createSelector } from 'starfx';

import { Transaction } from '../schema';
import { chartableData } from './transactions';

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
    transaction: Transaction;
    data: {
      date: Date;
      y: any;
    }[];
  }[],
  transactionIndex: number,
  dataIndex: number
) => {
  let bottom = 0;
  for (let i = 0; i < transactionIndex; i++) {
    const { data } = arr[i];
    const value = data[dataIndex].y;
    if (value) bottom += Number(toDecimal(value));
  }
  return bottom;
};

const stackTransactions = (
  transactions: { transaction: Transaction; data: any }[]
) => {
  let maxValue = 0;
  const transactionStack = transactions.map((item, transactionIndex) => {
    const stacked = item.data.map((d, i) => {
      const stack = {
        date: d.date,
        height: d?.y ? Number(toDecimal(d.y)) : 0,
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
