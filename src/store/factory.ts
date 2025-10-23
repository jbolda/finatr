import { USD } from '@dinero.js/currencies';
import { dinero } from 'dinero.js';

import type {
  AmountVehicle,
  RepeatType,
  TransactionType,
  ValueType
} from './schema';

export const emptyAccount = {
  id: 'initial',
  name: 'initial',
  // store serializable snapshots in the persisted state
  starting: dinero({ amount: 0, currency: USD }).toJSON(),
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
  rtype: 'none' as RepeatType,
  cycle: 0,
  // serializable snapshots
  value: dinero({ amount: 0, currency: USD }).toJSON(),
  occurrences: 0,
  beginAfterOccurrences: 0,
  dailyRate: dinero({ amount: 0, currency: USD }).toJSON()
};
