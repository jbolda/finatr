import { createSelector } from 'starfx';

import { schema, type Account, type Transaction } from '~/src/store/schema.ts';

export interface TransactionWithAccount extends Transaction {
  raccountMeta: Account;
  transferInMeta: Account;
}

export const transactionsWithAccounts = createSelector(
  schema.accounts.selectTable,
  schema.transactions.selectTableAsList,
  (accounts, transactions) => {
    const tA: TransactionWithAccount[] = transactions.map((t) => {
      const account = accounts?.[t.raccount] ?? { name: t.raccount };
      const accountTransferIn = !t.transferIn
        ? null
        : (accounts?.[t.transferIn] ?? { name: t.transferIn });
      const merged = {
        ...t,
        raccount: account.name,
        raccountMeta: account,
        ...(accountTransferIn
          ? {
              transferIn: accountTransferIn.name,
              transferInMeta: accountTransferIn
            }
          : {})
      };
      return merged;
    });
    return tA;
  }
);
