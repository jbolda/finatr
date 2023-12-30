import { test, expect } from '@playwright/experimental-ct-react17';
import Big from 'big.js';
import parseISO from 'date-fns/fp/parseISO/index.js';
import startOfDay from 'date-fns/fp/startOfDay/index.js';

import { transactionAnnuallyReoccur } from './index.js';

test.describe('transactionAnnuallyReoccur', () => {
  test('has the next date', () => {
    const transaction = { start: '2018-01-01', value: Big(365) };
    const seedDate = startOfDay(parseISO('2018-01-01'));
    const next = transactionAnnuallyReoccur({
      transaction,
      seedDate,
      occurrences: Big(1)
    });
    expect(next.date).toEqual(startOfDay(parseISO('2019-01-01')));
  });

  test('has a value', () => {
    const transaction = { start: '2018-01-01', value: Big(365) };
    const seedDate = startOfDay(parseISO('2018-01-01'));
    const next = transactionAnnuallyReoccur({
      transaction,
      seedDate,
      occurrences: Big(0)
    });
    expect(Number(next.y)).toEqual(365);
  });

  test('throws on missing value', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionAnnuallyReoccur({
        transaction: { start: '2018-01-01' },
        seedDate,
        occurrences: Big(0)
      });
    }).toThrow();
  });

  test('throws on missing start', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionAnnuallyReoccur({
        transaction: { value: Big(120) },
        seedDate,
        occurrences: Big(0)
      });
    }).toThrow();
  });

  test('throws on missing occurrences', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionAnnuallyReoccur({
        transaction: { start: '2018-01-01', value: Big(120) },
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
    const transaction = { value: 365 };
    expect(() => {
      generateModification({ transaction, prevDate: null });
    }).toThrow();
  });
});
