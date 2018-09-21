import startOfDay from 'date-fns/fp/startOfDay';
import differenceInCalendarDays from 'date-fns/fp/differenceInDays';
import addDays from 'date-fns/fp/addDays';
import subDays from 'date-fns/fp/subDays';

import {
  transactionNoReoccur,
  transactionDailyReoccur,
  transactionDayOfWeekReoccur,
  transactionDayOfMonthReoccur,
  transactionBimonthlyReoccur,
  transactionQuarterlyReoccur,
  transactionSemiannuallyReoccur,
  transactionAnnuallyReoccur
} from './resolveTransactions.js';

describe(`check transactionNoReoccur`, () => {
  const transaction = {
    id: `oasidjas1`,
    raccount: `account`,
    description: `description`,
    category: `test default`,
    type: `income`,
    start: `2018-03-22`,
    rtype: `none`,
    cycle: 0,
    value: 150
  };
  let graphRange = {
    start: startOfDay('2018-01-01'),
    end: startOfDay('2018-02-01')
  };

  it(`has all the correct properties`, () => {
    let resolvedTestData = transactionNoReoccur(transaction, graphRange.start);
    expect(resolvedTestData).toHaveProperty('date');
    expect(resolvedTestData).toHaveProperty('y');
    expect(resolvedTestData).toHaveProperty('dailyRate');
  });

  it(`returns the same date`, () => {
    let resolvedTestData = transactionNoReoccur(transaction, graphRange.start);
    expect(
      differenceInCalendarDays(transaction.start)(resolvedTestData.date)
    ).toBe(0);
  });
});

describe(`check transactionDailyReoccur`, () => {
  const transaction = {
    id: `oasidjas1`,
    raccount: `account`,
    description: `description`,
    category: `test default`,
    type: `income`,
    start: `2018-03-22`,
    rtype: `day`,
    cycle: 1,
    value: 150
  };
  let graphRange = {
    start: startOfDay('2018-01-01'),
    end: startOfDay('2018-02-01')
  };

  it(`has all the correct properties`, () => {
    let resolvedTestData = transactionDailyReoccur(
      transaction,
      graphRange.start
    );
    expect(resolvedTestData).toHaveProperty('date');
    expect(resolvedTestData).toHaveProperty('y');
    expect(resolvedTestData).toHaveProperty('dailyRate');
  });

  it(`returns a cycle of 1`, () => {
    let testData = { ...transaction, cycle: 1 };
    let resolvedTestData = transactionDailyReoccur(testData, graphRange.start);
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(1);
  });

  it(`returns a cycle of 3`, () => {
    let testData = { ...transaction, cycle: 3 };
    let resolvedTestData = transactionDailyReoccur(testData, graphRange.start);
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(3);
  });

  it(`returns a cycle of 5`, () => {
    let testData = { ...transaction, cycle: 5 };
    let resolvedTestData = transactionDailyReoccur(testData, graphRange.start);
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(5);
  });

  it(`returns a cycle of 14`, () => {
    let testData = { ...transaction, cycle: 14 };
    let resolvedTestData = transactionDailyReoccur(testData, graphRange.start);
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(14);
  });
});

describe(`check transactionDayOfMonthReoccur`, () => {
  const transaction = {
    id: `oasidjas1`,
    raccount: `account`,
    description: `description`,
    category: `test default`,
    type: `income`,
    start: `2018-03-22`,
    rtype: `day of month`,
    cycle: 1,
    value: 150
  };
  let graphRange = {
    start: startOfDay('2018-01-16'),
    end: startOfDay('2018-04-01')
  };

  it(`has all the correct properties`, () => {
    let resolvedTestData = transactionDayOfMonthReoccur(
      transaction,
      graphRange.start
    );
    expect(resolvedTestData).toHaveProperty('date');
    expect(resolvedTestData).toHaveProperty('y');
    expect(resolvedTestData).toHaveProperty('dailyRate');
  });

  it(`returns a cycle for 1st of next month`, () => {
    let testData = { ...transaction, cycle: 1 };
    let resolvedTestData = transactionDayOfMonthReoccur(
      testData,
      graphRange.start
    );
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(16);
  });

  it(`returns a cycle for the 18th of current month`, () => {
    let testData = { ...transaction, cycle: 18 };
    let resolvedTestData = transactionDayOfMonthReoccur(
      testData,
      graphRange.start
    );
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(2);
  });

  it(`returns a cycle for the 15th of next month`, () => {
    let testData = { ...transaction, cycle: 15 };
    let resolvedTestData = transactionDayOfMonthReoccur(
      testData,
      graphRange.start
    );
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(30);
  });

  it(`returns a cycle for the current day`, () => {
    let testData = { ...transaction, cycle: 16 };
    let resolvedTestData = transactionDayOfMonthReoccur(
      testData,
      graphRange.start
    );
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(0);
  });
});
