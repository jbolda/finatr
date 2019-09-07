import Big from 'big.js';
import startOfDay from 'date-fns/fp/startOfDay';

import { transactionSemiannuallyReoccur } from './index.js';

describe('transactionSemiannuallyReoccur', () => {
  it('has the next date', () => {
    const transaction = { start: startOfDay('2018-01-01'), value: Big(10) };
    const seedDate = startOfDay('2018-03-01');
    const next = transactionSemiannuallyReoccur({
      transaction,
      seedDate,
      occurrences: Big(0)
    });
    expect(next.date).toEqual(startOfDay('2018-07-01'));
  });

  it('has a value', () => {
    const transaction = { start: startOfDay('2018-01-01'), value: Big(10) };
    const seedDate = startOfDay('2018-03-01');
    const next = transactionSemiannuallyReoccur({
      transaction,
      seedDate,
      occurrences: Big(0)
    });
    expect(Number(next.y)).toEqual(10);
  });

  it('throws on missing value', () => {
    const seedDate = startOfDay('2018-01-01');
    expect(() => {
      transactionSemiannuallyReoccur({
        transaction: { start: startOfDay('2018-01-01') },
        seedDate,
        occurrences: Big(0)
      });
    }).toThrow();
  });

  it('throws on missing start', () => {
    const seedDate = startOfDay('2018-01-01');
    expect(() => {
      transactionSemiannuallyReoccur({
        transaction: { value: Big(15) },
        seedDate,
        occurrences: Big(0)
      });
    }).toThrow();
  });

  it('throws on missing occurrences', () => {
    const seedDate = startOfDay('2018-01-01');
    expect(() => {
      transactionSemiannuallyReoccur({
        transaction: { start: startOfDay('2018-01-01'), value: Big(10) },
        seedDate
      });
    }).toThrow();
  });

  it('fails if transaction is null', () => {
    const seedDate = startOfDay('2018-01-01');
    expect(() => {
      transactionSemiannuallyReoccur({ transaction: null, seedDate });
    }).toThrow();
  });

  it('fails if prevDate is null', () => {
    const transaction = { value: 182.5 };
    expect(() => {
      generateModification({
        transaction,
        prevDate: null
      });
    }).toThrow();
  });
});
