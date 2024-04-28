import { USD } from '@dinero.js/currencies';
import { test, expect } from '@playwright/experimental-ct-react17';
import differenceInCalendarDays from 'date-fns/fp/differenceInDays/index.js';
import parseISO from 'date-fns/fp/parseISO/index.js';
import startOfDay from 'date-fns/fp/startOfDay/index.js';
import { dinero } from 'dinero.js';

import { transactionNoReoccur } from './index.ts';

test.describe(`check transactionNoReoccur`, () => {
  const transaction = {
    id: `oasidjas1`,
    raccount: `account`,
    description: `description`,
    category: `test default`,
    type: `income`,
    start: `2018-03-22`,
    rtype: `none`,
    cycle: 0,
    value: dinero({ amount: 150, currency: USD })
  };
  let graphRange = {
    start: startOfDay(parseISO('2018-01-01')),
    end: startOfDay(parseISO('2018-02-01'))
  };
  let seedDate = graphRange.start;

  test(`has all the correct properties`, () => {
    let resolvedTestData = transactionNoReoccur({ transaction, seedDate });
    expect(resolvedTestData).toHaveProperty('date');
    expect(resolvedTestData).toHaveProperty('y');
  });

  test(`returns the same date`, () => {
    let resolvedTestData = transactionNoReoccur({ transaction, seedDate });
    expect(
      differenceInCalendarDays(parseISO(transaction.start))(
        resolvedTestData.date
      )
    ).toBe(0);
  });
});
