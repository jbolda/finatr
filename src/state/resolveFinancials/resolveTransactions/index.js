import Big from 'big.js';
import parseISO from 'date-fns/fp/parseISO/index.js';
import dateMax from 'date-fns/fp/max/index.js';
import dateMin from 'date-fns/fp/min/index.js';
import isWithinInterval from 'date-fns/fp/isWithinInterval/index.js';
import addDays from 'date-fns/fp/addDays/index.js';
import addMonths from 'date-fns/fp/addMonths/index.js';
import setDate from 'date-fns/fp/setDate/index.js';
import addQuarters from 'date-fns/fp/addQuarters/index.js';
import addYears from 'date-fns/fp/addYears/index.js';
import isSameDay from 'date-fns/fp/isSameDay/index.js';
import isAfter from 'date-fns/fp/isAfter/index.js';
import isBefore from 'date-fns/fp/isBefore/index.js';
import getDay from 'date-fns/fp/getDay/index.js';
import differenceInCalendarDays from 'date-fns/fp/differenceInDays/index.js';
import differenceInCalendarMonths from 'date-fns/fp/differenceInCalendarMonths/index.js';
import differenceInCalendarYears from 'date-fns/fp/differenceInCalendarYears/index.js';

const computeTransactionModifications = (transactions, graphRange) =>
  transactions.reduce((modifications, transaction) => {
    try {
      let transactionInterval = convertRangeToInterval(transaction, graphRange);

      // and if the value is positive, generate the necessary mods
      return modifications.concat(
        generateModification(
          transaction,
          transactionInterval,
          transactionInterval.start,
          [],
          Big(0),
          Big(0)
        )
      );
    } catch (e) {
      // early return if end is before start, we will have no modifications
      // we will RangeError if this happens and catch
      return [];
    }
  }, []);

export default computeTransactionModifications;

const convertRangeToInterval = (transaction, graphRange) => {
  const startDate = dateMax([
    graphRange.start,
    !!transaction && transaction.start ? parseISO(transaction.start) : 0
  ]);
  // the endDate always has to be equal to or after startDate
  const endDate = dateMin([
    graphRange.end,
    !!transaction && transaction.end
      ? parseISO(transaction.end)
      : addDays(365)(new Date())
  ]);

  return {
    start: startDate,
    end: endDate
  };
};

export { convertRangeToInterval };

const generateModification = (
  transaction,
  transactionInterval,
  prevDate,
  modifications,
  actualOccurrences,
  potentialOccurrences
) => {
  if (!transaction) {
    throw new Error('generateModification expects transaction');
  }

  if (!prevDate) {
    throw new Error('generateModification expects prevDate');
  }

  let modification = nextModification(transaction.rtype)({
    transaction,
    seedDate: prevDate,
    occurrences: potentialOccurrences
  });
  modification.mutateKey = transaction.id;

  // if this is a modification we should use then add it to the list
  // and generate the next one
  if (
    isWithinInterval(transactionInterval)(modification.date) &&
    (isAfter(prevDate)(modification.date) ||
      isSameDay(prevDate)(modification.date)) &&
    hasNotHitNumberOfOccurrences(transaction, actualOccurrences) &&
    actualOccurrences.lte(365)
  ) {
    let visibleOccurrences = 0;
    if (checkVisibility(transaction, potentialOccurrences)) {
      modifications.push(modification);
      visibleOccurrences = 1;
    }
    generateModification(
      transaction,
      transactionInterval,
      modification.date,
      modifications,
      actualOccurrences.add(visibleOccurrences),
      potentialOccurrences.add(1)
    );
  }

  return modifications;
};

export { generateModification };

const hasNotHitNumberOfOccurrences = (transaction, actualOccurrences) =>
  (!!transaction && !transaction.occurrences) ||
  Big(actualOccurrences).add(1).lte(transaction.occurrences);

const checkVisibility = (transaction, potentialOccurrences) =>
  (!!transaction && !transaction.beginAfterOccurrences) ||
  Big(potentialOccurrences).add(1).gt(transaction.beginAfterOccurrences);

const nextModification = (rtype) => {
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

const transactionCompute = ({ transaction }) => {
  switch (transaction.rtype.state) {
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
const transactionNoReoccurCompute = ({ transaction }) =>
  transaction.dailyRate.set(0);

// when transaction.rtype === 'day'
const transactionDailyReoccur = ({ transaction, seedDate, occurrences }) => {
  if (!transaction.value) {
    throw new Error('transactionDailyReoccur expects transaction.value');
  }

  if (!transaction.cycle) {
    throw new Error('transactionDailyReoccur expects transaction.cycle');
  }

  if (!occurrences) {
    throw new Error('transactionDailyReoccur expects occurrences');
  }

  // Finds the how many days are between when this started and the date in question
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
  transaction.dailyRate.set(
    transaction.value.state.div(transaction.cycle.state)
  );

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
  transaction.dailyRate.set(transaction.value.state.div(7));

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
  transaction.dailyRate.set(transaction.value.state.div(30));

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
  transaction.dailyRate.set(transaction.value.state.div(30).div(2));

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
  transaction.dailyRate.set(transaction.value.state.div(30).div(3));

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
  transaction.dailyRate.set(transaction.value.state.div(182.5));

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
  transaction.dailyRate.set(transaction.value.state.div(365));

export {
  transactionNoReoccur,
  transactionDailyReoccur,
  transactionDayOfWeekReoccur,
  transactionDayOfMonthReoccur,
  transactionBimonthlyReoccur,
  transactionQuarterlyReoccur,
  transactionSemiannuallyReoccur,
  transactionAnnuallyReoccur,
  transactionCompute,
  transactionNoReoccurCompute,
  transactionDailyReoccurCompute,
  transactionDayOfWeekReoccurCompute,
  transactionDayOfMonthReoccurCompute,
  transactionBimonthlyReoccurCompute,
  transactionQuarterlyReoccurCompute,
  transactionSemiannuallyReoccurCompute,
  transactionAnnuallyReoccurCompute
};
