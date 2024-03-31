import { test, expect } from '@playwright/experimental-ct-react17';
import Big from 'big.js';
import differenceInCalendarDays from 'date-fns/fp/differenceInDays/index.js';
import parseISO from 'date-fns/fp/parseISO/index.js';
import startOfDay from 'date-fns/fp/startOfDay/index.js';

import { resolveBarChartData } from '../../selectors/chartData.ts';
import { transactionDayOfMonthReoccur } from './index.ts';

test.describe(`check transactionDayOfMonthReoccur`, () => {
  const transaction = {
    id: `check transactionDayOfMonthReoccur`,
    raccount: `account`,
    description: `description`,
    category: `test default`,
    type: `expense`,
    start: `2018-03-22`,
    rtype: `day of month`,
    cycle: Big(1),
    value: Big(150)
  };
  let graphRange = {
    start: startOfDay(parseISO('2018-01-16')),
    end: startOfDay(parseISO('2018-04-01'))
  };
  let seedDate = graphRange.start;
  let occurrences = Big(0);

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
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(16);
  });

  test(`returns a cycle for the 18th of current month`, () => {
    let testData = { ...transaction, cycle: Big(18) };
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
      occurrences: Big(0)
    });
    let resolvedTestData2 = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate: resolvedTestData1.date,
      occurrences: Big(1)
    });
    let resolvedTestData3 = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate: resolvedTestData2.date,
      occurrences: Big(2)
    });
    let resolvedTestData4 = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate: resolvedTestData3.date,
      occurrences: Big(3)
    });
    let resolvedTestData5 = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate: resolvedTestData4.date,
      occurrences: Big(4)
    });
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData1.date)
    ).toBe(0);
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData2.date)
    ).toBe(31);
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData3.date)
    ).toBe(59);
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData4.date)
    ).toBe(90);
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData5.date)
    ).toBe(120);
  });

  test(`returns correct number of modifications for range`, () => {
    let testData = {
      ...transaction,
      start: '2018-01-16',
      cycle: Big(17),
      occurrences
    };
    let resolvedTestData = resolveBarChartData({
      graphRange,
      transaction: testData
    });
    expect(resolvedTestData.filter((t) => t.y)).toHaveLength(3);
  });

  test(`returns correct number of modifications if start and cycle are the same`, () => {
    let testData = {
      id: 'the-id',
      raccount: 'checking',
      description: 'Electric',
      category: 'Living',
      type: 'expense',
      start: '2017-08-22',
      rtype: 'day of month',
      cycle: Big(22),
      value: Big(150),
      occurrences
    };
    let testRange = {
      start: startOfDay(parseISO('2018-01-16')),
      end: startOfDay(parseISO('2018-08-01'))
    };
    let resolvedTestData1 = resolveBarChartData({
      graphRange: testRange,
      transaction: testData
    });
    expect(resolvedTestData1.filter((t) => t.y)).toHaveLength(7);
  });

  test(`returns correct number of modifications based on generated occurrences`, () => {
    let testData1 = {
      ...transaction,
      id: `${transaction.id} genOc`,
      start: '2018-01-14',
      cycle: Big(17),
      occurrences: Big(1)
    };
    let testRange = {
      start: graphRange.start,
      end: startOfDay(parseISO('2018-12-01'))
    };

    let resolvedTestData1 = resolveBarChartData({
      graphRange: testRange,
      transaction: testData1
    });
    expect(resolvedTestData1.filter((t) => t.y)).toHaveLength(1);

    let testData2 = { ...testData1, occurrences: Big(2) };
    let resolvedTestData2 = resolveBarChartData({
      graphRange: testRange,
      transaction: testData2
    });
    expect(resolvedTestData2.filter((t) => t.y)).toHaveLength(2);
  });

  test(`returns correct number of modifications based on visible occurrences`, () => {
    let testData1 = {
      ...transaction,
      start: '2018-01-16',
      cycle: Big(17),
      occurrences: Big(1)
    };
    let testRange = {
      start: graphRange.start,
      end: startOfDay(parseISO('2018-12-01'))
    };

    let resolvedTestData1 = resolveBarChartData({
      graphRange: testRange,
      transaction: testData1
    });
    expect(resolvedTestData1.filter((t) => t.y)).toHaveLength(1);

    let testData2 = { ...testData1, occurrences: Big(2) };
    let resolvedTestData2 = resolveBarChartData({
      graphRange: testRange,
      transaction: testData2
    });
    expect(resolvedTestData2.filter((t) => t.y)).toHaveLength(2);
  });
});