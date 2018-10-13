import startOfDay from 'date-fns/fp/startOfDay';
import differenceInCalendarDays from 'date-fns/fp/differenceInDays';

import computeTransactionModifications, {
  convertRangeToInterval,
  generateModification,
  hasNotHitNumberOfOccurences,
  transactionNoReoccur,
  transactionDailyReoccur,
  transactionDayOfWeekReoccur,
  transactionDayOfMonthReoccur,
  transactionBimonthlyReoccur,
  transactionQuarterlyReoccur,
  transactionSemiannuallyReoccur,
  transactionAnnuallyReoccur
} from './resolveTransactions.js';

describe(`check convertRangeToInterval`, () => {
  it(`returns range start shifted forward`, () => {
    const transaction = { start: `2018-03-22` };
    let graphRange = {
      start: startOfDay('2018-01-01'),
      end: startOfDay('2018-06-01')
    };
    let interval = convertRangeToInterval(transaction, graphRange);
    expect(interval.start).toEqual(startOfDay('2018-03-21'));
    expect(interval.end).toEqual(startOfDay('2018-06-02'));
  });

  it(`returns range start before`, () => {
    const transaction = { start: `2017-08-01` };
    let graphRange = {
      start: startOfDay('2018-01-15'),
      end: startOfDay('2018-06-01')
    };
    let interval = convertRangeToInterval(transaction, graphRange);
    expect(interval.start).toEqual(startOfDay('2018-01-14'));
    expect(interval.end).toEqual(startOfDay('2018-06-02'));
  });

  it(`returns range end shifted back`, () => {
    const transaction = { start: `2018-03-22`, end: '2018-05-02' };
    let graphRange = {
      start: startOfDay('2018-01-01'),
      end: startOfDay('2018-06-01')
    };
    let interval = convertRangeToInterval(transaction, graphRange);
    expect(interval.start).toEqual(startOfDay('2018-03-21'));
    expect(interval.end).toEqual(startOfDay('2018-05-03'));
  });

  it(`returns range end after`, () => {
    const transaction = { start: `2017-08-22`, end: '2018-08-02' };
    let graphRange = {
      start: startOfDay('2018-01-15'),
      end: startOfDay('2018-06-01')
    };
    let interval = convertRangeToInterval(transaction, graphRange);
    expect(interval.start).toEqual(startOfDay('2018-01-14'));
    expect(interval.end).toEqual(startOfDay('2018-06-02'));
  });
});

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
  let seedDate = graphRange.start;
  it(`has all the correct properties`, () => {
    let resolvedTestData = transactionNoReoccur({ transaction, seedDate });
    expect(resolvedTestData).toHaveProperty('date');
    expect(resolvedTestData).toHaveProperty('y');
    expect(resolvedTestData).toHaveProperty('dailyRate');
  });

  it(`returns the same date`, () => {
    let resolvedTestData = transactionNoReoccur({ transaction, seedDate });
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
  let seedDate = graphRange.start;
  it(`has all the correct properties`, () => {
    let resolvedTestData = transactionDailyReoccur({ transaction, seedDate });
    expect(resolvedTestData).toHaveProperty('date');
    expect(resolvedTestData).toHaveProperty('y');
    expect(resolvedTestData).toHaveProperty('dailyRate');
  });

  it(`returns a cycle of 1`, () => {
    let testData = { ...transaction, cycle: 1 };
    let resolvedTestData = transactionDailyReoccur({
      transaction: testData,
      seedDate: seedDate
    });
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(1);
  });

  it(`returns a cycle of 3`, () => {
    let testData = { ...transaction, cycle: 3 };
    let resolvedTestData = transactionDailyReoccur({
      transaction: testData,
      seedDate: seedDate
    });
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(3);
  });

  it(`returns a cycle of 5`, () => {
    let testData = { ...transaction, cycle: 5 };
    let resolvedTestData = transactionDailyReoccur({
      transaction: testData,
      seedDate: seedDate
    });
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(5);
  });

  it(`returns a cycle of 14`, () => {
    let testData = { ...transaction, cycle: 14 };
    let resolvedTestData = transactionDailyReoccur({
      transaction: testData,
      seedDate: seedDate
    });
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(14);
  });
});

