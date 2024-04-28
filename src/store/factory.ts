import { USD } from '@dinero.js/currencies';
import { dinero } from 'dinero.js';

export const emptyAccount = {
  name: 'initial',
  starting: dinero({ amount: 0, currency: USD }),
  interest: { amount: 0, scale: 1 },
  vehicle: '',
  payback: []
};

export const emptyTransaction = {
  id: '0',
  raccount: '',
  description: '',
  category: 'job',
  type: 'income',
  start: '',
  end: '',
  rtype: '',
  cycle: 0,
  value: dinero({ amount: 0, currency: USD }),
  occurrences: 0,
  beginAferOccurrences: 0,
  dailyRate: dinero({ amount: 0, currency: USD })
};
