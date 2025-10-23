import { toDecimal } from 'dinero.js';
import type { Key } from 'react-aria';

import type { TransactionWithAccount } from '~/src/store/selectors/transactions';

export const navigateToTransactionForm = (
  transaction: TransactionWithAccount
) => {
  return {
    state: {
      navigateTo:
        typeof window !== 'undefined' ? window.location.pathname : '/',
      transaction: {
        id: transaction.id,
        raccount: transaction.raccountMeta.id,
        transferIn: transaction.transferInMeta?.id,
        description: transaction.description,
        category: transaction.category,
        type: transaction.type,
        start: transaction.start.toString(),
        ending: transaction.ending?.toString() ?? 'never',
        rtype: transaction.rtype,
        beginAfterOccurrences: transaction.beginAfterOccurrences ?? 0,
        cycle: transaction.cycle,
        value: parseFloat(toDecimal(transaction.value)),
        valueType: transaction.valueType ?? 'static'
      }
    }
  };
};

export type TransactionFilter =
  | 'all'
  | Set<'income' | 'expense' | 'transfer' | Key>;
