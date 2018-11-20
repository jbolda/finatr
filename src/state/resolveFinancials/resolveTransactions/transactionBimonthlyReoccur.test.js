import Big from 'big.js';
import startOfDay from 'date-fns/fp/startOfDay';

import { transactionBimonthlyReoccur } from './index.js';

describe('transactionBimonthlyReoccur', () => {
  it('has the next date', () => {
    const transaction = { value: Big(10), cycle: Big(1) };
    const seedDate = startOfDay('2018-01-01');
    const next = transactionBimonthlyReoccur({
      transaction,
      seedDate
    });
    expect(next.date).toEqual(startOfDay('2018-03-01'));
  });

  it('throws when cycle=null', () => {
    const transaction = { value: Big(10) };
    const seedDate = startOfDay('2018-01-01');
    expect(() => {
      transactionBimonthlyReoccur({
        transaction,
        seedDate
      });
    }).toThrow();
  });

  it('throws on missing value', () => {
    const seedDate = startOfDay('2018-01-01');
    expect(() => {
      transactionBimonthlyReoccur({
        transaction: {},
        seedDate
      });
    }).toThrow();
  });

  it('calculates a cycle of 2 (4 months)', () => {
    const transaction = { value: Big(10), cycle: Big(2) };
    const seedDate = startOfDay('2018-01-01');
    const next = transactionBimonthlyReoccur({
      transaction,
      seedDate
    });
    expect(next.date).toEqual(startOfDay('2018-05-01'));
  });

  it('has a value', () => {
    const transaction = { value: Big(10), cycle: Big(1) };
    const seedDate = startOfDay('2018-01-01');
    const next = transactionBimonthlyReoccur({
      transaction,
      seedDate
    });
    expect(Number(next.y)).toEqual(10);
  });

  it('fails if transaction is null', () => {
    const seedDate = startOfDay('2018-01-01');
    expect(() => {
      transactionBimonthlyReoccur({ transaction: null, seedDate });
    }).toThrow();
  });

  it('fails if seedDate is null', () => {
    expect(() => {
      transactionBimonthlyReoccur({ transaction: {}, seedDate: null });
    }).toThrow();
  });
});
