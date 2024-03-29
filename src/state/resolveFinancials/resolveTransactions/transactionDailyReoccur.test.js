import { test, expect } from '@playwright/experimental-ct-react17';
import Big from 'big.js';
import parseISO from 'date-fns/fp/parseISO/index.js';
import startOfDay from 'date-fns/fp/startOfDay/index.js';
import differenceInCalendarDays from 'date-fns/fp/differenceInDays/index.js';
import getDate from 'date-fns/fp/getDate/index.js';
import getMonth from 'date-fns/fp/getMonth/index.js';

import { transactionDailyReoccur } from './index.js';
import { convertRangeToInterval } from './index.js';

test.describe(`check transactionDailyReoccur`, () => {
  const transaction = {
    id: `oasidjas1`,
    raccount: `account`,
    description: `description`,
    category: `test default`,
    type: `income`,
    start: `2018-03-22`,
    rtype: `day`,
    cycle: Big(1),
    value: Big(150)
  };
  let graphRange = {
    start: startOfDay(parseISO('2018-03-01')),
    end: startOfDay(parseISO('2018-06-01'))
  };
  let interval = convertRangeToInterval(transaction, graphRange);
  let seedDate = interval.start;

  test(`has all the correct properties`, () => {
    let resolvedTestData = transactionDailyReoccur({
      transaction,
      seedDate,
      occurrences: Big(0)
    });
    expect(resolvedTestData).toHaveProperty('date');
    expect(resolvedTestData).toHaveProperty('y');
  });

  test(`returns the correct first date`, () => {
    let resolvedTestData = transactionDailyReoccur({
      transaction,
      seedDate,
      occurrences: Big(0)
    });
    // where January = 0, 20XX-03-22 will be Month = 2
    expect(getMonth(resolvedTestData.date)).toBe(2);
    expect(getDate(resolvedTestData.date)).toBe(22);
  });

  test(`returns a cycle of 1`, () => {
    let testData = { ...transaction, cycle: Big(1) };
    // difference should be 1 + 21 days between the start of the graph range
    // and when the first transaction is produced

    let resolvedTestData = transactionDailyReoccur({
      transaction: testData,
      seedDate,
      occurrences: Big(0)
    });
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(21);

    let secondIteration = transactionDailyReoccur({
      transaction: testData,
      seedDate: resolvedTestData.date,
      occurrences: Big(1)
    });
    expect(
      differenceInCalendarDays(parseISO(transaction.start))(
        secondIteration.date
      )
    ).toBe(1);
  });

  test(`returns a cycle of 3`, () => {
    let testData = { ...transaction, cycle: Big(3) };
    // difference should be 3 + 21 days between the start of the graph range
    // and when the first transaction is produced

    let resolvedTestData = transactionDailyReoccur({
      transaction: testData,
      seedDate,
      occurrences: Big(0)
    });
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(21);

    let secondIteration = transactionDailyReoccur({
      transaction: testData,
      seedDate: resolvedTestData.date,
      occurrences: Big(1)
    });
    expect(
      differenceInCalendarDays(parseISO(transaction.start))(
        secondIteration.date
      )
    ).toBe(3);
  });

  test(`returns a cycle of 5`, () => {
    let testData = { ...transaction, cycle: Big(5) };
    // difference should be 5 + 21 days between the start of the graph range
    // and when the first transaction is produced

    let resolvedTestData = transactionDailyReoccur({
      transaction: testData,
      seedDate,
      occurrences: Big(0)
    });
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(21);

    let secondIteration = transactionDailyReoccur({
      transaction: testData,
      seedDate: resolvedTestData.date,
      occurrences: Big(1)
    });
    expect(
      differenceInCalendarDays(parseISO(transaction.start))(
        secondIteration.date
      )
    ).toBe(5);
  });

  test(`returns a cycle of 14`, () => {
    let testData = { ...transaction, cycle: Big(14) };
    // difference should be 14 + 21 days between the start of the graph range
    // and when the first transaction is produced

    let resolvedTestData = transactionDailyReoccur({
      transaction: testData,
      seedDate,
      occurrences: Big(0)
    });
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(21);

    let secondIteration = transactionDailyReoccur({
      transaction: testData,
      seedDate: resolvedTestData.date,
      occurrences: Big(1)
    });
    expect(
      differenceInCalendarDays(parseISO(transaction.start))(
        secondIteration.date
      )
    ).toBe(14);
  });
});