describe(`check transactionDayOfMonthReoccur`, () => {
  const transaction = {
    id: `check transactionDayOfMonthReoccur`,
    raccount: `account`,
    description: `description`,
    category: `test default`,
    type: `expense`,
    start: `2018-03-22`,
    rtype: `day of month`,
    cycle: 1,
    value: 150
  };
  let graphRange = {
    start: startOfDay('2018-01-16'),
    end: startOfDay('2018-04-01')
  };
  let seedDate = graphRange.start;
  it(`has all the correct properties`, () => {
    let resolvedTestData = transactionDayOfMonthReoccur({
      transaction,
      seedDate
    });
    expect(resolvedTestData).toHaveProperty('date');
    expect(resolvedTestData).toHaveProperty('y');
    expect(resolvedTestData).toHaveProperty('dailyRate');
  });

  it(`returns a cycle for 1st of next month`, () => {
    let testData = { ...transaction, cycle: 1 };
    let resolvedTestData = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate: seedDate,
      generatedOccurences: 0
    });
    expect(
      differenceInCalendarDays(graphRange.start)(resolvedTestData.date)
    ).toBe(16);
  });

  it(`returns a cycle for the 18th of current month`, () => {
    let testData = { ...transaction, cycle: 18 };
    let resolvedTestData = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate: seedDate,
      generatedOccurences: 0
    });
    expect(differenceInCalendarDays(seedDate)(resolvedTestData.date)).toBe(2);
  });

  it(`returns a cycle for the 15th of next month`, () => {
    let testData = { ...transaction, cycle: 15 };
    let resolvedTestData = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate: seedDate,
      generatedOccurences: 0
    });
    expect(differenceInCalendarDays(seedDate)(resolvedTestData.date)).toBe(30);
  });

  it(`returns a cycle for the current day`, () => {
    let testData = { ...transaction, cycle: 16 };
    let resolvedTestData = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate: seedDate,
      generatedOccurences: 0
    });
    expect(differenceInCalendarDays(seedDate)(resolvedTestData.date)).toBe(0);
  });

  it(`returns progressive cycle with correct dates`, () => {
    let testData = { ...transaction, cycle: 16 };
    let resolvedTestData1 = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate: seedDate,
      generatedOccurences: 0
    });
    let resolvedTestData2 = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate: resolvedTestData1.date,
      generatedOccurences: 1
    });
    let resolvedTestData3 = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate: resolvedTestData2.date,
      generatedOccurences: 2
    });
    let resolvedTestData4 = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate: resolvedTestData3.date,
      generatedOccurences: 3
    });
    let resolvedTestData5 = transactionDayOfMonthReoccur({
      transaction: testData,
      seedDate: resolvedTestData4.date,
      generatedOccurences: 4
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

  it(`returns correct number of modifications for range`, () => {
    let testData = { ...transaction, start: graphRange.start, cycle: 17 };
    let resolvedTestData = generateModification(
      testData,
      graphRange,
      graphRange.start,
      [],
      0,
      0
    );
    expect(resolvedTestData).toHaveLength(3);
  });

  it(`returns correct number of modifications if start and cycle are the same`, () => {
    let testData = {
      id: 'the-id',
      raccount: 'checking',
      description: 'Electric',
      category: 'Living',
      type: 'expense',
      start: '2017-08-22',
      rtype: 'day of month',
      cycle: 22,
      value: 150
    };
    let testRange = {
      start: startOfDay('2018-01-16'),
      end: startOfDay('2018-08-01')
    };
    let testData1 = { ...testData, id: 'the-id1' };
    let resolvedTestData1 = generateModification(
      testData,
      testRange,
      testRange.start,
      [],
      0,
      0
    );
    expect(resolvedTestData1).toHaveLength(7);
    let testData2 = { ...testData, id: 'the-id2' };
    let resolvedTestData2 = computeTransactionModifications(
      [testData2],
      testRange
    );
    expect(resolvedTestData2).toHaveLength(7);
  });

  it(`returns correct number of modifications based on generated occurences`, () => {
    let testData1 = {
      ...transaction,
      start: graphRange.start,
      cycle: 17,
      generatedOccurences: 1
    };
    let testRange = { start: graphRange.start, end: '2018-12-01' };

    let resolvedTestData1 = generateModification(
      testData1,
      graphRange,
      graphRange.start,
      [],
      0,
      0
    );
    expect(resolvedTestData1).toHaveLength(1);

    let testData2 = { ...testData1, generatedOccurences: 2 };
    let resolvedTestData2 = generateModification(
      testData2,
      graphRange,
      graphRange.start,
      [],
      0,
      0
    );
    expect(resolvedTestData2).toHaveLength(2);
  });

  it(`returns correct number of modifications based on visible occurences`, () => {
    let testData1 = {
      ...transaction,
      start: graphRange.start,
      cycle: 17,
      visibleOccurrences: 1
    };
    let testRange = { start: graphRange.start, end: '2018-12-01' };

    let resolvedTestData1 = generateModification(
      testData1,
      graphRange,
      graphRange.start,
      [],
      0,
      0
    );
    expect(resolvedTestData1).toHaveLength(1);

    let testData2 = { ...testData1, visibleOccurrences: 2 };
    let resolvedTestData2 = generateModification(
      testData2,
      graphRange,
      graphRange.start,
      [],
      0,
      0
    );
    expect(resolvedTestData2).toHaveLength(2);
  });
});

describe('transactionAnnuallyReoccur', () => {
  it('has the next date', () => {
    const transaction = { value: 365 };
    const seedDate = startOfDay('2018-01-01');
    const next = transactionAnnuallyReoccur({transaction: transaction, seedDate: seedDate});
    expect(next.date).toEqual(startOfDay('2019-01-01'));
  });

  it('has a value', () => {
    const transaction = { value: 365 };
    const seedDate = startOfDay('2018-01-01');
    const next = transactionAnnuallyReoccur({transaction: transaction, seedDate: seedDate});
    expect(next.y).toEqual(365);
  });

  it('calculates the daily rate', () => {
    const transaction = { value: 365 };
    const seedDate = startOfDay('2018-01-01');
    const next = transactionAnnuallyReoccur({transaction: transaction, seedDate: seedDate});
    expect(next.dailyRate).toEqual(1);
  });

  it('handles floats for a daily rate', () => {
    const transaction = { value: 547.5 };
    const seedDate = startOfDay('2018-01-01');
    const next = transactionAnnuallyReoccur({transaction: transaction, seedDate: seedDate});
    expect(next.dailyRate).toEqual(1.5);
  });

  it('fails if transaction is null', () => {
    const seedDate = startOfDay('2018-01-01');
    expect(() => {
      transactionAnnuallyReoccur({ transaction: null, seedDate: seedDate });
    }).toThrow();
  })

  it('fails if seedDate is null', () => {
    const transaction = { value: 365 };
    expect(() => {
      transactionAnnuallyReoccur({ transaction: transaction, seedDate: null });
    }).toThrow();
  })
});
