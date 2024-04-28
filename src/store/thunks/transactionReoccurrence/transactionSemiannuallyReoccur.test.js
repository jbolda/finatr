import { USD } from '@dinero.js/currencies';
import { test, expect } from '@playwright/experimental-ct-react17';
import parseISO from 'date-fns/fp/parseISO/index.js';
import startOfDay from 'date-fns/fp/startOfDay/index.js';
import { dinero, toUnits } from 'dinero.js';

import { transactionSemiannuallyReoccur } from './index.ts';

test.describe('transactionSemiannuallyReoccur', () => {
  test('has the next date', () => {
    const transaction = {
      start: '2018-01-01',
      value: dinero({ amount: 10, currency: USD })
    };
    const seedDate = startOfDay(parseISO('2018-03-01'));
    const next = transactionSemiannuallyReoccur({
      transaction,
      seedDate,
      occurrences: 0
    });
    expect(next.date).toEqual(startOfDay(parseISO('2018-07-01')));
  });

  test('has a value', () => {
    const transaction = {
      start: '2018-01-01',
      value: dinero({ amount: 1000, currency: USD })
    };
    const seedDate = startOfDay(parseISO('2018-03-01'));
    const next = transactionSemiannuallyReoccur({
      transaction,
      seedDate,
      occurrences: 0
    });
    expect(toUnits(next.y)[0]).toEqual(10);
  });

  test('throws on missing value', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionSemiannuallyReoccur({
        transaction: { start: '2018-01-01' },
        seedDate,
        occurrences: 0
      });
    }).toThrow();
  });

  test('throws on missing start', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionSemiannuallyReoccur({
        transaction: { value: dinero({ amount: 15, currency: USD }) },
        seedDate,
        occurrences: 0
      });
    }).toThrow();
  });

  test('throws on missing occurrences', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionSemiannuallyReoccur({
        transaction: {
          start: '2018-01-01',
          value: dinero({ amount: 10, currency: USD })
        },
        seedDate
      });
    }).toThrow();
  });

  test('fails if transaction is null', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionSemiannuallyReoccur({ transaction: null, seedDate });
    }).toThrow();
  });

  test('fails if prevDate is null', () => {
    const transaction = {
      value: dinero({ amount: 1825, scale: 1, currency: USD })
    };
    expect(() => {
      generateModification({
        transaction,
        prevDate: null
      });
    }).toThrow();
  });
});
