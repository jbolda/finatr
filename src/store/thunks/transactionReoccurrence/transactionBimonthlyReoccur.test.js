import { USD } from '@dinero.js/currencies';
import { test, expect } from '@playwright/experimental-ct-react17';
import parseISO from 'date-fns/fp/parseISO/index.js';
import startOfDay from 'date-fns/fp/startOfDay/index.js';
import { dinero, toUnits } from 'dinero.js';

import { transactionBimonthlyReoccur } from './index.ts';

test.describe('transactionBimonthlyReoccur', () => {
  test('has the next date', () => {
    const transaction = {
      value: dinero({ amount: 10, currency: USD }),
      cycle: 1
    };
    const seedDate = startOfDay(parseISO('2018-01-01'));
    const next = transactionBimonthlyReoccur({
      transaction,
      seedDate
    });
    expect(next.date).toEqual(startOfDay(parseISO('2018-03-01')));
  });

  test('throws when cycle=null', () => {
    const transaction = { value: dinero({ amount: 10, currency: USD }) };
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionBimonthlyReoccur({
        transaction,
        seedDate
      });
    }).toThrow();
  });

  test('throws on missing value', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionBimonthlyReoccur({
        transaction: {},
        seedDate
      });
    }).toThrow();
  });

  test('calculates a cycle of 2 (4 months)', () => {
    const transaction = {
      value: dinero({ amount: 10, currency: USD }),
      cycle: 2
    };
    const seedDate = startOfDay(parseISO('2018-01-01'));
    const next = transactionBimonthlyReoccur({
      transaction,
      seedDate
    });
    expect(next.date).toEqual(startOfDay(parseISO('2018-05-01')));
  });

  test('has a value', () => {
    const transaction = {
      value: dinero({ amount: 1000, currency: USD }),
      cycle: 1
    };
    const seedDate = startOfDay(parseISO('2018-01-01'));
    const next = transactionBimonthlyReoccur({
      transaction,
      seedDate
    });
    expect(toUnits(next.y)[0]).toEqual(10);
  });

  test('fails if transaction is null', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionBimonthlyReoccur({ transaction: null, seedDate });
    }).toThrow();
  });

  test('fails if seedDate is null', () => {
    expect(() => {
      transactionBimonthlyReoccur({ transaction: {}, seedDate: null });
    }).toThrow();
  });
});
