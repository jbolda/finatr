import { isSameDay, isWithinInterval, addDays } from 'date-fns';
import { type Dinero } from 'dinero.js';

import { nextTransaction } from '../thunks/transactionReoccurrence';

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

export function extrapolateTransactionOccurrences({
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
