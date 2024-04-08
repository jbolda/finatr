import { test, expect } from '@playwright/experimental-ct-react17';
import Big from 'big.js';
import parseISO from 'date-fns/fp/parseISO/index.js';
import startOfDay from 'date-fns/fp/startOfDay/index.js';

import { transactionQuarterlyReoccur } from './index.ts';

test.describe('transactionQuarterlyReoccur', () => {
  test('has the next date', () => {
    const transaction = { value: Big(10), cycle: Big(1) };
    const seedDate = startOfDay(parseISO('2018-02-01'));
    const next = transactionQuarterlyReoccur({
      transaction,
      seedDate
    });
    expect(next.date).toEqual(startOfDay(parseISO('2018-05-01')));
  });

  test('throws when transaction.cycle=null', () => {
    const transaction = { value: Big(10) };
    const seedDate = startOfDay(parseISO('2018-02-01'));
    expect(() => {
      transactionQuarterlyReoccur({
        transaction,
        seedDate
      });
    }).toThrow();
  });

  test('has a value', () => {
    const transaction = { value: Big(10), cycle: Big(1) };
    const seedDate = startOfDay(parseISO('2018-01-01'));
    const next = transactionQuarterlyReoccur({
      transaction,
      seedDate
    });
    expect(Number(next.y)).toEqual(10);
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
    const transaction = { value: Big(182.5), cycle: Big(1) };
    expect(() => {
      generateModification({ transaction, prevDate: null });
    }).toThrow();
  });
});
