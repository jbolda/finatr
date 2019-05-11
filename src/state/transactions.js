import {
  valueOf,
  create,
  relationship,
  StringType,
  NumberType,
  BooleanType,
  ObjectType,
  Primitive
} from 'microstates';
import { Big } from './customTypes.js';

class AmountComputed extends Primitive {
  operation = StringType;
  reference = StringType;
  references = ObjectType;
  on = AmountComputed;

  get compute() {
    if (this.operation.state) {
      return this.computedAmount
        .set(references[this.reference.state])
        .operate();
    } else {
      return this.references.entries[this.reference.state];
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
  computedAmount = relationship(({ value, parentValue }) => ({
    Type: AmountComputed,
    value: {
      ...value,
      references: { value: parentValue.value, ...parentValue.references }
    }
  }));
  occurrences = create(NumberType, 0);
  beginAferOccurrences = create(NumberType, 0);

  get amount() {
    return this.computedAmount.compute;
  }
}

class TransactionComputed extends Transaction {
  fromAccounts = BooleanType;
  dailyRate = Big;
  y = Big;
}

export { Transaction, TransactionComputed };
