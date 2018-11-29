import {
  valueOf,
  create,
  StringType,
  NumberType,
  BooleanType
} from 'microstates';
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
  occurrences = create(NumberType, 0);
  beginAferOccurrences = create(NumberType, 0);

  get state() {
    return valueOf(this);
  }
}

class TransactionComputed extends Transaction {
  fromAccounts = BooleanType;
  dailyRate = Big;
  y = Big;
}

export { Transaction, TransactionComputed };
