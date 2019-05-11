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
    if (this.operation.state && !!this.on) {
      return this.operate;
    } else {
      return this.references.entries[this.reference.state];
    }
  }

  get operate() {
    // this needs to be a Big type, can it be set in the relationship?
    console.log(this.references.entries[this.reference.state]);
    switch (this.operation.state) {
      case 'add':
        return this.references.entries[this.reference.state].add(
          this.on.compute(references).state
        );
      case 'minus':
        return this.references.entries[this.reference.state].minus(
          this.on.compute(references).state
        );
      default:
        return this.references.entries[this.reference.state];
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
