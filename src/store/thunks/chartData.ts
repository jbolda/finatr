import { takeLatest, take } from 'starfx';
import { schema } from '../schema';
import { transactionAdd } from './transactions';
import { nextTransaction } from './transactionReoccurrence';
import Big from 'big.js';

import eachDayOfInterval from 'date-fns/fp/eachDayOfInterval/index.js';
import { parse } from 'date-fns';
import { isSameDay, isWithinInterval, addYears, addDays } from 'date-fns';
import makeUUID from '../utils/makeUUID';
import { select } from 'starfx/store';

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

      const start = parse(transaction.start, 'yyyy-MM-dd', new Date());
      const end =
        transaction.end && transaction.end !== ''
          ? parse(transaction.end, 'yyyy-MM-dd', new Date())
          : addYears(start, 1);

      const graphRange = {
        start,
        end
      };
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

      const incomeStacked = income.reduce((all, item, transactionIndex) => {
        all[item.id] = item;
        all[item.id].stacked = item.data.map((d, i) => ({
          date: d.date,
          height: d?.y ? d.y.toNumber() : 0,
          y: getInitialY(income, transactionIndex, i)
        }));
        return all;
      }, {});
      const expensesStacked = expenses.reduce((all, item, transactionIndex) => {
        all[item.id] = item;
        all[item.id].stacked = item.data.map((d, i) => ({
          date: d.date,
          height: d?.y ? d.y.toNumber() : 0,
          y: getInitialY(expenses, transactionIndex, i)
        }));
        return all;
      }, {});

      yield* schema.update(
        schema.chartBarData.set({ ...incomeStacked, ...expensesStacked })
      );
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
    date: graphRange.start,
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
        throw new Error('same date, recursive calc');
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
    date: nextDate
  });
};
