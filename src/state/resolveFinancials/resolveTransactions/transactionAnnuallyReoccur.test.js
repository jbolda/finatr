import Big from 'big.js';
import startOfDay from 'date-fns/fp/startOfDay';

import { transactionAnnuallyReoccur } from './index.js';

describe('transactionAnnuallyReoccur', () => {
  it('has the next date', () => {
    const transaction = { value: Big(365) };
    const seedDate = startOfDay('2018-01-01');
    const next = transactionAnnuallyReoccur({
      transaction,
      seedDate
    });
    expect(next.date).toEqual(startOfDay('2019-01-01'));
  });

  it('has a value', () => {
    const transaction = { value: Big(365) };
    const seedDate = startOfDay('2018-01-01');
    const next = transactionAnnuallyReoccur({
      transaction,
      seedDate
    });
    expect(Number(next.y)).toEqual(365);
  });

  it('throws on missing value', () => {
    const seedDate = startOfDay('2018-01-01');
    expect(() => {
      transactionAnnuallyReoccur({
        transaction: {},
        seedDate
      });
    }).toThrow();
  });

  it('fails if transaction is null', () => {
    const seedDate = startOfDay('2018-01-01');
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
