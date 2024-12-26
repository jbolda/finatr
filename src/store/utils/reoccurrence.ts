import type { TransactionWithAccount } from '../selectors/transactions';

export const toHumanReoccurrence = (transaction: TransactionWithAccount) => {
  switch (transaction.rtype) {
    case 'none':
      return `On ${transaction.start}`;
    case 'day':
      return `Every ${transaction.cycle === 1 ? 'day' : `${transaction.cycle} days`}`;
    case 'day of week':
      return `Every day ${transaction.cycle}`;
    case 'day of month':
      return `On day ${transaction.cycle} of the month`;
    case 'bimonthly':
      return `On day ${transaction.cycle} of every other month`;
    case 'quarterly':
      return `on day ${transaction.cycle} of the quarter`;
    case 'semiannually':
      return `Every year on day ${transaction.cycle} and 6 months afterwards`;
    case 'annually':
      return `Every ${transaction.cycle === 1 ? 'year' : `${transaction.cycle} years`}`;
    default:
      return '';
  }
};

export const nextOccurrence = (transaction: TransactionWithAccount) => {
  return `Next on ${transaction.seedDate.toLocaleDateString()}`;
};
