import { takeLatest } from 'starfx';
import { schema } from '../schema';
import { transactionAdd } from './transactions';
import { nextTransaction } from './transactionReoccurrence';
import Big from 'big.js';

import eachDayOfInterval from 'date-fns/fp/eachDayOfInterval/index.js';
import { parse } from 'date-fns';
import { isSameDay, isWithinInterval, addYears } from 'date-fns';
import makeUUID from '../utils/makeUUID';

function* watchTransactions() {
  const takeType = `@@starfx/${transactionAdd}`;
  yield* takeLatest(takeType, function* (action) {
    if (action.type === `@@starfx/${transactionAdd}`) {
      // @ts-expect-error
      const transaction = action.payload.options;
      // can we pull this from the original `schema.update()` transaction?
      transaction.value = new Big(transaction.value);
      transaction.cycle = new Big(transaction.cycle);
      transaction.occurrences = new Big(transaction.occurrences);

      try {
        const start = parse(transaction.start, 'yyyy-MM-dd', new Date());
        const end =
          transaction.end && transaction.end !== ''
            ? parse(transaction.end, 'yyyy-MM-dd', new Date())
            : addYears(start, 1);

        const graphRange = {
          start,
          end
        };
        console.log({ transaction });
        const data = yield* resolveBarChartData({
          transaction,
          graphRange
        });

        const chartBarDataID = makeUUID();
        yield* schema.update(
          schema.chartBarData.add({
            [chartBarDataID]: {
              id: chartBarDataID,
              transactionID: transaction.id,
              data
            }
          })
        );
      } catch (error) {
        console.error(error);
      }
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
      console.log(day, isSameDay(day, next.date), next);
      y = next.nextY;

      const { date, y: calculatedY } = nextTransactionFn({
        ...next,
        seedDate: next.date
      });
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
