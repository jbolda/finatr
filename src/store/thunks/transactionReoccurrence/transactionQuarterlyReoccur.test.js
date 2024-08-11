import { USD } from '@dinero.js/currencies';
import { test, expect } from '@playwright/experimental-ct-react17';
import parseISO from 'date-fns/fp/parseISO/index.js';
import startOfDay from 'date-fns/fp/startOfDay/index.js';
import { dinero, toUnits } from 'dinero.js';

import { transactionQuarterlyReoccur } from './index.ts';

test.describe('transactionQuarterlyReoccur', () => {
  test('has the next date', () => {
    const transaction = {
      value: dinero({ amount: 10, currency: USD }),
      cycle: 1
    };
    const seedDate = startOfDay(parseISO('2018-02-01'));
    const next = transactionQuarterlyReoccur({
      transaction,
      seedDate
    });
    expect(next.date).toEqual(startOfDay(parseISO('2018-05-01')));
  });

  test('four quarters is a year', () => {
    const transaction = {
      value: dinero({ amount: 135, currency: USD }),
      cycle: 4
    };
    const seedDate = startOfDay(parseISO('2023-05-17'));
    const next = transactionQuarterlyReoccur({
      transaction,
      seedDate
    });
    expect(next.date).toEqual(startOfDay(parseISO('2024-05-17')));
  });

  test('throws when transaction.cycle=null', () => {
    const transaction = { value: dinero({ amount: 10, currency: USD }) };
    const seedDate = startOfDay(parseISO('2018-02-01'));
    expect(() => {
      transactionQuarterlyReoccur({
        transaction,
        seedDate
      });
    }).toThrow();
  });

  test('has a value', () => {
    const transaction = {
      value: dinero({ amount: 1000, currency: USD }),
      cycle: 1
    };
    const seedDate = startOfDay(parseISO('2018-01-01'));
    const next = transactionQuarterlyReoccur({
      transaction,
      seedDate
    });
    expect(toUnits(next.y)[0]).toEqual(10);
  });

  test('throws on missing value', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionQuarterlyReoccur({
        transaction: {},
        seedDate
      });
    }).toThrow();
  });

  test('fails if transaction is null', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionQuarterlyReoccur({ transaction: null, seedDate });
    }).toThrow();
  });

  test('fails if prevDate is null', () => {
    const transaction = {
      value: dinero({ amount: 1825, scale: 1, currency: USD }),
      cycle: 1
    };
    expect(() => {
      generateModification({ transaction, prevDate: null });
    }).toThrow();
  });
});
