import Big from 'big.js';
import parseISO from 'date-fns/fp/parseISO';
import startOfDay from 'date-fns/fp/startOfDay';

import { transactionAnnuallyReoccur } from './index.js';

describe('transactionAnnuallyReoccur', () => {
  it('has the next date', () => {
    const transaction = { start: '2018-01-01', value: Big(365) };
    const seedDate = startOfDay(parseISO('2018-01-01'));
    const next = transactionAnnuallyReoccur({
      transaction,
      seedDate,
      occurrences: Big(1)
    });
    expect(next.date).toEqual(startOfDay(parseISO('2019-01-01')));
  });

  it('has a value', () => {
    const transaction = { start: '2018-01-01', value: Big(365) };
    const seedDate = startOfDay(parseISO('2018-01-01'));
    const next = transactionAnnuallyReoccur({
      transaction,
      seedDate,
      occurrences: Big(0)
    });
    expect(Number(next.y)).toEqual(365);
  });

  it('throws on missing value', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionAnnuallyReoccur({
        transaction: { start: '2018-01-01' },
        seedDate,
        occurrences: Big(0)
      });
    }).toThrow();
  });

  it('throws on missing start', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionAnnuallyReoccur({
        transaction: { value: Big(120) },
        seedDate,
        occurrences: Big(0)
      });
    }).toThrow();
  });

  it('throws on missing occurrences', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionAnnuallyReoccur({
        transaction: { start: '2018-01-01', value: Big(120) },
        seedDate
      });
    }).toThrow();
  });

  it('fails if transaction is null', () => {
    const seedDate = startOfDay(parseISO('2018-01-01'));
    expect(() => {
      transactionAnnuallyReoccur({ transaction: null, seedDate });
    }).toThrow();
  });

  it('fails if prevDate is null', () => {
    const transaction = { value: 365 };
    expect(() => {
      generateModification({ transaction, prevDate: null });
    }).toThrow();
  });
});
