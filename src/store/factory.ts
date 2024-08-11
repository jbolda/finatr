import { USD } from '@dinero.js/currencies';
import { dinero } from 'dinero.js';

import type { AmountVehicle, TransactionType, ValueType } from './schema';

export const emptyAccount = {
  id: 'initial',
  name: 'initial',
  starting: dinero({ amount: 0, currency: USD }),
  interest: { amount: 0, scale: 1 },
  vehicle: 'operating' as AmountVehicle
};

export const emptyTransaction = {
  id: '0',
  valueType: 'static' as ValueType,
  raccount: '',
  description: '',
  category: 'job',
  type: 'income' as TransactionType,
  start: '',
  ending: '',
  rtype: '',
  cycle: 0,
  value: dinero({ amount: 0, currency: USD }),
  occurrences: 0,
  beginAfterOccurrences: 0,
  dailyRate: dinero({ amount: 0, currency: USD })
};
