import { USD } from '@dinero.js/currencies';
import { test, expect } from '@playwright/experimental-ct-react17';
import differenceInCalendarDays from 'date-fns/fp/differenceInDays/index.js';
import getDate from 'date-fns/fp/getDate/index.js';
import getMonth from 'date-fns/fp/getMonth/index.js';
import parseISO from 'date-fns/fp/parseISO/index.js';
import startOfDay from 'date-fns/fp/startOfDay/index.js';
import { dinero } from 'dinero.js';

import { findSeed } from '../../selectors/chartData.ts';
import { transactionDailyReoccur } from './index.ts';

test.describe(`check transactionDailyReoccur`, () => {
  test.describe('transaction starts before interval', () => {
    const transaction = {
      id: `oasidjas1`,
      raccount: `account`,
      description: `description`,
      category: `test default`,
      type: `income`,
      start: `2018-03-22`,
      rtype: `day`,
      cycle: 1,
      occurrences: 0,
      value: dinero({ amount: 150, currency: USD })
    };
    let graphRange = {
      start: startOfDay(parseISO('2018-04-01')),
      end: startOfDay(parseISO('2018-06-01'))
    };

    test(`has all the correct properties`, () => {
      const seed = findSeed({
        nextTransactionFn: transactionDailyReoccur,
        transaction,
        date: parseISO(transaction.start),
        y: transaction.y,
        interval: graphRange,
        occurred: 0
      });

      let resolvedTestData = transactionDailyReoccur({
        transaction,
        seedDate: seed.date,
        occurrences: 0
      });
      expect(resolvedTestData).toHaveProperty('date');
      expect(resolvedTestData).toHaveProperty('y');
    });

    test(`seed is cycled start+interval`, () => {
      const seed = findSeed({
        nextTransactionFn: transactionDailyReoccur,
        transaction,
        date: parseISO(transaction.start),
        y: transaction.y,
        interval: graphRange,
        occurred: 0
      });

      // where January = 0, 20XX-04-01 will be Month = 3
      expect(getMonth(seed.date)).toBe(3);
      expect(getDate(seed.date)).toBe(1);
    });

    test(`returns the correct first date`, () => {
      const seed = findSeed({
        nextTransactionFn: transactionDailyReoccur,
        transaction,
        date: parseISO(transaction.start),
        y: transaction.y,
        interval: graphRange,
        occurred: 0
      });

      let resolvedTestData = transactionDailyReoccur({
        transaction,
        seedDate: seed.date,
        occurrences: 0
      });
      // where January = 0, 20XX-04-01 will be Month = 3
      expect(getMonth(resolvedTestData.date)).toBe(3);
      expect(getDate(resolvedTestData.date)).toBe(2);
    });

    test(`returns a cycle of 1`, () => {
      let testData = { ...transaction, cycle: 1 };
      const seed = findSeed({
        nextTransactionFn: transactionDailyReoccur,
        transaction: testData,
        date: parseISO(testData.start),
        y: testData.y,
        interval: graphRange,
        occurred: 0
      });

      // difference should be 1 + 21 days between the start of the graph range
      // and when the first transaction is produced
      let resolvedTestData = transactionDailyReoccur({
        transaction: testData,
        seedDate: seed.date,
        occurrences: 0
      });
      expect(getDate(resolvedTestData.date)).toBe(2);
      expect(
        differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
      ).toBe(1);

      let secondIteration = transactionDailyReoccur({
        transaction: testData,
        seedDate: resolvedTestData.date,
        occurrences: 1
      });
      expect(
        differenceInCalendarDays(resolvedTestData.date)(secondIteration.date)
      ).toBe(1);
    });

    test(`returns a cycle of 3`, () => {
      let testData = { ...transaction, cycle: 3 };
      const seed = findSeed({
        nextTransactionFn: transactionDailyReoccur,
        transaction: testData,
        date: parseISO(testData.start),
        y: testData.y,
        interval: graphRange,
        occurred: 0
      });

      // difference should be 3 + 21 days between the start of the graph range
      // and when the first transaction is produced
      let resolvedTestData = transactionDailyReoccur({
        transaction: testData,
        seedDate: seed.date,
        occurrences: 0
      });
      expect(getDate(resolvedTestData.date)).toBe(6);
      expect(
        differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
      ).toBe(6 - 1);

      let secondIteration = transactionDailyReoccur({
        transaction: testData,
        seedDate: resolvedTestData.date,
        occurrences: 1
      });
      expect(
        differenceInCalendarDays(resolvedTestData.date)(secondIteration.date)
      ).toBe(3);
    });

    test(`returns a cycle of 5`, () => {
      let testData = { ...transaction, cycle: 5 };
      const seed = findSeed({
        nextTransactionFn: transactionDailyReoccur,
        transaction: testData,
        date: parseISO(testData.start),
        y: testData.y,
        interval: graphRange,
        occurred: 0
      });

      // difference should be 5 + 21 days between the start of the graph range
      // and when the first transaction is produced
      let resolvedTestData = transactionDailyReoccur({
        transaction: testData,
        seedDate: seed.date,
        occurrences: 0
      });
      expect(getDate(resolvedTestData.date)).toBe(6);
      expect(
        differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
      ).toBe(6 - 1);

      let secondIteration = transactionDailyReoccur({
        transaction: testData,
        seedDate: resolvedTestData.date,
        occurrences: 1
      });
      expect(
        differenceInCalendarDays(resolvedTestData.date)(secondIteration.date)
      ).toBe(5);
    });

    test(`returns a cycle of 14`, () => {
      let testData = { ...transaction, cycle: 14 };
      const seed = findSeed({
        nextTransactionFn: transactionDailyReoccur,
        transaction: testData,
        date: parseISO(testData.start),
        y: testData.y,
        interval: graphRange,
        occurred: 0
      });

      // difference should be 14 + 21 days between the start of the graph range
      // and when the first transaction is produced
      let resolvedTestData = transactionDailyReoccur({
        transaction: testData,
        seedDate: seed.date,
        occurrences: 0
      });
      expect(getDate(resolvedTestData.date)).toBe(5 + 14);
      expect(
        differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
      ).toBe(19 - 1);

      let secondIteration = transactionDailyReoccur({
        transaction: testData,
        seedDate: resolvedTestData.date,
        occurrences: 1
      });
      expect(
        differenceInCalendarDays(resolvedTestData.date)(secondIteration.date)
      ).toBe(14);
    });
  });

  test.describe('transaction starts within interval', () => {
    const transaction = {
      id: `oasidjas1`,
      raccount: `account`,
      description: `description`,
      category: `test default`,
      type: `income`,
      start: `2018-03-22`,
      rtype: `day`,
      cycle: 1,
      occurrences: 0,
      value: dinero({ amount: 150, currency: USD })
    };
    let graphRange = {
      start: startOfDay(parseISO('2018-03-01')),
      end: startOfDay(parseISO('2018-06-01'))
    };

    test(`has all the correct properties`, () => {
      let resolvedTestData = transactionDailyReoccur({
        transaction,
        seedDate: graphRange.date,
        occurrences: 0
      });
      expect(resolvedTestData).toHaveProperty('date');
      expect(resolvedTestData).toHaveProperty('y');
    });

    test(`seed is start date`, () => {
      const seed = findSeed({
        nextTransactionFn: transactionDailyReoccur,
        transaction,
        date: parseISO(transaction.start),
        y: transaction.y,
        interval: graphRange,
        occurred: 0
      });

      // where January = 0, 20XX-03-22 will be Month = 2
      expect(getMonth(seed.date)).toBe(2);
      expect(getDate(seed.date)).toBe(22);
    });

    test(`returns the correct first date`, () => {
      const seed = findSeed({
        nextTransactionFn: transactionDailyReoccur,
        transaction,
        date: parseISO(transaction.start),
        y: transaction.y,
        interval: graphRange,
        occurred: 0
      });

      let resolvedTestData = transactionDailyReoccur({
        transaction,
        seedDate: seed.date,
        occurrences: 0
      });
      // where January = 0, 20XX-03-23 will be Month = 2
      expect(getMonth(resolvedTestData.date)).toBe(2);
      expect(getDate(resolvedTestData.date)).toBe(23);
    });

    test(`returns a cycle of 1`, () => {
      let testData = { ...transaction, cycle: 1 };
      const seed = findSeed({
        nextTransactionFn: transactionDailyReoccur,
        transaction: testData,
        date: parseISO(testData.start),
        y: testData.y,
        interval: graphRange,
        occurred: 0
      });

      // difference should be 1 + 21 days between the start of the graph range
      // and when the first transaction is produced
      let resolvedTestData = transactionDailyReoccur({
        transaction: testData,
        seedDate: seed.date,
        occurrences: 0
      });
      expect(getDate(resolvedTestData.date)).toBe(23);
      expect(
        differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
      ).toBe(1 + 21);

      let secondIteration = transactionDailyReoccur({
        transaction: testData,
        seedDate: resolvedTestData.date,
        occurrences: 1
      });
      expect(
        differenceInCalendarDays(resolvedTestData.date)(secondIteration.date)
      ).toBe(1);
    });

    test(`returns a cycle of 3`, () => {
      let testData = { ...transaction, cycle: 3 };
      const seed = findSeed({
        nextTransactionFn: transactionDailyReoccur,
        transaction: testData,
        date: parseISO(testData.start),
        y: testData.y,
        interval: graphRange,
        occurred: 0
      });

      // difference should be 3 + 21 days between the start of the graph range
      // and when the first transaction is produced
      let resolvedTestData = transactionDailyReoccur({
        transaction: testData,
        seedDate: seed.date,
        occurrences: 0
      });
      expect(getDate(resolvedTestData.date)).toBe(25);
      expect(
        differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
      ).toBe(3 + 21);

      let secondIteration = transactionDailyReoccur({
        transaction: testData,
        seedDate: resolvedTestData.date,
        occurrences: 1
      });
      expect(
        differenceInCalendarDays(resolvedTestData.date)(secondIteration.date)
      ).toBe(3);
    });

    test(`returns a cycle of 5`, () => {
      let testData = { ...transaction, cycle: 5 };
      const seed = findSeed({
        nextTransactionFn: transactionDailyReoccur,
        transaction: testData,
        date: parseISO(testData.start),
        y: testData.y,
        interval: graphRange,
        occurred: 0
      });

      // difference should be 5 + 21 days between the start of the graph range
      // and when the first transaction is produced
      let resolvedTestData = transactionDailyReoccur({
        transaction: testData,
        seedDate: seed.date,
        occurrences: 0
      });
      expect(getDate(resolvedTestData.date)).toBe(27);
      expect(
        differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
      ).toBe(5 + 21);

      let secondIteration = transactionDailyReoccur({
        transaction: testData,
        seedDate: resolvedTestData.date,
        occurrences: 1
      });
      expect(
        differenceInCalendarDays(resolvedTestData.date)(secondIteration.date)
      ).toBe(5);
    });

    test(`returns a cycle of 14`, () => {
      let testData = { ...transaction, cycle: 14 };
      const seed = findSeed({
        nextTransactionFn: transactionDailyReoccur,
        transaction: testData,
        date: parseISO(testData.start),
        y: testData.y,
        interval: graphRange,
        occurred: 0
      });

      // difference should be 14 + 21 days between the start of the graph range
      // and when the first transaction is produced
      let resolvedTestData = transactionDailyReoccur({
        transaction: testData,
        seedDate: seed.date,
        occurrences: 0
      });
      expect(getDate(resolvedTestData.date)).toBe(5);
      expect(
        differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
      ).toBe(14 + 21);

      let secondIteration = transactionDailyReoccur({
        transaction: testData,
        seedDate: resolvedTestData.date,
        occurrences: 1
      });
      expect(
        differenceInCalendarDays(resolvedTestData.date)(secondIteration.date)
      ).toBe(14);
    });
  });
});
