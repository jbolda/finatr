import { parseISO, isSameDay, isWithinInterval, addDays } from 'date-fns';
import eachDayOfInterval from 'date-fns/fp/eachDayOfInterval/index.js';
import { toDecimal, type Dinero } from 'dinero.js';
import { createSelector } from 'starfx';

import { schema, Transaction } from '../schema';
import { nextTransaction } from '../thunks/transactionReoccurrence';

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
      const nextTransactionFn = nextTransaction(transaction.rtype);
      const { date, occurred: occurredInSeed } = findSeed({
        transaction,
        y: transaction.value,
        // back off one day to start outside the interval
        date: parseISO(transaction.start),
        nextTransactionFn,
        interval: chartRange,
        occurred: 0
      });
      return { ...transaction, seedDate: date, occurredInSeed };
    })
);

export const chartableData = createSelector(
  eachDay,
  transactionsWithSeed,
  (allDates, transactions) => {
    return transactions.map((transaction) => {
      const { data, allTransactionEvents } = resolveBarChartData({
        transaction,
        allDates
      });
      return { transaction, data, allTransactionEvents };
    });
  }
);

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
    console.log({ incomeStacked });
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

export function resolveBarChartData({
  allDates,
  transaction
}: {
  allDates: Date[];
  transaction: any;
}) {
  const nextTransactionFn = nextTransaction(transaction.rtype);

  const allTransactionEvents = [] as Date[];
  const next = {
    transaction,
    occurrences: transaction.occurrences,
    date: transaction.seedDate,
    nextY: transaction.value
  };
  let occurred = transaction.occurredInSeed - 1; // we will capture once instance on first loop
  const stack = allDates.map((day) => {
    let y = null;
    if (
      isSameDay(day, next.date) &&
      (transaction.occurrences === 0 || occurred < transaction.occurrences)
    ) {
      allTransactionEvents.push(day);
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
      occurred += 1;
    }
    return { date: day, y };
  });

  return { data: stack, allTransactionEvents };
}

export const findSeed = ({
  nextTransactionFn,
  transaction,
  date,
  y,
  interval,
  occurred
}: {
  nextTransactionFn: any;
  transaction: any;
  date: Date;
  y: Dinero<number>;
  interval: Interval;
  occurred: number;
}): { date: Date; nextY: Dinero<number>; occurred: number } => {
  // a transaction function has to run and mark an occurenace to have found the seed date
  //  so we don't blindly use the transaction start date as the seed except for daily as
  //  the start date dictates the start of a cycle
  if (
    isWithinInterval(date, interval) &&
    (occurred !== 0 || transaction.rtype === 'day')
  )
    return { date, nextY: y, occurred };
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
    date: isSameDay(date, nextDate) ? addDays(nextDate, 1) : nextDate,
    occurred: occurred + 1
  });
};
