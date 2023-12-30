import { test, expect } from '@playwright/experimental-ct-react17';
import Big from 'big.js';
import parseISO from 'date-fns/fp/parseISO/index.js';
import startOfDay from 'date-fns/fp/startOfDay/index.js';

import { transactionBimonthlyReoccur } from './index.js';

test.describe('transactionBimonthlyReoccur', () => {
  test('has the next date', () => {
    const transaction = { value: Big(10), cycle: Big(1) };
    const seedDate = startOfDay(parseISO('2018-01-01'));
    const next = transactionBimonthlyReoccur({
      transaction,
      seedDate
    });
    expect(next.date).toEqual(startOfDay(parseISO('2018-03-01')));
  });

  test('throws when cycle=null', () => {
    const transaction = { value: Big(10) };
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
    const transaction = { value: Big(10), cycle: Big(2) };
    const seedDate = startOfDay(parseISO('2018-01-01'));
    const next = transactionBimonthlyReoccur({
      transaction,
      seedDate
    });
    expect(next.date).toEqual(startOfDay(parseISO('2018-05-01')));
  });

  test('has a value', () => {
    const transaction = { value: Big(10), cycle: Big(1) };
    const seedDate = startOfDay(parseISO('2018-01-01'));
    const next = transactionBimonthlyReoccur({
      transaction,
      seedDate
    });
    expect(Number(next.y)).toEqual(10);
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
