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
  references = { Big };
  on = relationship(({ value, parentValue }) => ({
    Type: AmountComputed,
    value: {
      ...value,
      references: parentValue.references
    }
  }));

  get compute() {
    if (this.operation.state && !!this.on) {
      return this.operate;
    } else {
      return this.references.entries[this.reference.state];
    }
  }

  get operate() {
    switch (this.operation.state) {
      case 'add':
        return this.references.entries[this.reference.state].add(
          this.on.compute.toNumber
        );
      case 'minus':
        return this.references.entries[this.reference.state].minus(
          this.on.compute.toNumber
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
  references = { Big };
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
