import dateMax from 'date-fns/fp/max';
import dateMin from 'date-fns/fp/min';
import isWithinInterval from 'date-fns/fp/isWithinInterval';
import addDays from 'date-fns/fp/addDays';
import subDays from 'date-fns/fp/subDays';
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

    let coercePaybacksIntoTransactions = Array.isArray(transaction)
      ? transaction
      : [transaction];

    return modifications.concat(
      coercePaybacksIntoTransactions.reduce(
        (nestedMods, coercedTransactions) => {
          return nestedMods.concat(
            generateModification(
              coercedTransactions,
              transactionInterval,
              coercedTransactions.start,
              [],
              0,
              0
            )
          );
        },
        []
      )
    );
  }, []);

export default computeTransactionModifications;

const convertRangeToInterval = (transaction, graphRange) => ({
  start: subDays(1)(
    dateMax([
      graphRange.start,
      !!transaction && transaction.start ? transaction.start : 0
    ])
  ),
  end: addDays(1)(
    dateMin([
      graphRange.end,
      !!transaction && transaction.end
        ? transaction.end
        : addDays(365)(new Date())
    ])
  )
});

export { convertRangeToInterval };

const generateModification = (
  transaction,
  transactionInterval,
  prevDate,
  modifications,
  visibleOccurrences,
  generatedOccurences
) => {
  let modification = nextModification(transaction.rtype)({
    transaction: transaction,
    seedDate: prevDate,
    visibleOccurences: visibleOccurrences,
    generatedOccurences: generatedOccurences
  });
  modification.mutateKey = transaction.id;

  // if this is a modification we should use then add it to the list
  // and generate the next one
  if (
    isWithinInterval(transactionInterval)(modification.date) &&
    isAfter(prevDate)(modification.date) &&
    hasNotHitNumberOfOccurences(
      transaction,
      visibleOccurrences,
      generatedOccurences
    ) &&
    generatedOccurences < 365
  ) {
    modifications.push(modification);
    generateModification(
      transaction,
      transactionInterval,
      modification.date,
      modifications,
      visibleOccurrences + 1,
      generatedOccurences + 1
    );

    // this isn't a modification we want because it is before
    //  our graph starts, but we need to keep generating to confirm
    // that none of the future ones fall within our graphRange
  } else if (
    isBefore(transactionInterval.end)(modification.date) &&
    (isAfter(prevDate)(modification.date) ||
      (generatedOccurences === 0 && isSameDay(prevDate)(modification.date))) &&
    generatedOccurences < 365
  ) {
    generateModification(
      transaction,
      transactionInterval,
      modification.date,
      modifications,
      visibleOccurrences,
      generatedOccurences + 1
    );
  }
  return modifications;
};

export { generateModification };

const hasNotHitNumberOfOccurences = (
  transaction,
  visibleOccurrences,
  generatedOccurences
) =>
  ((!!transaction && !transaction.visibleOccurrences) ||
    visibleOccurrences + 1 <= transaction.visibleOccurrences) &&
  ((!!transaction && !transaction.generatedOccurences) ||
    generatedOccurences + 1 <= transaction.generatedOccurences);

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

// when transaction.rtype === 'none'
const transactionNoReoccur = ({ transaction, seedDate }) => {
  return {
    date: transaction.start,
    y: transaction.value,
    dailyRate: transaction.value
  };
};

// when transaction.rtype === 'day'
const transactionDailyReoccur = ({ transaction, seedDate }) => {
  return {
    date: addDays(transaction.cycle)(seedDate),
    y: transaction.value,
    dailyRate: transaction.value / transaction.cycle
  };
};

// when transaction.rtype === 'day of week'
const transactionDayOfWeekReoccur = ({ transaction, seedDate }) => {
  return {
    date: addDays(7 + getDay(seedDate) - transaction.cycle)(seedDate),
    y: transaction.value,
    dailyRate: transaction.value / 7
  };
};

// when transaction.rtype === 'day of month'
const transactionDayOfMonthReoccur = ({
  transaction,
  seedDate,
  generatedOccurences
}) => {
  let monthlyDate;
  let isBeforeSeedDate = isBefore(seedDate);
  let cycleDate = setDate(transaction.cycle);
  if (isBeforeSeedDate(cycleDate(seedDate)) || generatedOccurences !== 0) {
    monthlyDate = cycleDate(addMonths(1)(seedDate));
  } else {
    monthlyDate = cycleDate(seedDate);
  }
  return {
    date: monthlyDate,
    y: transaction.value,
    dailyRate: transaction.value / 30
  };
};

// when transaction.rtype === 'bimonthly'
const transactionBimonthlyReoccur = ({ transaction, seedDate }) => {
  return {
    date: setDate(transaction.cycle)(addMonths(2)(seedDate)),
    y: transaction.value,
    dailyRate: transaction.value / 30 / 2
  };
};

// when transaction.rtype === 'quarterly'
const transactionQuarterlyReoccur = ({ transaction, seedDate }) => {
  return {
    date: addQuarters(transaction.cycle)(seedDate),
    y: transaction.value,
    dailyRate: transaction.value / 30 / 3
  };
};

// when transaction.rtype === 'semiannually'
const transactionSemiannuallyReoccur = ({ transaction, seedDate }) => {
  return {
    date: addYears(0.5)(seedDate),
    y: transaction.value,
    dailyRate: transaction.value / 180
  };
};

// when transaction.rtype === 'annually'
const transactionAnnuallyReoccur = ({ transaction, seedDate }) => {
  if (!transaction || !transaction.value) {
    throw new Error("transactionAnnuallyReoccur expects { transaction }")
  }

  if (!seedDate) {
    throw new Error("transactionAnnuallyReoccur expects { seedDate }")
  }

  return {
    date: addYears(1)(seedDate),
    y: transaction.value,
    dailyRate: transaction.value / 365
  };
};

export {
  transactionNoReoccur,
  transactionDailyReoccur,
  transactionDayOfWeekReoccur,
  transactionDayOfMonthReoccur,
  transactionBimonthlyReoccur,
  transactionQuarterlyReoccur,
  transactionSemiannuallyReoccur,
  transactionAnnuallyReoccur
};
