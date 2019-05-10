import {
  valueOf,
  create,
  StringType,
  NumberType,
  BooleanType,
  Primitive
} from 'microstates';
import { Big } from './customTypes.js';

class AmountComputed extends Primitive {
  reference = StringType;
  operation = StringType;
  on = AmountComputed;

  get amount() {
    return this.computedAmount;
  }

  compute(references = {}) {
    if (this.operation.state) {
      return this.computedAmount
        .set(references[this.reference.state])
        .operate();
    } else {
      return references[this.reference.state];
    }
  }

  operate(references = {}) {
    console.log(this.on.compute(references).state);
    switch (this.operation.state) {
      case 'add':
        return this.computedAmount.add(this.on.compute(references).state);
      case 'minus':
        return this.computedAmount.minus(this.on.compute(references).state);
      default:
        return this.computedAmount;
    }
  }
}

class Transaction extends Primitive {
  id = StringType;
  raccount = StringType;
  description = StringType;
  category = StringType;
  type = StringType;
  start = StringType;
  rtype = StringType;
  cycle = Big;
  value = Big;
  computedAmount = AmountComputed;
  occurrences = create(NumberType, 0);
  beginAferOccurrences = create(NumberType, 0);

  get amount() {
    return this.computedAmount.compute(this.state);
  }
}

class TransactionComputed extends Transaction {
  fromAccounts = BooleanType;
  dailyRate = Big;
  y = Big;
}

export { Transaction, TransactionComputed };
