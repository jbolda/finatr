import { test, expect } from '@playwright/experimental-ct-react17';
import Big from 'big.js';
import parseISO from 'date-fns/fp/parseISO/index.js';
import startOfDay from 'date-fns/fp/startOfDay/index.js';

import { transactionSemiannuallyReoccur } from './index.ts';

test.describe('transactionSemiannuallyReoccur', () => {
  test('has the next date', () => {
    const transaction = { start: '2018-01-01', value: Big(10) };
    const seedDate = startOfDay(parseISO('2018-03-01'));
    const next = transactionSemiannuallyReoccur({
      transaction,
      seedDate,
      occurrences: Big(0)
    });
    expect(next.date).toEqual(startOfDay(parseISO('2018-07-01')));
  });

  test('has a value', () => {
    const transaction = { start: '2018-01-01', value: Big(10) };
    const seedDate = startOfDay(parseISO('2018-03-01'));
    const next = transactionSemiannuallyReoccur({
      transaction,
      seedDate,
      occurrences: Big(0)
    });
    expect(Number(next.y)).toEqual(10);
  });

  test('throws on missing value', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionSemiannuallyReoccur({
        transaction: { start: '2018-01-01' },
        seedDate,
        occurrences: Big(0)
      });
    }).toThrow();
  });

  test('throws on missing start', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionSemiannuallyReoccur({
        transaction: { value: Big(15) },
        seedDate,
        occurrences: Big(0)
      });
    }).toThrow();
  });

  test('throws on missing occurrences', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionSemiannuallyReoccur({
        transaction: { start: '2018-01-01', value: Big(10) },
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
    const transaction = { value: 182.5 };
    expect(() => {
      generateModification({
        transaction,
        prevDate: null
      });
    }).toThrow();
  });
});
