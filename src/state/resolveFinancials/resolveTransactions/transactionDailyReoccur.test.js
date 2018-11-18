import Big from 'big.js';
import startOfDay from 'date-fns/fp/startOfDay';
import differenceInCalendarDays from 'date-fns/fp/differenceInDays';
import getDate from 'date-fns/fp/getDate';
import getMonth from 'date-fns/fp/getMonth';

import { transactionDailyReoccur } from './index.js';

describe(`check transactionDailyReoccur`, () => {
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
    start: startOfDay('2018-01-01'),
    end: startOfDay('2018-02-01')
  };
  let seedDate = graphRange.start;
  let generatedOccurrences = Big(1);
  it(`has all the correct properties`, () => {
    let resolvedTestData = transactionDailyReoccur({
      transaction,
      seedDate,
      generatedOccurrences
    });
    expect(resolvedTestData).toHaveProperty('date');
    expect(resolvedTestData).toHaveProperty('y');
  });

  it(`returns the correct first date`, () => {
    let resolvedTestData = transactionDailyReoccur({
      transaction,
      seedDate,
      generatedOccurrences
    });
    expect(getMonth(resolvedTestData.date)).toBe(0);
    expect(getDate(resolvedTestData.date)).toBe(2);
  });

  it(`returns a cycle of 1`, () => {
    let testData = { ...transaction, cycle: Big(1) };
    let resolvedTestData = transactionDailyReoccur({
      transaction: testData,
      seedDate,
      generatedOccurrences
    });
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(1);
  });

  it(`returns a cycle of 3`, () => {
    let testData = { ...transaction, cycle: Big(3) };
    let resolvedTestData = transactionDailyReoccur({
      transaction: testData,
      seedDate,
      generatedOccurrences
    });
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(3);
  });

  it(`returns a cycle of 5`, () => {
    let testData = { ...transaction, cycle: Big(5) };
    let resolvedTestData = transactionDailyReoccur({
      transaction: testData,
      seedDate,
      generatedOccurrences
    });
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(5);
  });

  it(`returns a cycle of 14`, () => {
    let testData = { ...transaction, cycle: Big(14) };
    let resolvedTestData = transactionDailyReoccur({
      transaction: testData,
      seedDate,
      generatedOccurrences
    });
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(14);
  });
});
