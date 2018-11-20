import { valueOf, create, StringType, NumberType } from 'microstates';
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
  visibleOccurrences = create(NumberType, 0);
  generatedOccurrences = create(NumberType, 0);
  begingAfterVisibleOccurrences = create(NumberType, 0);
  begingAfterGeneratedOccurrences = create(NumberType, 0);

  get state() {
    return valueOf(this);
  }
}

class TransactionComputed extends Transaction {
  dailyRate = Big;
  y = Big;
}

export { Transaction, TransactionComputed };
