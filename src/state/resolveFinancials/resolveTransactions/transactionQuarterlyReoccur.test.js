import Big from 'big.js';
import startOfDay from 'date-fns/fp/startOfDay';

import { transactionQuarterlyReoccur } from './index.js';

describe('transactionQuarterlyReoccur', () => {
  it('has the next date', () => {
    const transaction = { value: Big(10), cycle: Big(1) };
    const seedDate = startOfDay('2018-02-01');
    const next = transactionQuarterlyReoccur({
      transaction,
      seedDate
    });
    expect(next.date).toEqual(startOfDay('2018-05-01'));
  });

  it('throws when transaction.cycle=null', () => {
    const transaction = { value: Big(10) };
    const seedDate = startOfDay('2018-02-01');
    expect(() => {
      transactionQuarterlyReoccur({
        transaction,
        seedDate
      });
    }).toThrow();
  });

  it('has a value', () => {
    const transaction = { value: Big(10), cycle: Big(1) };
    const seedDate = startOfDay('2018-01-01');
    const next = transactionQuarterlyReoccur({
      transaction,
      seedDate
    });
    expect(Number(next.y)).toEqual(10);
  });

  it('throws on missing value', () => {
    const seedDate = startOfDay('2018-01-01');
    expect(() => {
      transactionQuarterlyReoccur({
        transaction: {},
        seedDate
      });
    }).toThrow();
  });

  it('fails if transaction is null', () => {
    const seedDate = startOfDay('2018-01-01');
    expect(() => {
      transactionQuarterlyReoccur({ transaction: null, seedDate });
    }).toThrow();
  });

  it('fails if prevDate is null', () => {
    const transaction = { value: Big(182.5), cycle: Big(1) };
    expect(() => {
      generateModification({ transaction, prevDate: null });
    }).toThrow();
  });
});
