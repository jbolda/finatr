import Big from 'big.js';
import { parse } from 'date-fns';
import { isSameDay, isWithinInterval, addYears, addDays } from 'date-fns';
import eachDayOfInterval from 'date-fns/fp/eachDayOfInterval/index.js';
import { takeLatest } from 'starfx';
import { select } from 'starfx/store';

import { schema } from '../schema';
import makeUUID from '../utils/makeUUID';
import { thunks } from './foundation.ts';
import { nextTransaction } from './transactionReoccurrence';
import { transactionAdd } from './transactions';

export const updateChartDateRange = thunks.create(
  'chartDateRange:update',
  function* (ctx, next) {
    const startDateInput = ctx.payload;
    const start = parse(startDateInput, 'yyyy-MM-dd', new Date());
    const end = addYears(start, 1);

    yield* schema.update(schema.chartBarRange.set({ start, end }));

    yield* next();
  }
);

function* watchTransactions() {
  const takeType = `${transactionAdd}`;
  yield* takeLatest(takeType, function* (action) {
    try {
      // @ts-expect-error
      const transaction = action.payload.options;
      // TODO can we pull this from the original `schema.update()` transaction?
      transaction.value = new Big(transaction?.value ?? 0);
      transaction.cycle = new Big(transaction?.cycle ?? 0);
      transaction.occurrences = new Big(transaction?.occurrences ?? 0);

      const { start, end } = yield* select(schema.chartBarRange.select);
      const graphRange = { start, end };
      const data = yield* resolveBarChartData({
        transaction,
        graphRange
      });

      const previousChartData = yield* select(
        schema.chartBarData.selectTableAsList
      );

      const chartBarDataID = makeUUID();
      const nextTransaction = { id: chartBarDataID, transaction, data };

      const allChartData = previousChartData.concat(nextTransaction);
      const income = allChartData.filter(
        (d) => d.transaction.type === 'income'
      );
      const expenses = allChartData.filter(
        (d) => d.transaction.type === 'expense'
      );

      const getInitialY = (
        arr: { id: string }[],
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
      const incomeStacked = income.reduce((all, item, transactionIndex) => {
        all[item.id] = item;
        all[item.id].stacked = item.data.map((d, i) => {
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
        return all;
      }, {});
      const expensesStacked = expenses.reduce((all, item, transactionIndex) => {
        all[item.id] = item;
        all[item.id].stacked = item.data.map((d, i) => {
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
        return all;
      }, {});

      yield* schema.update([
        schema.chartBarData.set({ ...incomeStacked, ...expensesStacked }),
        schema.chartBarMax.set(maxValue)
      ]);
    } catch (error) {
      console.error(error);
    }
  });
}

export const tasks = [watchTransactions];

function* resolveBarChartData({
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
