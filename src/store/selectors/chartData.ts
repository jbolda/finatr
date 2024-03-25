import Big from 'big.js';
import { isSameDay, isWithinInterval, addDays } from 'date-fns';
import eachDayOfInterval from 'date-fns/fp/eachDayOfInterval/index.js';
import { createSelector } from 'starfx/store';

import { schema } from '../schema';
import { nextTransaction } from '../thunks/transactionReoccurrence';

export const barChartTransactions = createSelector(
  schema.chartRange.select,
  schema.transactions.selectTableAsList,
  (graphRange, transactions) => {
    const allChartData = transactions.map((transaction) => {
      const data = resolveBarChartData({
        transaction,
        graphRange
      });
      return { transaction, data };
    });
    const income = allChartData.filter((d) => d.transaction.type === 'income');
    const expenses = allChartData.filter(
      (d) => d.transaction.type === 'expense'
    );

    const getInitialY = (
      arr: {
        transaction: (typeof transactions)[0];
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
        if (value) bottom += value.toNumber();
      }
      return bottom;
    };

    let maxValue = 0;
    const incomeStacked = income.map((item, transactionIndex) => {
      const stacked = item.data.map((d, i) => {
        const stack = {
          date: d.date,
          height: d?.y ? d.y.toNumber() : 0,
          y0: getInitialY(income, transactionIndex, i)
        };
        // side effect: find max chart value
        if (stack.y0 + stack.height > maxValue)
          maxValue = stack.y0 + stack.height;
        return stack;
      });
      return { ...item, stacked };
    });
    const expensesStacked = expenses.map((item, transactionIndex) => {
      const stacked = item.data.map((d, i) => {
        const stack = {
          date: d.date,
          height: d?.y ? d.y.toNumber() : 0,
          y0: getInitialY(expenses, transactionIndex, i)
        };
        // side effect: find max chart value
        if (stack.y0 + stack.height > maxValue)
          maxValue = stack.y0 + stack.height;
        return stack;
      });
      return { ...item, stacked };
    });

    return { data: incomeStacked.concat(expensesStacked), max: maxValue };
  }
);

function resolveBarChartData({
  graphRange,
  transaction
}: {
  graphRange: any;
  transaction: any;
}) {
  const allDates = eachDayOfInterval(graphRange);
  const nextTransactionFn = nextTransaction(transaction.rtype);

  const { date, nextY } = findSeed({
    transaction,
    y: transaction.value,
    // back off one day to start outside the interval
    date: addDays(graphRange.start, -1),
    nextTransactionFn,
    interval: graphRange
  });
  const next = {
    transaction,
    occurrences: transaction.occurrences,
    date,
    nextY
  };
  const stack = allDates.map((day) => {
    let y = null;
    if (isSameDay(day, next.date)) {
      y = next.nextY;

      const { date, y: calculatedY } = nextTransactionFn({
        ...next,
        seedDate: addDays(next.date, 1)
      });
      if (isSameDay(date, next.date))
        throw new Error(
          'same date, recursive calc, we should not hit this error'
        );
      // save data for next value
      next.nextY = calculatedY;
      next.date = date;
    }
    return { date: day, y };
  });

  return stack;
}

const findSeed = ({
  nextTransactionFn,
  transaction,
  date,
  y,
  interval
}: {
  nextTransactionFn: any;
  transaction: any;
  date: Date;
  y: typeof Big;
  interval: Interval;
}) => {
  if (isWithinInterval(date, interval)) return { date, nextY: y };
  const { date: nextDate, y: nextY } = nextTransactionFn({
    transaction,
    seedDate: date,
    occurrences: transaction.occurrences
  });
  return findSeed({
    nextTransactionFn,
    transaction,
    interval,
    y: nextY,
    // to avoid getting stuck generating the same day over and over
    date: isSameDay(date, nextDate) ? addDays(nextDate, 1) : nextDate
  });
};
