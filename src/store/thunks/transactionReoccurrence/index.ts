import Big from 'big.js';
import parseISO from 'date-fns/fp/parseISO/index.js';
import addDays from 'date-fns/fp/addDays/index.js';
import addMonths from 'date-fns/fp/addMonths/index.js';
import setDate from 'date-fns/fp/setDate/index.js';
import addQuarters from 'date-fns/fp/addQuarters/index.js';
import addYears from 'date-fns/fp/addYears/index.js';
import isAfter from 'date-fns/fp/isAfter/index.js';
import isBefore from 'date-fns/fp/isBefore/index.js';
import getDay from 'date-fns/fp/getDay/index.js';
import differenceInCalendarDays from 'date-fns/fp/differenceInDays/index.js';
import differenceInCalendarMonths from 'date-fns/fp/differenceInCalendarMonths/index.js';
import differenceInCalendarYears from 'date-fns/fp/differenceInCalendarYears/index.js';

export const nextTransaction = (rtype) => {
  switch (rtype) {
    case 'none':
      return transactionNoReoccur;
    case 'day':
      return transactionDailyReoccur;
    case 'day of week':
      return transactionDayOfWeekReoccur;
    case 'day of month':
      return transactionDayOfMonthReoccur;
    case 'bimonthy':
      return transactionBimonthlyReoccur;
    case 'quarterly':
      return transactionQuarterlyReoccur;
    case 'semiannually':
      return transactionSemiannuallyReoccur;
    case 'annually':
      return transactionAnnuallyReoccur;
    default:
      return transactionNoReoccur;
  }
};

export const transactionCompute = ({ transaction }) => {
  switch (transaction.rtype) {
    case 'none':
      return transactionNoReoccurCompute({ transaction });
    case 'day':
      return transactionDailyReoccurCompute({ transaction });
    case 'day of week':
      return transactionDayOfWeekReoccurCompute({ transaction });
    case 'day of month':
      return transactionDayOfMonthReoccurCompute({ transaction });
    case 'bimonthy':
      return transactionBimonthlyReoccurCompute({ transaction });
    case 'quarterly':
      return transactionQuarterlyReoccurCompute({ transaction });
    case 'semiannually':
      return transactionSemiannuallyReoccurCompute({ transaction });
    case 'annually':
      return transactionAnnuallyReoccurCompute({ transaction });
    default:
      return transactionNoReoccurCompute({ transaction });
  }
};

// when transaction.rtype === 'none'
const transactionNoReoccur = ({ transaction, seedDate }) => {
  if (!transaction.start) {
    throw new Error('transactionNoReoccur expects transaction.start');
  }

  if (!transaction.value) {
    throw new Error('transactionNoReoccur expects transaction.value');
  }

  return {
    date: parseISO(transaction.start),
    y: transaction.value
  };
};
const transactionNoReoccurCompute = ({ transaction }) => 0;

// when transaction.rtype === 'day'
const transactionDailyReoccur = ({ transaction, seedDate, occurrences }) => {
  console.log({ transaction, seedDate, occurrences });
  if (!transaction.value) {
    throw new Error('transactionDailyReoccur expects transaction.value');
  }

  if (!transaction.cycle) {
    throw new Error('transactionDailyReoccur expects transaction.cycle');
  }

  if (!occurrences) {
    throw new Error('transactionDailyReoccur expects occurrences');
  }

  // Finds how many days are between when this started and the date in question
  // the next date should be a multiple of the cycle, so divide by the cycle
  // then round up (0 decimal places, 3 round up) then multiply by cycle again
  // to give us the number of days to add to the transaction start date to
  // produce an occurence on/after the seedDate. If there are no occurrences
  // yet, we are looking for the first date and we want a date on/after the seedDate.
  // If we have any occurrences, then seedDate will actually be the date of the
  // last occurrences so we add the cycle to that to get the next occurence.
  const parsedStartDate = parseISO(transaction.start);
  const cycle = Big(differenceInCalendarDays(parsedStartDate)(seedDate))
    .div(transaction.cycle)
    .round(0, 3)
    .times(transaction.cycle)
    .plus(occurrences.eq(0) ? 0 : transaction.cycle);

  return {
    date: addDays(cycle)(parsedStartDate),
    y: transaction.value
  };
};
const transactionDailyReoccurCompute = ({ transaction }) =>
  transaction.value.div(transaction.cycle);

// when transaction.rtype === 'day of week'
const transactionDayOfWeekReoccur = ({
  transaction,
  seedDate,
  occurrences
}) => {
  if (!transaction.value) {
    throw new Error('transactionDayOfWeekReoccur expects transaction.value');
  }

  if (!transaction.cycle) {
    throw new Error('transactionDayOfWeekReoccur expects transaction.cycle');
  }

  if (!transaction.start) {
    throw new Error('transactionDayOfWeekReoccur expects transaction.start');
  }

  if (!occurrences) {
    throw new Error('transactionDayOfWeekReoccur expects occurrences');
  }

  // This adjusts the seedDate to the proper day of the week and
  // uses it as a "target". Then we figure out how many days to add
  // to the start date (so we reoccur based on the transaction start day)
  // by dividing by 7 days a week, rounding up and multiplying by 7.
  // This gives us an increment of weeks (in the form of days) to add
  // to the transaction start date that will return a day after the
  // seedDate and that lands on our required day of the week.

  const parsedStartDate = parseISO(transaction.start);
  const seedDay = getDay(seedDate);
  const startDay = getDay(parsedStartDate);
  const dayAdjust = transaction.cycle.gte(seedDay)
    ? transaction.cycle.minus(seedDay)
    : transaction.cycle.minus(seedDay).plus(7);

  const dayCycles = isBefore(seedDate)(parsedStartDate)
    ? Big(differenceInCalendarDays(parsedStartDate)(seedDate))
        .plus(dayAdjust)
        .div(7)
        .round(0, 3)
        .times(7)
    : transaction.cycle.gte(startDay)
      ? transaction.cycle.minus(startDay)
      : transaction.cycle.minus(startDay).plus(7);

  return {
    date: addDays(dayCycles)(parsedStartDate),
    y: transaction.value
  };
};
const transactionDayOfWeekReoccurCompute = ({ transaction }) =>
  transaction.value.div(7);

