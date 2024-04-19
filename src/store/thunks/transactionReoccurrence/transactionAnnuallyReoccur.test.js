import { USD } from '@dinero.js/currencies';
import { test, expect } from '@playwright/experimental-ct-react17';
import parseISO from 'date-fns/fp/parseISO/index.js';
import startOfDay from 'date-fns/fp/startOfDay/index.js';
import { dinero, toUnits } from 'dinero.js';

import { transactionAnnuallyReoccur } from './index.ts';

test.describe('transactionAnnuallyReoccur', () => {
  test('has the next date', () => {
    const transaction = {
      start: '2018-01-01',
      value: dinero({ amount: 365, currency: USD }),
      occurrences: 1
    };
    const seedDate = startOfDay(parseISO('2018-01-01'));
    const next = transactionAnnuallyReoccur({
      transaction,
      seedDate,
      occurrences: 1
    });
    expect(next.date).toEqual(startOfDay(parseISO('2019-01-01')));
  });

  test('has a value', () => {
    const transaction = {
      start: '2018-01-01',
      value: dinero({ amount: 36500, currency: USD }),
      occurrences: 0
    };
    const seedDate = startOfDay(parseISO('2018-01-01'));
    const next = transactionAnnuallyReoccur({
      transaction,
      seedDate,
      occurrences: 0
    });
    expect(toUnits(next.y)[0]).toEqual(365);
  });

  test('throws on missing value', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionAnnuallyReoccur({
        transaction: { start: '2018-01-01', occurrences: 0 },
        seedDate,
        occurrences: 0
      });
    }).toThrow();
  });

  test('throws on missing start', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionAnnuallyReoccur({
        transaction: {
          value: dinero({ amount: 120, currency: USD }),
          occurrences: 0
        },
        seedDate,
        occurrences: 0
      });
    }).toThrow();
  });

  test('throws on missing occurrences', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionAnnuallyReoccur({
        transaction: {
          start: '2018-01-01',
          value: dinero({ amount: 120, currency: USD }),
          occurrences: 0
        },
        seedDate
      });
    }).toThrow();
  });

  test('fails if transaction is null', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionAnnuallyReoccur({ transaction: null, seedDate });
    }).toThrow();
  });

  test('fails if prevDate is null', () => {
    const transaction = {
      value: dinero({ amount: 365, currency: USD }),
      occurrences: 0
    };
    expect(() => {
      generateModification({ transaction, prevDate: null });
    }).toThrow();
  });
});
