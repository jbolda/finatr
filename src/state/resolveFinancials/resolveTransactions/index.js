import Big from 'big.js';
import dateMax from 'date-fns/fp/max';
import dateMin from 'date-fns/fp/min';
import isWithinInterval from 'date-fns/fp/isWithinInterval';
import addDays from 'date-fns/fp/addDays';
import addMonths from 'date-fns/fp/addMonths';
import setDate from 'date-fns/fp/setDate';
import addQuarters from 'date-fns/fp/addQuarters';
import addYears from 'date-fns/fp/addYears';
import isSameDay from 'date-fns/fp/isSameDay';
import isAfter from 'date-fns/fp/isAfter';
import isBefore from 'date-fns/fp/isBefore';
import getDay from 'date-fns/fp/getDay';

const computeTransactionModifications = (transactions, graphRange) =>
  transactions.reduce((modifications, transaction) => {
    let transactionInterval = convertRangeToInterval(transaction, graphRange);
    // early return if end is before start, we will have no modifications
    if (isBefore(transactionInterval.start)(transactionInterval.end)) return [];

    return modifications.concat(
      generateModification(
        transaction,
        transactionInterval,
        transactionInterval.start,
        [],
        Big(0),
        Big(0),
        Big(0)
      )
    );
  }, []);

export default computeTransactionModifications;

const convertRangeToInterval = (transaction, graphRange) => ({
  start: dateMax([
    graphRange.start,
    !!transaction && transaction.start ? transaction.start : 0
  ]),
  end: dateMin([
    graphRange.end,
    !!transaction && transaction.end
      ? transaction.end
      : addDays(365)(new Date())
  ])
});

export { convertRangeToInterval };

const generateModification = (
  transaction,
  transactionInterval,
  prevDate,
  modifications,
  visibleOccurrences,
  generatedOccurrences,
  potentiallyVisibleOccurrences
) => {
  if (!transaction) {
    throw new Error('generateModification expects transaction');
  }

  if (!prevDate) {
    throw new Error('generateModification expects prevDate');
  }

  let modification = nextModification(transaction.rtype)({
    transaction: transaction,
    seedDate: prevDate,
    visibleOccurrences: visibleOccurrences,
    generatedOccurrences: generatedOccurrences
  });
  modification.mutateKey = transaction.id;

  // if this is a modification we should use then add it to the list
  // and generate the next one
  if (
    isWithinInterval(transactionInterval)(modification.date) &&
    (isAfter(prevDate)(modification.date) ||
      isSameDay(prevDate)(modification.date)) &&
    hasNotHitNumberOfOccurrences(
      transaction,
      visibleOccurrences,
      generatedOccurrences
    ) &&
    Big(generatedOccurrences).lte(365)
  ) {
    if (checkVisibility(transaction, potentiallyVisibleOccurrences))
      modifications.push(modification);
    generateModification(
      transaction,
      transactionInterval,
      modification.date,
      modifications,
      Big(visibleOccurrences).add(1),
      Big(generatedOccurrences).add(1),
      Big(potentiallyVisibleOccurrences).add(1)
    );

    // this isn't a modification we want because it is before
    //  our graph starts, but we need to keep generating to confirm
    // that none of the future ones fall within our graphRange
  } else if (
    isBefore(transactionInterval.end)(modification.date) &&
    (isAfter(prevDate)(modification.date) ||
      (generatedOccurrences.eq(0) && isSameDay(prevDate)(modification.date))) &&
    Big(generatedOccurrences).lte(365)
  ) {
    generateModification(
      transaction,
      transactionInterval,
      modification.date,
      modifications,
      visibleOccurrences,
      generatedOccurrences.add(1),
      potentiallyVisibleOccurrences
    );
  }
  return modifications;
};

export { generateModification };