// when transaction.rtype === 'day of month'
const transactionDayOfMonthReoccur = ({
  transaction,
  seedDate,
  occurrences
}) => {
  if (!transaction.value) {
    throw new Error('transactionDayOfMonthReoccur expects transaction.value');
  }

  if (!transaction.cycle) {
    throw new Error('transactionDayOfMonthReoccur expects transaction.cycle');
  }

  if (!occurrences) {
    throw new Error('transactionDayOfMonthReoccur expects occurrences');
  }

  let monthlyDate;
  let isBeforeSeedDate = isBefore(seedDate);
  let cycleDate = setDate(transaction.cycle);
  if (
    isBeforeSeedDate(cycleDate(seedDate)) ||
    (!!occurrences && !occurrences.eq(0))
  ) {
    monthlyDate = cycleDate(addMonths(1)(seedDate));
  } else {
    monthlyDate = cycleDate(seedDate);
  }
  return {
    date: monthlyDate,
    y: transaction.value
  };
};
const transactionDayOfMonthReoccurCompute = ({ transaction }) =>
  transaction.value.div(30);

// when transaction.rtype === 'bimonthly'
const transactionBimonthlyReoccur = ({ transaction, seedDate }) => {
  if (!transaction.value) {
    throw new Error('transactionBimonthlyReoccur expects transaction.value');
  }

  if (!transaction.cycle) {
    throw new Error('transactionBimonthlyReoccur expects transaction.cycle');
  }

  return {
    date: addMonths(2 * transaction.cycle)(seedDate),
    y: transaction.value
  };
};
const transactionBimonthlyReoccurCompute = ({ transaction }) =>
  transaction.value.div(30).div(2);

// when transaction.rtype === 'quarterly'
const transactionQuarterlyReoccur = ({ transaction, seedDate }) => {
  if (!transaction.value) {
    throw new Error('transactionQuarterlyReoccur expects transaction.value');
  }

  if (!transaction.cycle) {
    throw new Error('transactionQuarterlyReoccur expects transaction.cycle');
  }

  return {
    date: addQuarters(transaction.cycle)(seedDate),
    y: transaction.value
  };
};
const transactionQuarterlyReoccurCompute = ({ transaction }) =>
  transaction.value.div(30).div(3);

// when transaction.rtype === 'semiannually'
const transactionSemiannuallyReoccur = ({
  transaction,
  seedDate,
  occurrences
}) => {
  if (!transaction.value) {
    throw new Error('transactionSemiannuallyReoccur expects transaction.value');
  }

  if (!transaction.start) {
    throw new Error('transactionSemiannuallyReoccur expects transaction.start');
  }

  if (!occurrences) {
    throw new Error('transactionSemiannuallyReoccur expects occurrences');
  }
  // Finds how many months are between when this started and the date in question
  // the next date should be a multiple of the 6 months, so divide by the 6
  // then round up (0 decimal places, 3 round up) then multiply by 6 again
  // to give us the number of months to add to the transaction start date to
  // produce an occurence on/after the seedDate. If there are no occurrences
  // yet, we are looking for the first date and we want a date on/after the seedDate.
  // If we have any occurrences, then seedDate will actually be the date of the
  // last occurrences so we add 6 to that to get the next occurence.
  const parsedStartDate = parseISO(transaction.start);
  const monthDifference = Big(
    differenceInCalendarMonths(parsedStartDate)(seedDate)
  )
    .div(6)
    .round(0, 3)
    .times(6)
    .plus(occurrences.eq(0) ? 0 : 6);
  const afterSeed = isAfter(seedDate);
  const increment = afterSeed(addMonths(monthDifference)(parsedStartDate))
    ? 0
    : 6;

  return {
    date: addMonths(monthDifference.plus(increment))(parsedStartDate),
    y: transaction.value
  };
};
const transactionSemiannuallyReoccurCompute = ({ transaction }) =>
  transaction.value.div(182.5);

// when transaction.rtype === 'annually'
const transactionAnnuallyReoccur = ({ transaction, seedDate, occurrences }) => {
  if (!transaction.value) {
    throw new Error('transactionAnnuallyReoccur expects transaction.value');
  }

  if (!transaction.start) {
    throw new Error('transactionAnnuallyReoccur expects transaction.start');
  }

  if (!occurrences) {
    throw new Error('transactionAnnuallyReoccur expects occurrences');
  }

  // Finds how many months are between when this started and the date in question
  // then round up (0 decimal places, 3 round up) to give us the number of years
  // to add to the transaction start date to produce an occurence on/after
  // the seedDate. If there are no occurrences yet, we are looking for
  // the first date and we want a date on/after the seedDate. If we have
  // any occurrences, then seedDate will actually be the date of the
  // last occurrences so we add 1 to that to get the next occurence.
  const parsedStartDate = parseISO(transaction.start);
  const yearDifference = Big(
    differenceInCalendarYears(parsedStartDate)(seedDate)
  )
    .round(0, 3)
    .plus(occurrences.eq(0) ? 0 : 1);

  return {
    date: addYears(yearDifference)(parsedStartDate),
    y: transaction.value
  };
};
const transactionAnnuallyReoccurCompute = ({ transaction }) =>
  transaction.value.div(365);
