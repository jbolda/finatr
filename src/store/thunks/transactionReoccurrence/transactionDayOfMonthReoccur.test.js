import { USD } from '@dinero.js/currencies';
import { test, expect } from '@playwright/experimental-ct-react17';
import differenceInCalendarDays from 'date-fns/fp/differenceInDays/index.js';
import eachDayOfInterval from 'date-fns/fp/eachDayOfInterval/index.js';
import parseISO from 'date-fns/fp/parseISO/index.js';
import startOfDay from 'date-fns/fp/startOfDay/index.js';
import { dinero } from 'dinero.js';

import { nextTransaction } from '../../thunks/transactionReoccurrence';
import {
  extrapolateTransactionOccurrences,
  findSeed
} from '../../utils/extrapolateDates.ts';
import { transactionDayOfMonthReoccur } from './index.ts';

const addSeedDate = (transaction, chartRange) => {
  const nextTransactionFn = nextTransaction(transaction.rtype);

  const { date, occurred: occurredInSeed } = findSeed({
    transaction,
    y: transaction.value,
    date: parseISO(transaction.start),
    nextTransactionFn,
    interval: chartRange,
    occurred: 0
  });
  return { ...transaction, seedDate: date, occurredInSeed };
};

test.describe(`check transactionDayOfMonthReoccur`, () => {
  const transaction = {
    id: `check transactionDayOfMonthReoccur`,
    raccount: `account`,
    description: `description`,
    category: `test default`,
    type: `expense`,
    start: `2018-03-22`,
    rtype: `day of month`,
    cycle: 1,
    value: dinero({ amount: 150, currency: USD })
  };
  let chartRange = {
    start: startOfDay(parseISO('2018-01-16')),
    end: startOfDay(parseISO('2018-04-01'))
  };
  let seedDate = chartRange.start;
  let occurrences = 0;

  test(`has all the correct properties`, () => {
    let resolvedTestData = transactionDayOfMonthReoccur({
      transaction,
      seedDate,
      occurrences
    });
    expect(resolvedTestData).toHaveProperty('date');
    expect(resolvedTestData).toHaveProperty('y');
  });

  test(`returns a cycle for 1st of next month`, () => {
    let testData = { ...transaction, cycle: 1 };
    let resolvedTestData = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate,
      occurrences
    });
    expect(
      differenceInCalendarDays(chartRange.start)(resolvedTestData.date)
    ).toBe(16);
  });

  test(`returns a cycle for the 18th of current month`, () => {
    let testData = { ...transaction, cycle: 18 };
    let resolvedTestData = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate,
      occurrences
    });
    expect(differenceInCalendarDays(seedDate)(resolvedTestData.date)).toBe(2);
  });

  test(`returns a cycle for the 15th of next month`, () => {
    let testData = { ...transaction, cycle: 15 };
    let resolvedTestData = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate,
      occurrences
    });
    expect(differenceInCalendarDays(seedDate)(resolvedTestData.date)).toBe(30);
  });

  test(`returns a cycle for the current day`, () => {
    let testData = { ...transaction, cycle: 16 };
    let resolvedTestData = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate,
      occurrences
    });
    expect(differenceInCalendarDays(seedDate)(resolvedTestData.date)).toBe(0);
  });

  test(`returns progressive cycle with correct dates`, () => {
    let testData = { ...transaction, cycle: 16 };
    let resolvedTestData1 = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate,
      occurrences: 0
    });
    let resolvedTestData2 = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate: resolvedTestData1.date,
      occurrences: 1
    });
    let resolvedTestData3 = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate: resolvedTestData2.date,
      occurrences: 2
    });
    let resolvedTestData4 = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate: resolvedTestData3.date,
      occurrences: 3
    });
    let resolvedTestData5 = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate: resolvedTestData4.date,
      occurrences: 4
    });
    expect(
      differenceInCalendarDays(chartRange.start)(resolvedTestData1.date)
    ).toBe(0);
    expect(
      differenceInCalendarDays(chartRange.start)(resolvedTestData2.date)
    ).toBe(31);
    expect(
      differenceInCalendarDays(chartRange.start)(resolvedTestData3.date)
    ).toBe(59);
    expect(
      differenceInCalendarDays(chartRange.start)(resolvedTestData4.date)
    ).toBe(90);
    expect(
      differenceInCalendarDays(chartRange.start)(resolvedTestData5.date)
    ).toBe(120);
  });

  test(`returns correct number of modifications for range`, () => {
    let testData = addSeedDate(
      {
        ...transaction,
        start: '2018-01-16',
        cycle: 17,
        occurrences
      },
      chartRange
    );
    let resolvedTestData = extrapolateTransactionOccurrences({
      allDates: eachDayOfInterval(chartRange),
      transaction: testData
    });
    expect(resolvedTestData.data.filter((t) => t.y)).toHaveLength(3);
  });

  test(`returns correct number of modifications if start and cycle are the same`, () => {
    let testRange = {
      start: startOfDay(parseISO('2018-01-16')),
      end: startOfDay(parseISO('2018-08-01'))
    };
    let testData = addSeedDate(
      {
        id: 'the-id',
        raccount: 'checking',
        description: 'Electric',
        category: 'Living',
        type: 'expense',
        start: '2017-08-22',
        rtype: 'day of month',
        cycle: 22,
        value: dinero({ amount: 150, currency: USD }),
        occurrences
      },
      testRange
    );
    let resolvedTestData1 = extrapolateTransactionOccurrences({
      allDates: eachDayOfInterval(testRange),
      transaction: testData
    });
    expect(resolvedTestData1.data.filter((t) => t.y)).toHaveLength(7);
  });

  test(`returns correct number of modifications based on generated occurrences`, () => {
    let testRange = {
      start: chartRange.start,
      end: startOfDay(parseISO('2018-12-01'))
    };
    let testData1 = addSeedDate(
      {
        ...transaction,
        id: `${transaction.id} genOc`,
        start: '2018-01-14',
        cycle: 17,
        occurrences: 1
      },
      testRange
    );

    let resolvedTestData1 = extrapolateTransactionOccurrences({
      allDates: eachDayOfInterval(testRange),
      transaction: testData1
    });
    expect(resolvedTestData1.data.filter((t) => t.y)).toHaveLength(1);

    let testData2 = { ...testData1, occurrences: 2 };
    let resolvedTestData2 = extrapolateTransactionOccurrences({
      allDates: eachDayOfInterval(testRange),
      transaction: testData2
    });
    expect(resolvedTestData2.data.filter((t) => t.y)).toHaveLength(2);
  });

  test(`returns correct number of modifications based on visible occurrences`, () => {
    let testRange = {
      start: chartRange.start,
      end: startOfDay(parseISO('2018-12-01'))
    };
    let testData1 = addSeedDate(
      {
        ...transaction,
        start: '2018-01-16',
        cycle: 17,
        occurrences: 1
      },
      testRange
    );

    let resolvedTestData1 = extrapolateTransactionOccurrences({
      allDates: eachDayOfInterval(testRange),
      transaction: testData1
    });
    expect(resolvedTestData1.data.filter((t) => t.y)).toHaveLength(1);

    let testData2 = { ...testData1, occurrences: 2 };
    let resolvedTestData2 = extrapolateTransactionOccurrences({
      allDates: eachDayOfInterval(testRange),
      transaction: testData2
    });
    expect(resolvedTestData2.data.filter((t) => t.y)).toHaveLength(2);
  });
});