const hasNotHitNumberOfOccurrences = (
  transaction,
  visibleOccurrences,
  generatedOccurrences
) =>
  ((!!transaction && !transaction.visibleOccurrences) ||
    Big(visibleOccurrences)
      .add(1)
      .lte(transaction.visibleOccurrences)) &&
  ((!!transaction && !transaction.generatedOccurrences) ||
    Big(generatedOccurrences)
      .add(1)
      .lte(transaction.generatedOccurrences)) &&
  ((!!transaction && !transaction.beginAfterGeneratedOccurrences) ||
    Big(generatedOccurrences)
      .add(1)
      .gt(transaction.beginAfterGeneratedOccurrences));

const checkVisibility = (transaction, potentiallyVisibleOccurrences) =>
  (!!transaction && !transaction.beginAfterVisibleOccurrences) ||
  Big(potentiallyVisibleOccurrences)
    .add(1)
    .gt(transaction.beginAfterVisibleOccurrences);

const nextModification = rtype => {
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
    date: transaction.start,
    y: transaction.value
  };
};
const transactionNoReoccurCompute = ({ transaction }) =>
  transaction.dailyRate.set(0);

// when transaction.rtype === 'day'
const transactionDailyReoccur = ({
  transaction,
  seedDate,
  generatedOccurrences
}) => {
  if (!transaction.value) {
    throw new Error('transactionDailyReoccur expects transaction.value');
  }

  if (!transaction.cycle) {
    throw new Error('transactionDailyReoccur expects transaction.cycle');
  }

  if (!generatedOccurrences) {
    console.log(generatedOccurrences);
    throw new Error('transactionDailyReoccur expects generatedOccurrences');
  }

  let cycle = generatedOccurrences.eq(0) ? 0 : transaction.cycle;
  return {
    date: addDays(cycle)(seedDate),
    y: transaction.value
  };
};
const transactionDailyReoccurCompute = ({ transaction }) =>
  transaction.dailyRate.set(
    transaction.value.state.div(transaction.cycle.state)
  );

// when transaction.rtype === 'day of week'
const transactionDayOfWeekReoccur = ({ transaction, seedDate }) => {
  if (!transaction.value) {
    throw new Error('transactionDayOfWeekReoccur expects transaction.value');
  }

  if (!transaction.cycle) {
    throw new Error('transactionDayOfWeekReoccur expects transaction.cycle');
  }

  return {
    date: addDays(7 + getDay(seedDate) - transaction.cycle)(seedDate),
    y: transaction.value
  };
};
const transactionDayOfWeekReoccurCompute = ({ transaction }) =>
  transaction.dailyRate.set(transaction.value.state.div(7));

// when transaction.rtype === 'day of month'
const transactionDayOfMonthReoccur = ({
  transaction,
  seedDate,
  generatedOccurrences
}) => {
  if (!transaction.value) {
    throw new Error('transactionDayOfMonthReoccur expects transaction.value');
  }

  if (!transaction.cycle) {
    throw new Error('transactionDayOfMonthReoccur expects transaction.cycle');
  }

  if (!generatedOccurrences) {
    throw new Error(
      'transactionDayOfMonthReoccur expects generatedOccurrences'
    );
  }

  let monthlyDate;
  let isBeforeSeedDate = isBefore(seedDate);
  let cycleDate = setDate(transaction.cycle);
  if (
    isBeforeSeedDate(cycleDate(seedDate)) ||
    (!!generatedOccurrences && !generatedOccurrences.eq(0))
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
const transactionSemiannuallyReoccur = ({ transaction, seedDate }) => {
  if (!transaction.value) {
    throw new Error('transactionSemiannuallyReoccur expects transaction.value');
  }

  return {
    date: addMonths(6)(seedDate),
    y: transaction.value
  };
};
const transactionSemiannuallyReoccurCompute = ({ transaction }) =>
  transaction.dailyRate.set(transaction.value.state.div(182.5));

// when transaction.rtype === 'annually'
const transactionAnnuallyReoccur = ({ transaction, seedDate }) => {
  if (!transaction.value) {
    throw new Error('transactionAnnuallyReoccur expects transaction.value');
  }

  return {
    date: addYears(1)(seedDate),
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
