import { valueOf, StringType } from 'microstates';
import { Big } from './customTypes.js';

class Transaction {
  id = StringType;
  raccount = StringType;
  description = StringType;
  category = StringType;
  type = StringType;
  start = StringType;
  rtype = StringType;
  cycle = Big;
  value = Big;

  get state() {
    return valueOf(this);
  }
}

class TransactionComputed extends Transaction {
  dailyRate = Big;
  y = Big;
}

export { Transaction, TransactionComputed };
