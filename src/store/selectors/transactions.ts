import { createSelector } from 'starfx';

import { schema, type Account, type Transaction } from '~/src/store/schema.ts';

export interface TransactionWithAccount extends Transaction {
  raccountMeta: Account;
}

export const transactionsWithAccounts = createSelector(
  schema.accounts.selectTable,
  schema.transactions.selectTableAsList,
  (accounts, transactions) => {
    const tA: TransactionWithAccount[] = transactions.map((t) => {
      const account = accounts?.[t.raccount] ?? { name: t.raccount };
      const merged = {
        ...t,
        raccount: account.name,
        raccountMeta: account
      };
      return merged;
    });
    return tA;
  }
);
