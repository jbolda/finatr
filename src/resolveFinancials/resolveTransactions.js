import dateMax from 'date-fns/fp/max';
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
import differenceInCalendarDays from 'date-fns/fp/differenceInCalendarDays';
import getDay from 'date-fns/fp/getDay';
import getDate from 'date-fns/fp/getDate';
import differenceInMonths from 'date-fns/fp/differenceInMonths';

const computeTransactionModifications = (transactions, graphRange) =>
  transactions.reduce((modifications, transaction) => {
    let transactionInterval = {
      start: subDays(1)(
        dateMax([graphRange.start, transaction.start ? transaction.start : 0])
      ),
      end: addDays(1)(
        dateMax([graphRange.end, transaction.end ? transaction.end : 0])
      )
    };
    return modifications.concat(
      generateModification(
        transaction,
        transactionInterval,
        transaction.start,
        [],
        0
      )
    );
  }, []);

export default computeTransactionModifications;

const generateModification = (
  transaction,
  transactionInterval,
  prevDate,
  modifications,
  occurrences
) => {
  let modification = nextModification(transaction.rtype)(transaction, prevDate);
  modification.mutateKey = transaction.id;

  // if this is a modification we should use then add it to the list
  // and generate the next one
  if (
    isWithinInterval(transactionInterval)(modification.date) &&
    isAfter(prevDate)(modification.date) &&
    (!transaction.occurrences || occurrences < transaction.occurrences) &&
    occurrences < 365
  ) {
    modifications.push(modification);
    generateModification(
      transaction,
      transactionInterval,
      modification.date,
      modifications,
      occurrences + 1
    );
    // this isn't a modification we want because it is before
    //  our graph starts, but we need to keep generating to confirm
    // that none of the future ones fall within our graphRange
  } else if (
    isBefore(transactionInterval.end)(modification.date) &&
    isAfter(prevDate)(modification.date) &&
    occurrences < 365
  ) {
    generateModification(
      transaction,
      transactionInterval,
      modification.date,
      modifications,
      occurrences
    );
  }
  return modifications;
};

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
const transactionNoReoccur = (transaction, seedDate) => {
  return {
    date: transaction.start,
    y: transaction.value,
    dailyRate: transaction.value
  };
};

// when transaction.rtype === 'day'
const transactionDailyReoccur = (transaction, seedDate) => {
  return {
    date: addDays(1)(seedDate),
    y: transaction.value,
    dailyRate: transaction.value / transaction.cycle
  };
};

// when transaction.rtype === 'day of week'
const transactionDayOfWeekReoccur = (transaction, seedDate) => {
  return {
    date: addDays(7 + getDay(seedDate) - transaction.cycle)(seedDate),
    y: transaction.value,
    dailyRate: transaction.value / 7
  };
};

// when transaction.rtype === 'day of month'
const transactionDayOfMonthReoccur = (transaction, seedDate) => {
  return {
    date: setDate(transaction.cycle)(addMonths(1)(seedDate)),
    y: transaction.value,
    dailyRate: transaction.value / 30
  };
};

// when transaction.rtype === 'bimonthly'
const transactionBimonthlyReoccur = (transaction, seedDate) => {
  return {
    date: setDate(transaction.cycle)(addMonths(2)(seedDate)),
    y: transaction.value,
    dailyRate: transaction.value / 30 / 2
  };
};

// when transaction.rtype === 'quarterly'
const transactionQuarterlyReoccur = (transaction, seedDate) => {
  return {
    date: addQuarters(transaction.cycle)(seedDate),
    y: transaction.value,
    dailyRate: transaction.value / 30 / 3
  };
};

// when transaction.rtype === 'semiannually'
const transactionSemiannuallyReoccur = (transaction, seedDate) => {
  return {
    date: addYears(0.5)(seedDate),
    y: transaction.value,
    dailyRate: transaction.value / 180
  };
};

// when transaction.rtype === 'annually'
const transactionAnnuallyReoccur = (transaction, seedDate) => {
  return {
    date: addYears(1)(seedDate),
    y: transaction.value,
    dailyRate: transaction.value / 365
  };
};

const stackObj = (day, data) => {
  let obj = {};
  obj.date = day;
  data.forEach(d => {
    let key = `${d.id ? d.id : d[0].id}`;
    obj[key] = Array.isArray(d) ? { ...d[0] } : { ...d };
    obj[key].y = 0;
    obj[key].dailyRate = 0;
    let transactions = Array.isArray(d) ? d : [d];

    transactions.forEach(d => {
      if (isSameDay(day)(d.start) && d.rtype === 'none') {
        obj[key].y += d.value;
        obj[key].dailyRate += 0;
      } else if (isAfter(day)(d.end) && d.end !== 'none') {
        obj[key].y += 0;
        obj[key].dailyRate += 0;
      } else if (
        d.rtype === 'day' &&
        d.cycle != null &&
        differenceInCalendarDays(day)(d.start) % d.cycle < 1
      ) {
        obj[key].y += d.value;
        obj[key].dailyRate += d.value / d.cycle;
      } else if (
        d.rtype === 'day of week' &&
        (isAfter(d.start)(day) || isSameDay(d.start)(day)) &&
        getDay(day) === d.cycle
      ) {
        obj[key].y += d.value;
        obj[key].dailyRate += d.value / 7;
      } else if (
        d.rtype === 'day of month' &&
        (isAfter(d.start)(day) || isSameDay(d.start)(day)) &&
        getDate(day) === d.cycle
      ) {
        obj[key].y += d.value;
        obj[key].dailyRate += d.value / 30;
      } else if (
        d.rtype === 'bimonthly' &&
        (isAfter(d.start)(day) || isSameDay(d.start)(day)) &&
        getDate(day) === d.cycle &&
        differenceInMonths(day)(d.start) % 2 === 0
      ) {
        obj[key].y += d.value;
        obj[key].dailyRate += d.value / 30 / 2;
      } else if (
        d.rtype === 'quarterly' &&
        (isAfter(d.start)(day) || isSameDay(d.start)(day)) &&
        getDate(day) === d.cycle &&
        differenceInMonths(day)(d.start) % 3 === 0
      ) {
        obj[key].y += d.value;
        obj[key].dailyRate += d.value / 30 / 3;
      } else if (
        d.rtype === 'semiannually' &&
        (isAfter(d.start)(day) || isSameDay(d.start)(day)) &&
        getDate(day) === d.cycle &&
        differenceInMonths(day)(d.start) % 6 === 0
      ) {
        obj[key].y += d.value;
        obj[key].dailyRate += d.value / 30 / 6;
      } else if (
        d.rtype === 'annually' &&
        (isAfter(d.start)(day) || isSameDay(d.start)(day)) &&
        getDate(day) === d.cycle &&
        differenceInMonths(day)(d.start) % 12 === 0
      ) {
        obj[key].y += d.value;
        obj[key].dailyRate += d.value / 365;
      }
    });
  });

  return obj;
};
